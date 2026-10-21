
/*

simpleGuard.js -- the minimal single-order guard. Does exactly three things:

1. On a BUY fill (order_update): record the actual fill price and place ONE
   resting SELL LIMIT target at fill + TARGET_PCT%.
2. Keep a breach level = lowest low of the last 3 COMPLETED 1-min candles
   (refreshed every 15s). The live forming candle is never part of the
   level -- it is the candle being tested against it.
3. Watch every live tick: the moment LTP <= breach level, MODIFY that same
   resting order into a marketable LIMIT (never a second SELL -- Kite
   margin-checks a second resting SELL as a naked short and rejects it).

Nothing else. No give-back, no stall, no SL conversion, no target locking.
Run INSTEAD of stopLossGuard.js, never alongside it (both would place a
target on the same buy -> duplicate SELL -> margin rejection).

*/

console.log("🚀 simpleGuard starting", new Date().toISOString());
console.log("CWD:", process.cwd());

process.on('unhandledRejection', (reason) => {
    console.error('🔥 UNHANDLED PROMISE REJECTION', reason);
});
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION', err.stack || err);
});

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { connectToDatabase } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');
const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');

const TICK = 0.05;
const TARGET_PCT = 2;              // EDIT ME: profit % of the resting target
const CANDLE_COUNT = 3;            // EDIT ME: completed candles forming the breach level
const REFRESH_MS = 15000;          // REST cache refresh (positions/orders/candles)
const TARGET_ORDER_TAG = 'TGT2PCT';
const RESTING_ORDER_STATUSES = ["TRIGGER PENDING", "OPEN"];
const OPTION_EXCHANGES = ['NFO', 'BFO'];

function roundDownToTick(value) {
    return Math.floor(value / TICK) * TICK;
}

// Target rounds UP so the locked profit is never less than TARGET_PCT.
function roundUpToTick(value) {
    return Math.ceil(value / TICK) * TICK;
}

/*
What to place on a BUY fill -- editable from the chartApp page, stored in
guardSettings.json next to this file. Read fresh at every placement so a
change applies to the NEXT fill without a restart.
  firstOrder: 'target' -> SELL LIMIT at buy + targetPct%
              'sl'     -> SELL SL, trigger at buy - slPct%
*/
const SETTINGS_FILE = path.join(__dirname, 'guardSettings.json');
function guardSettings() {
    const def = { firstOrder: 'target', targetPct: TARGET_PCT, slPct: 2 };
    try {
        const s = { ...def, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
        if (!['target', 'sl'].includes(s.firstOrder)) s.firstOrder = def.firstOrder;
        if (!(s.targetPct > 0 && s.targetPct <= 50)) s.targetPct = def.targetPct;
        if (!(s.slPct > 0 && s.slPct <= 50)) s.slPct = def.slPct;
        return s;
    } catch (e) {
        return def;
    }
}

/*
Files shared with the chartApp page:
- guardState.json    (written here): the frozen breach level per token, so
                     the page can draw the "guard SL" line on the chart.
- breachOverride.json (written by chartApp when the line is dragged): read
                     every refresh, replaces the frozen level. Cleared when
                     the position closes so a re-entry freezes fresh.
- tradeLog.json      (written here): one record per closed trade — the P&L
                     history the page shows.
*/
const STATE_FILE = path.join(__dirname, 'guardState.json');
const OVERRIDE_FILE = path.join(__dirname, 'breachOverride.json');
const TRADE_LOG_FILE = path.join(__dirname, 'tradeLog.json');

const instrumentLotSizeByToken = new Map();

// instrument_token -> actual entry fill of the CURRENT lot (from the BUY
// order_update). Kite's position.average_price blends every buy of the day
// and must not be used.
const actualBuyPriceByToken = new Map();

// per-token caches the tick handler reads (kept current by refreshCache)
const cachedPositionByToken = new Map();
const cachedRestingOrdersByToken = new Map();
const breachLevelByToken = new Map();
const breachSymbolByToken = new Map();

function writeGuardState() {
    try {
        const levels = {};
        for (const [t, lvl] of breachLevelByToken) {
            levels[t] = { level: lvl, tradingsymbol: breachSymbolByToken.get(t) || '' };
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify({ updated: new Date().toISOString(), levels }, null, 2));
    } catch (e) { console.log('⚠️ guardState write failed', e.message || e); }
}

// a level dragged on the chart wins over the frozen one
function applyBreachOverrides() {
    let ov;
    try { ov = JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf8')); } catch (e) { return; }
    let changed = false;
    for (const [tok, lvl] of Object.entries(ov)) {
        const token = Number(tok), level = Number(lvl);
        if (!cachedPositionByToken.has(token) || !(level > 0)) continue;
        if (breachLevelByToken.get(token) != level) {
            breachLevelByToken.set(token, level);
            console.log(`✏️ Breach level set from chart for ${breachSymbolByToken.get(token) || token}: ${level}`);
            changed = true;
        }
    }
    if (changed) writeGuardState();
}

// the override must not outlive its trade: a re-entry freezes a fresh level
function clearOverride(token) {
    try {
        if (!fs.existsSync(OVERRIDE_FILE)) return;
        const ov = JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf8'));
        if (token == null) {
            if (Object.keys(ov).length > 0) fs.writeFileSync(OVERRIDE_FILE, '{}');
            return;
        }
        if (ov[token] != null) { delete ov[token]; fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(ov, null, 2)); }
    } catch (e) { /* no file yet */ }
}

/*
One record per closed trade. Entry comes from the BUY fill we tracked (never
Kite's blended average_price); qty = the day's sold qty not yet logged, so
chunked exits and re-entries in the same symbol each log once, correctly.
*/
function logClosedTrade({ tradingsymbol, position, sellPrice, fallbackQty, token }) {
    try {
        let log = [];
        try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
        const today = dayjs().format('YYYY-MM-DD');
        const already = log.filter(t => t.date == today && t.tradingsymbol == tradingsymbol)
            .reduce((s, t) => s + (t.quantity || 0), 0);
        const qty = Math.max(0, (position ? position.day_sell_quantity : 0) - already) || Number(fallbackQty) || 0;
        const buy = actualBuyPriceByToken.get(token);
        const pnl = (buy != null && sellPrice > 0 && qty > 0)
            ? +((sellPrice - buy) * qty).toFixed(2)
            : (position ? position.pnl : null); // entry unknown (restart): symbol's day total is the best we have
        log.push({
            date: today, time: dayjs().format('HH:mm:ss'), tradingsymbol,
            quantity: qty, buy: buy != null ? buy : null, sell: sellPrice || null,
            pnl, symbolDayPnl: position ? position.pnl : null
        });
        fs.writeFileSync(TRADE_LOG_FILE, JSON.stringify(log, null, 2));
        console.log(`🧾 Trade logged: ${tradingsymbol} qty ${qty} buy ${buy} sell ${sellPrice} pnl ${pnl}`);
    } catch (err) { console.log(err, '⚠️ trade log failed'); }
}

// a modify fired from an earlier tick is still in flight for this token
const exitInProgressByToken = new Set();

const subscribedTokens = new Set();

function subscribeForLiveTicks(ticker, instrument_token) {
    const token = Number(instrument_token);
    if (subscribedTokens.has(token)) {
        return;
    }
    subscribedTokens.add(token);
    ticker.subscribe([token]);
    ticker.setMode(ticker.modeLTP, [token]);
    console.log(`📡 Subscribed to live ticks for token ${token}`);
}

/*
Places THE resting SELL on a fill: a LIMIT target or an SL, per
guardSettings.json.
*/
async function placeTargetOrder(kite, { instrument_token, tradingsymbol, exchange, quantity, buyPrice }) {

    const s = guardSettings();
    let orderPart, desc;
    if (s.firstOrder == 'sl') {
        const trigger = roundDownToTick(buyPrice * (1 - s.slPct / 100));
        const limit = roundDownToTick(trigger * 0.99); // marketable once triggered
        orderPart = { order_type: "SL", price: limit, trigger_price: trigger };
        desc = `SL trigger ${trigger} @ ${limit} (buy ${buyPrice} - ${s.slPct}%)`;
    } else {
        const targetPrice = roundUpToTick(buyPrice * (1 + s.targetPct / 100));
        orderPart = { order_type: "LIMIT", price: targetPrice };
        desc = `target ${targetPrice} (buy ${buyPrice} + ${s.targetPct}%)`;
    }

    const orderIds = await placeOrderInFreezeChunks(kite, {
        exchange: exchange || "NFO",
        tradingsymbol: tradingsymbol,
        transaction_type: "SELL",
        quantity: quantity,
        ...orderPart,
        product: "NRML",
        validity: "DAY",
        tag: TARGET_ORDER_TAG
    }, instrumentLotSizeByToken.get(Number(instrument_token)));

    console.log(`🎯 First order placed for ${tradingsymbol}: ${desc}. Order ID(s): ${orderIds.join(', ')}`);

    return orderIds;
}

/*
Breach level: min low of the last CANDLE_COUNT COMPLETED 1-min candles.
The live forming candle is excluded -- including it would be
self-referential (a retest of a low the live candle itself just made would
read as a breach).
*/
async function computeBreachLevel(kite, instrument_token) {

    const from = dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss');
    const to = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const candles = await kite.getHistoricalData(Number(instrument_token), 'minute', from, to);
    if (!candles || candles.length == 0) {
        return null;
    }

    const currentMinuteStart = dayjs().startOf('minute');
    let completed = candles.filter(c => dayjs(c.date).isBefore(currentMinuteStart));

    // first minutes of the session: nothing completed yet -- no level rather
    // than Math.min() of an empty list (+Infinity would never breach, -: fine)
    let reference = completed.slice(-CANDLE_COUNT);
    if (reference.length == 0) {
        return null;
    }

    return Math.min(...reference.map(c => c.low));
}

/*
REST refresh: positions, resting SELL orders and the breach level per token.
Also the safety net that places a missing target (e.g. a buy filled while
this process was down).
*/
async function refreshCache(kite, ticker) {

    try {

        const positions = await kite.getPositions();
        const netLong = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        cachedPositionByToken.clear();

        if (netLong.length == 0) {
            cachedRestingOrdersByToken.clear();
            if (breachLevelByToken.size > 0) {
                breachLevelByToken.clear();
                breachSymbolByToken.clear();
                writeGuardState();
            }
            clearOverride(null); // a leftover drag must never leak into the next trade
            return;
        }

        const orders = await kite.getOrders();

        for (const position of netLong) {

            const token = Number(position.instrument_token);
            cachedPositionByToken.set(token, position);
            subscribeForLiveTicks(ticker, token);

            const resting = orders.filter(
                o => o.tradingsymbol == position.tradingsymbol &&
                    o.transaction_type == "SELL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
            );
            cachedRestingOrdersByToken.set(token, resting);

            // The level is FROZEN at entry -- computed once (at the BUY
            // fill, or here once after a restart) and never recomputed
            // while the position is open.
            if (!breachLevelByToken.has(token)) {
                try {
                    const level = await computeBreachLevel(kite, token);
                    if (level != null) {
                        breachLevelByToken.set(token, level);
                        breachSymbolByToken.set(token, position.tradingsymbol);
                        writeGuardState();
                        console.log(`📏 Breach level frozen for ${position.tradingsymbol}: ${level}`);
                    }
                } catch (err) {
                    console.log(err, `⚠️ Failed computing breach level for ${position.tradingsymbol}`);
                }
            } else {
                breachSymbolByToken.set(token, position.tradingsymbol);
            }

            // safety net: position without any resting SELL -> place the target
            if (resting.length == 0 && !exitInProgressByToken.has(token)) {

                let buyPrice = actualBuyPriceByToken.get(token);
                if (buyPrice == null) {
                    const lastBuy = orders.filter(
                        o => o.tradingsymbol == position.tradingsymbol &&
                            o.transaction_type == "BUY" &&
                            o.status == "COMPLETE" &&
                            o.average_price > 0
                    ).pop();
                    buyPrice = lastBuy ? lastBuy.average_price : position.average_price;
                    actualBuyPriceByToken.set(token, buyPrice);
                }

                console.log(`⚠️ No resting SELL for ${position.tradingsymbol}, placing the first order (${guardSettings().firstOrder})`);

                try {
                    await placeTargetOrder(kite, {
                        instrument_token: token,
                        tradingsymbol: position.tradingsymbol,
                        exchange: position.exchange,
                        quantity: Math.abs(position.quantity),
                        buyPrice: buyPrice
                    });
                } catch (err) {
                    console.log(err, `❌ Failed placing target for ${position.tradingsymbol}`);
                }
            }
        }

        applyBreachOverrides();

    } catch (err) {
        console.log(err, "❌ refreshCache error");
    }
}

/*
Per-tick check: LTP at/below the breach level -> modify the resting
order(s) into a marketable LIMIT, instant exit.
*/
async function onTick(kite, tick) {

    const token = Number(tick.instrument_token);
    const ltp = tick.last_price;
    if (!ltp) {
        return;
    }

    const position = cachedPositionByToken.get(token);
    if (!position) {
        return;
    }

    const restingOrders = cachedRestingOrdersByToken.get(token);
    if (!restingOrders || restingOrders.length == 0) {
        return;
    }

    const level = breachLevelByToken.get(token);
    if (level == null || ltp > level) {
        return;
    }

    if (exitInProgressByToken.has(token)) {
        return;
    }
    exitInProgressByToken.add(token);

    const exitPrice = roundDownToTick(ltp * 0.9);

    try {

        for (const order of restingOrders) {
            await kite.modifyOrder("regular", order.order_id, {
                order_type: "LIMIT",
                price: exitPrice,
                trigger_price: 0, // the resting order may be an SL now
            });
            console.log(`🚨 Exit: modified order ${order.order_id} for ${position.tradingsymbol} into marketable LIMIT at ${exitPrice} (LTP ${ltp} broke ${CANDLE_COUNT}-candle low ${level})`);
        }

        // don't re-fire off stale caches; next refresh rebuilds reality
        cachedRestingOrdersByToken.delete(token);
        cachedPositionByToken.delete(token);

    } catch (err) {
        console.log(err, `❌ Exit modify failed for ${position.tradingsymbol}`);
    } finally {
        exitInProgressByToken.delete(token);
    }
}

main();
async function main() {

    await connectToDatabase();
    const accessToken = await getTodaysAccessToken();
    console.log(accessToken, "accessToken");

    const kite = await getKiteConnectInstance(accessToken);
    const ticker = await getTickerInstance(accessToken);

    try {
        const allInstruments = await kite.getInstruments();
        for (const inst of allInstruments) {
            instrumentLotSizeByToken.set(Number(inst.instrument_token), inst.lot_size);
        }
        console.log(`Loaded lot-size data for ${instrumentLotSizeByToken.size} instruments`);
    } catch (err) {
        console.log(err, "❌ Failed loading instrument data");
    }

    ticker.connect();
    ticker.on("connect", () => {
        console.log("🟢 Kite Ticker connected (simpleGuard)");
        // a subscribe sent while the socket was down is lost -- re-send on
        // every (re)connect
        const tokens = [...subscribedTokens];
        if (tokens.length > 0) {
            ticker.subscribe(tokens);
            ticker.setMode(ticker.modeLTP, tokens);
            console.log(`📡 Re-subscribed ${tokens.length} token(s) after (re)connect`);
        }
    });

    ticker.on("ticks", ticks => {
        for (const tick of ticks) {
            onTick(kite, tick);
        }
    });

    ticker.on("order_update", async orderUpdate => {

        const { instrument_token, status, transaction_type, tradingsymbol, quantity, exchange } = orderUpdate;

        if (status != "COMPLETE" || !OPTION_EXCHANGES.includes(exchange)) {
            return;
        }

        if (transaction_type == "BUY") {

            const token = Number(instrument_token);
            actualBuyPriceByToken.set(token, orderUpdate.average_price);
            subscribeForLiveTicks(ticker, token);

            // freeze the breach level as of entry: min low of the 3 candles
            // completed just before this fill. Not recomputed afterwards.
            try {
                const level = await computeBreachLevel(kite, token);
                if (level != null) {
                    breachLevelByToken.set(token, level);
                    breachSymbolByToken.set(token, tradingsymbol);
                    writeGuardState();
                    console.log(`📏 Breach level frozen for ${tradingsymbol}: ${level}`);
                }
            } catch (err) {
                console.log(err, `⚠️ Failed computing breach level for ${tradingsymbol}`);
            }

            try {
                await placeTargetOrder(kite, {
                    instrument_token: token,
                    tradingsymbol,
                    exchange,
                    quantity,
                    buyPrice: orderUpdate.average_price
                });
            } catch (err) {
                console.log(err, `❌ Failed placing target for ${tradingsymbol}`);
            }
            return;
        }

        if (transaction_type == "SELL") {

            // position may be flat now -- cancel any leftover resting SELLs
            // (but leave them if quantity remains: freeze chunks still
            // protecting the remainder)
            try {

                const positions = await kite.getPositions();
                const stillOpen = (positions.net || []).some(
                    p => p.tradingsymbol == tradingsymbol && p.quantity > 0
                );
                if (stillOpen) {
                    return;
                }

                const token = Number(instrument_token);

                // record the closed trade BEFORE forgetting its entry price
                logClosedTrade({
                    tradingsymbol,
                    position: (positions.net || []).find(x => x.tradingsymbol == tradingsymbol),
                    sellPrice: orderUpdate.average_price,
                    fallbackQty: quantity,
                    token
                });

                actualBuyPriceByToken.delete(token);
                breachLevelByToken.delete(token); // next trade freezes its own level
                breachSymbolByToken.delete(token);
                writeGuardState();
                clearOverride(token);

                const orders = await kite.getOrders();
                const leftovers = orders.filter(
                    o => o.tradingsymbol == tradingsymbol &&
                        o.transaction_type == "SELL" &&
                        RESTING_ORDER_STATUSES.includes(o.status)
                );
                for (const order of leftovers) {
                    try {
                        await kite.cancelOrder("regular", order.order_id);
                        console.log(`🧹 Cancelled leftover order ${order.order_id} for ${tradingsymbol} (position closed)`);
                    } catch (err) {
                        console.log(err, `⚠️ Failed cancelling leftover ${order.order_id}`);
                    }
                }

            } catch (err) {
                console.log(err, `❌ Post-close cleanup failed for ${tradingsymbol}`);
            }
        }
    });

    setInterval(() => refreshCache(kite, ticker), REFRESH_MS);
    refreshCache(kite, ticker); // warm immediately
}
