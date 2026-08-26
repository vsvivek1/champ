
/*

tods:

1. pick posistion and set the flag hasPosition=true or fase;
2. corect the strike selection logic
3. check the spread before placing order
4. place target if not placed

5. once traded dont trade again
6. below 1 rs no trade
7. no trade below open
8.

*/

console.log("🚀 stockOptionTrade starting", new Date().toISOString());
console.log("CWD:", process.cwd());

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED PROMISE REJECTION');
  console.error('Reason:', reason);
  console.error('Promise:', promise);

  if (reason instanceof Error) {
    console.error(reason.stack);
  } else {
    console.error(JSON.stringify(reason, null, 2));
  }
});

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION');
  console.error(err.stack || err);
});

const { get } = require('mongoose');
const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const { getKiteConnectInstance,getTickerInstance } = require('./getKiteConnectInstance.js');
const dayjs = require("dayjs");
//var {sendNotification}=require('./MobileAlerts/mobileAlerts.js');

const path = require('path');
const { KiteConnect } = require('kiteconnect');
const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');
const { target, targetPct } = require('./targetLock.js');
const scriptDirectory  = __dirname
const FILE_LOCATION  =  path.join( scriptDirectory);
const fs = require('fs').promises;
var margin;

const TICK = 0.05;

// Kite parks a resting SL/SL-M order in "TRIGGER PENDING" -- not "OPEN" --
// until its trigger price is hit, at which point it briefly shows "OPEN"
// before filling. Matching only "OPEN" means every untriggered protective
// SL is invisible to both the trailing check and the coverage check.
const RESTING_ORDER_STATUSES = ["TRIGGER PENDING", "OPEN"];

// This script is options-only -- NSE F&O and BSE F&O. Every place positions
// or fills are pulled in filters against this so a stray equity/commodity
// trade on the same Kite session never gets an options-style SL/exit order.
const OPTION_EXCHANGES = ['NFO', 'BFO'];

function roundToTick(value, tick = TICK) {
    return Math.round(value / tick) * tick;
}

/*
Kite rejects a stoploss SELL order if trigger_price is not
strictly below the current last traded price. Clamp the
trigger (and re-derive the limit price from it) whenever the
computed trigger has drifted at or above LTP.
*/
async function getSafeSlTriggerAndPrice(kite, instrumentToken, desiredTrigger, liveLtp) {

    let triggerPrice = roundToTick(desiredTrigger);
    let ltp = liveLtp;

    if (!ltp) {
        try {
            let quote = await kite.getLTP(instrumentToken);
            ltp = quote?.[instrumentToken]?.last_price;
        } catch (err) {
            console.log(err, `⚠️ failed to fetch LTP for ${instrumentToken}, skipping trigger clamp`);
        }
    }

    if (ltp && triggerPrice >= ltp) {

        console.log(
            `⚠️ SL trigger ${triggerPrice} >= LTP ${ltp} for ${instrumentToken}, clamping trigger below LTP`
        );

        triggerPrice = roundToTick(ltp - TICK);
    }

    let price = roundToTick(triggerPrice * 0.95);

    return { triggerPrice, price, ltp };
}

async function computeStopLossTriggerFromCandles(kite, instrumentToken) {

    const today = dayjs().format("YYYY-MM-DD");
    const from = `${today} 09:15:00`;
    const to = dayjs().format("YYYY-MM-DD HH:mm:ss");

    let historicalData = await kite.getHistoricalData(
        instrumentToken,
        "minute",
        from,
        to,
        false,
        true
    );

    let lastThreeCandles = historicalData.slice(-3);

    return Math.min(...lastThreeCandles.map(c => c.low));
}

/*
Places a single SL order for a position. Called once when the
entry order completes, and again by the periodic check if a
position is ever found without an open SL order.
*/
async function placeStopLossOrder(kite, { instrument_token, tradingsymbol, exchange, quantity, positionTransactionType }) {

    const slTransactionType =
        positionTransactionType === "BUY" ? "SELL" : "BUY";

    let stopLossTriggerPrice =
        await computeStopLossTriggerFromCandles(kite, instrument_token);

    let stopLossPrice = roundToTick(stopLossTriggerPrice * 0.95);

    if (slTransactionType === "SELL") {
        ({ triggerPrice: stopLossTriggerPrice, price: stopLossPrice } =
            await getSafeSlTriggerAndPrice(
                kite,
                instrument_token,
                stopLossTriggerPrice
            ));
    }

    let slOrderIds = await placeOrderInFreezeChunks(kite, {
        exchange: exchange || "NFO",
        tradingsymbol: tradingsymbol,
        transaction_type: slTransactionType,
        quantity: quantity,
        order_type: "SL",
        price: stopLossPrice,
        trigger_price: stopLossTriggerPrice,
        product: "NRML",
        validity: "DAY"
    }, instrumentLotSizeByToken.get(instrument_token));

    console.log(
        `Stop-loss order(s) placed for ${tradingsymbol}. Order ID(s): ${slOrderIds.join(', ')}`
    );

    return slOrderIds;
}

const TRAIL_STALL_MS_DEFAULT = 2 * 60 * 1000;    // 2 minutes
const TRAIL_STALL_MS_EXPIRY_DAY = 60 * 1000;     // 1 minute -- theta bleeds fastest on expiry day
const GIVE_BACK_FRACTION = 0.35;                 // exit once 35% of peak profit is given back

// tradingsymbol -> { peakPrice, peakTime } -- tracks the highest LTP seen
// since a position was opened, so we can tell whether it has stalled.
const positionPeaks = new Map();

// tradingsymbols that have ever reached targetPct profit. Once a symbol is
// in this set it stays in "locked trailing" mode for the rest of the
// position's life (even if price dips back below target), continuously
// tightening the real SL trigger to lock in (1 - GIVE_BACK_FRACTION) of the
// peak gain instead of exiting via our own market order -- the position
// then closes only when the market actually hits that trigger.
const targetLockedSymbols = new Set();

// instrument_token -> expiry (Date), loaded once at startup so the trailing
// check can tighten the stall window on expiry day, when theta decay is
// most severe.
const instrumentExpiryByToken = new Map();

// instrument_token -> lot size, loaded once at startup from the instrument
// master (not hardcoded) so freeze-quantity chunking always aligns to the
// exchange's *current* lot size -- NSE has changed NIFTY's lot size before,
// and a chunk quantity that isn't a multiple of the lot size gets rejected
// outright by Kite, which otherwise silently leaves the position without a
// working SL order every single retry.
const instrumentLotSizeByToken = new Map();

function isExpiryDay(expiry) {
    if (!expiry) return false;
    return dayjs(expiry).isSame(dayjs(), 'day');
}

// instrument_token -> latest tick from the live WebSocket feed (subscribed
// in full mode, so this includes OI). Kept current by the ticker's own
// "ticks" event instead of polling kite.getLTP() -- avoids trailing on a
// price that's already up to 15s stale by the time the next REST poll runs.
const latestTickByToken = new Map();
const subscribedTokens = new Set();

function subscribeForLiveTicks(ticker, instrument_token) {
    if (subscribedTokens.has(instrument_token)) return;
    ticker.subscribe([instrument_token]);
    ticker.setMode(ticker.modeFull, [instrument_token]); // full mode needed for OI
    subscribedTokens.add(instrument_token);
    console.log(`📡 Subscribed to live ticks (full mode) for token ${instrument_token}`);
}

/*
Cancels every open SL order for a position (there can be more than one if
the SL was split across the exchange freeze-quantity limit) and exits with
an aggressive LIMIT sell 10% below LTP instead. Options don't reliably
support MARKET orders (thin/wide spreads can give a terrible fill), so
this marketable LIMIT is used as the immediate-exit path.
*/
async function exitPositionImmediately(kite, position, openSlOrders, ltp, reason) {

    const { tradingsymbol } = position;

    for (const order of openSlOrders) {
        try {
            await kite.cancelOrder("regular", order.order_id);
        } catch (cancelErr) {
            console.log(
                cancelErr,
                `❌ Failed cancelling SL order ${order.order_id} for ${tradingsymbol} before exit`
            );
        }
    }

    const exitPrice = roundToTick(ltp * 0.9);

    try {

        const orderIds = await placeOrderInFreezeChunks(kite, {
            exchange: position.exchange,
            tradingsymbol,
            transaction_type: "SELL",
            order_type: "LIMIT",
            quantity: Math.abs(position.quantity),
            price: exitPrice,
            product: "NRML",
            validity: "DAY",
        }, instrumentLotSizeByToken.get(position.instrument_token));

        console.log(
            `🚨 Exit placed for ${tradingsymbol} at ${exitPrice} (${reason}). Order ID(s): ${orderIds.join(', ')}`
        );

    } catch (err) {

        console.log(
            err,
            `❌ Exit failed for ${tradingsymbol} (${reason})`
        );
    }
}

// instrument_token -> position / open SL orders / last-3-candle-low, kept
// current by refreshTrailingCache on a REST timer. evaluateTrailingExitOnTick
// reads these on every live tick instead of hitting REST per tick.
const cachedPositionByToken = new Map();
const cachedOpenSlOrdersByToken = new Map();
const last3CandleLowByToken = new Map();

// Guards against a burst of ticks (several per second) re-triggering the
// same cancel+exit or modify while a previous attempt for that token is
// still in flight.
const exitInProgressByToken = new Set();

/*
REST-side refresh for the trailing check: pulls current positions/orders,
keeps the live-tick subscriptions and the per-token caches in sync, and
refreshes each position's last-3-candle-low (candle data doesn't need
per-tick freshness). Runs on a timer; the actual exit/trail decisions are
made per-tick in evaluateTrailingExitOnTick using these caches.
*/
async function refreshTrailingCache(kite, ticker) {

    try {

        let positions = await kite.getPositions();

        let netPositions = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        const activeSymbols = new Set(netPositions.map(p => p.tradingsymbol));
        for (const symbol of positionPeaks.keys()) {
            if (!activeSymbols.has(symbol)) {
                positionPeaks.delete(symbol);
            }
        }
        for (const symbol of targetLockedSymbols) {
            if (!activeSymbols.has(symbol)) {
                targetLockedSymbols.delete(symbol);
            }
        }

        // Deliberately never unsubscribed -- the number of instruments in
        // play at once is small enough that leaving a closed position's
        // token subscribed costs nothing, and unsubscribing here raced the
        // subscribe/tick-driven trailing logic: a position that looked
        // momentarily absent from this REST snapshot would get its ticks
        // cut off, silently stalling the trailing SL until the next
        // resubscribe caught up.
        const activeTokens = new Set(netPositions.map(p => p.instrument_token));
        for (const token of cachedPositionByToken.keys()) {
            if (!activeTokens.has(token)) {
                cachedPositionByToken.delete(token);
                cachedOpenSlOrdersByToken.delete(token);
                last3CandleLowByToken.delete(token);
                exitInProgressByToken.delete(token);
            }
        }

        if (netPositions.length == 0) {
            return;
        }

        let orders = await kite.getOrders();

        for (let position of netPositions) {

            const { tradingsymbol, instrument_token } = position;

            // Safety net in case the order_update handler's subscribe was
            // missed (e.g. process restarted while the position was open).
            subscribeForLiveTicks(ticker, instrument_token);

            cachedPositionByToken.set(instrument_token, position);

            const openSlOrders = orders.filter(
                o => o.tradingsymbol == tradingsymbol &&
                    o.order_type == "SL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
            );
            cachedOpenSlOrdersByToken.set(instrument_token, openSlOrders);

            try {
                const low = await computeStopLossTriggerFromCandles(kite, instrument_token);
                last3CandleLowByToken.set(instrument_token, low);
            } catch (err) {
                console.log(err, `⚠️ failed to refresh 3-candle low for ${tradingsymbol}`);
            }
        }

    } catch (err) {

        console.log(
            err,
            "❌ refreshTrailingCache error"
        );
    }
}

/*
Trailing stop-loss, evaluated on every live tick (not just once per REST
poll) so a fast intra-cycle move isn't missed: tightens (never loosens)
the resting SL order's trigger for a long position that's in profit, when
either:
  1. price breaks back below the last-3-candle low, or
  2. price hasn't made a new high above its peak for 2 minutes (stalled,
     1 minute on expiry day)
and exits immediately (rather than trying to tighten) if the position has
given back too much of its peak gain, regardless of current profit/loss.
*/
async function evaluateTrailingExitOnTick(kite, ticker, tick) {

    const instrument_token = tick.instrument_token;

    const position = cachedPositionByToken.get(instrument_token);
    if (!position) {
        return; // not one of our tracked long positions
    }

    const openSlOrders = cachedOpenSlOrdersByToken.get(instrument_token);
    if (!openSlOrders || openSlOrders.length == 0) {
        return; // ensureStopLossForOpenPositions will place one
    }

    if (exitInProgressByToken.has(instrument_token)) {
        return; // an action from an earlier tick for this token is still in flight
    }

    const { tradingsymbol, average_price } = position;
    const ltp = tick.last_price;
    if (!ltp) {
        return;
    }

    let peak = positionPeaks.get(tradingsymbol);
    if (!peak || ltp > peak.peakPrice) {
        peak = { peakPrice: ltp, peakTime: Date.now() };
        positionPeaks.set(tradingsymbol, peak);
    }

    // Target lock: once profit has ever reached targetPct, stop trying to
    // exit and instead continuously tighten the real SL trigger to lock in
    // (1 - GIVE_BACK_FRACTION) of the peak gain. The market's own SL fill
    // closes the position from here, not our own market order -- so this
    // replaces the give-back/breakdown/stall checks below for this symbol.
    const currentProfitPct = ((ltp - average_price) / average_price) * 100;

    if (target && currentProfitPct >= targetPct && !targetLockedSymbols.has(tradingsymbol)) {
        targetLockedSymbols.add(tradingsymbol);
        console.log(
            `🎯 ${tradingsymbol} hit target ${targetPct}% (current ${currentProfitPct.toFixed(2)}%) -- switching to locked trailing`
        );
    }

    if (target && targetLockedSymbols.has(tradingsymbol)) {

        const lockedGain = (peak.peakPrice - average_price) * (1 - GIVE_BACK_FRACTION);
        const desiredTrigger = average_price + lockedGain;

        const openSlOrder = openSlOrders[0];
        const currentTrigger = Number(openSlOrder.trigger_price);
        const currentSlLimitPrice = Number(openSlOrder.price);

        // The resting order is a SELL LIMIT: it can only fill at or above
        // its own limit price. A fast/gappy crash in the option premium can
        // blow straight through the trigger *and* the limit price (set 5%
        // below trigger) in one move, leaving the order stuck open and
        // unfillable while price keeps falling -- and once locked, nothing
        // else here is watching for that, so the locked-in profit would
        // otherwise bleed away untouched. Cancel it and exit at market now
        // instead of trusting it to eventually fill.
        if (ltp <= currentSlLimitPrice) {

            await exitAndInvalidateCache(
                kite,
                ticker,
                instrument_token,
                position,
                openSlOrders,
                ltp,
                `price ${ltp} fell through locked SL limit ${currentSlLimitPrice} (order stuck, won't fill)`
            );
            return;
        }

        const { triggerPrice: newTrigger, price: newPrice } =
            await getSafeSlTriggerAndPrice(kite, instrument_token, desiredTrigger, ltp);

        // Only ever tighten (raise) the stop, never loosen it.
        if (newTrigger > currentTrigger) {

            exitInProgressByToken.add(instrument_token);

            try {

                await kite.modifyOrder("regular", openSlOrder.order_id, {
                    order_type: "SL",
                    trigger_price: newTrigger,
                    price: newPrice,
                });

                openSlOrder.trigger_price = newTrigger;
                openSlOrder.price = newPrice;

                console.log(
                    `🎯🔒 Target-locked trail for ${tradingsymbol}: ${currentTrigger} -> ${newTrigger} (locking ${((1 - GIVE_BACK_FRACTION) * 100).toFixed(0)}% of peak gain ${(peak.peakPrice - average_price).toFixed(2)})`
                );

            } catch (err) {

                console.log(
                    err,
                    `❌ Failed target-locked trail for ${tradingsymbol}, falling back to a marketable exit`
                );

                await exitPositionImmediately(kite, position, openSlOrders, ltp, `SL modify failed while target-locked trailing`);
                cachedOpenSlOrdersByToken.delete(instrument_token);

            } finally {

                exitInProgressByToken.delete(instrument_token);
            }
        }

        return; // target-locked: skip give-back/breakdown/stall below, the real SL now manages the exit
    }

    // Give-back check runs regardless of current profit/loss -- the whole
    // point is to catch a winner round-tripping back down, including all
    // the way through breakeven into a loss.
    const maxGain = peak.peakPrice - average_price;
    const giveBackAmount = peak.peakPrice - ltp;
    const gaveBackTooMuch =
        maxGain > 0 && giveBackAmount >= maxGain * GIVE_BACK_FRACTION;

    if (gaveBackTooMuch) {
        await exitAndInvalidateCache(
            kite,
            ticker,
            instrument_token,
            position,
            openSlOrders,
            ltp,
            `gave back ${giveBackAmount.toFixed(2)} of peak gain ${maxGain.toFixed(2)} (>= ${GIVE_BACK_FRACTION * 100}%)`
        );
        return;
    }

    const inProfit = ltp > average_price;
    if (!inProfit) {
        return; // only trail winners below
    }

    const last3CandleLow = last3CandleLowByToken.get(instrument_token);
    if (last3CandleLow == null) {
        return; // not refreshed yet -- wait for the next cache refresh
    }

    const brokeThreeCandleLow = ltp <= last3CandleLow;

    if (brokeThreeCandleLow) {
        // The move has failed -- exit now instead of trying to trail a
        // tighter trigger off this same (now lower) low, which would
        // almost never compute higher than the existing trigger anyway
        // and would silently do nothing.
        await exitAndInvalidateCache(
            kite,
            ticker,
            instrument_token,
            position,
            openSlOrders,
            ltp,
            `price ${ltp} broke 3-candle low ${last3CandleLow}`
        );
        return;
    }

    // peak.peakTime only advances on a strict new high, so time since then
    // already captures "no new high" whether price has since dipped or is
    // sitting flat exactly at the peak. The window shrinks on expiry day
    // since theta decay is far more severe in an option's final hours.
    const stallThresholdMs = isExpiryDay(instrumentExpiryByToken.get(instrument_token))
        ? TRAIL_STALL_MS_EXPIRY_DAY
        : TRAIL_STALL_MS_DEFAULT;

    const stalled = (Date.now() - peak.peakTime) >= stallThresholdMs;

    if (!stalled) {
        return;
    }

    const openSlOrder = openSlOrders[0];
    const currentTrigger = Number(openSlOrder.trigger_price);

    const { triggerPrice: newTrigger, price: newPrice } =
        await getSafeSlTriggerAndPrice(kite, instrument_token, last3CandleLow, ltp);

    // Only ever tighten (raise) the stop for a long position, never loosen it.
    if (!(newTrigger > currentTrigger)) {
        return;
    }

    exitInProgressByToken.add(instrument_token);

    try {

        await kite.modifyOrder("regular", openSlOrder.order_id, {
            order_type: "SL",
            trigger_price: newTrigger,
            price: newPrice,
        });

        // Reflect the new trigger in the cache immediately so a tick
        // arriving before the next REST refresh doesn't re-attempt the
        // same modify.
        openSlOrder.trigger_price = newTrigger;

        console.log(
            `🔒 Trailed SL for ${tradingsymbol}: ${currentTrigger} -> ${newTrigger} (price stalled below peak ${peak.peakPrice} for ${stallThresholdMs / 1000}+ seconds, OI ${tick.oi})`
        );

    } catch (err) {

        console.log(
            err,
            `❌ Failed trailing SL for ${tradingsymbol}, falling back to a marketable exit`
        );

        await exitPositionImmediately(kite, position, openSlOrders, ltp, `SL modify failed while trailing`);
        cachedOpenSlOrdersByToken.delete(instrument_token);

    } finally {

        exitInProgressByToken.delete(instrument_token);
    }
}

async function exitAndInvalidateCache(kite, ticker, instrument_token, position, openSlOrders, ltp, reason) {

    exitInProgressByToken.add(instrument_token);

    try {
        await exitPositionImmediately(kite, position, openSlOrders, ltp, reason);
    } finally {
        // Drop the cached SL orders so a tick arriving before the next
        // refresh sees "no open SL order" and does nothing, instead of
        // re-triggering this same exit (and re-selling the full quantity)
        // on every tick until the cache catches up.
        cachedOpenSlOrdersByToken.delete(instrument_token);
        exitInProgressByToken.delete(instrument_token);
    }
}

/*
Periodic safety net: any open position that doesn't have a
matching open SL order gets one placed.
*/
async function ensureStopLossForOpenPositions(kite, ticker) {

    try {

        let positions = await kite.getPositions();

        /*
        option buyer only: only long positions need an SL
        */
        let netPositions = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        if (netPositions.length == 0) {
            return;
        }

        let orders = await kite.getOrders();

        // Any resting SELL order -- our protective SL, or the aggressive
        // marketable LIMIT sell the trailing check places on an immediate
        // exit -- already covers/is closing the position. Checking by
        // transaction_type rather than order_type == "SL" specifically
        // avoids racing the tick-driven exit path: right after it cancels
        // the SL and places its own exit order, this still sees the
        // position as covered instead of stacking a second SL on top.
        let symbolsAlreadyCovered = new Set(
            orders
                .filter(o => o.transaction_type == "SELL" && RESTING_ORDER_STATUSES.includes(o.status))
                .map(o => o.tradingsymbol)
        );

        for (let position of netPositions) {

            // Reconciliation safety net -- covers positions that already
            // existed before this process (re)started.
            subscribeForLiveTicks(ticker, position.instrument_token);

            if (symbolsAlreadyCovered.has(position.tradingsymbol)) {
                continue;
            }

            // A tick-driven exit for this token is actively cancelling its
            // SL and placing a replacement order right now -- the REST
            // snapshot above may have been taken mid-transition (SL already
            // cancelled, exit order not yet visible). Skip this cycle
            // rather than race it; the next cycle will see the resolved
            // state via the check above.
            if (exitInProgressByToken.has(position.instrument_token)) {
                continue;
            }

            console.log(
                `⚠️ No open SL order for ${position.tradingsymbol}, placing one`
            );

            try {

                await placeStopLossOrder(kite, {
                    instrument_token: position.instrument_token,
                    tradingsymbol: position.tradingsymbol,
                    exchange: position.exchange,
                    quantity: Math.abs(position.quantity),
                    positionTransactionType:
                        position.quantity > 0 ? "BUY" : "SELL"
                });

            } catch (err) {

                console.log(
                    err,
                    `❌ Failed placing SL for ${position.tradingsymbol}`
                );
            }
        }

    } catch (err) {

        console.log(
            err,
            "❌ ensureStopLossForOpenPositions error"
        );
    }
}

main();
async function main(){


      await connectToDatabase()
    let accesstoken=await getTodaysAccessToken();
    
    let kite=await getKiteConnectInstance(accesstoken);
    let ticker=await getTickerInstance (accesstoken);
     margin=await kite.getMargins();

    try {
        const allInstruments = await kite.getInstruments();
        for (const inst of allInstruments) {
            // kite.getInstruments() returns instrument_token as a string, but
            // ticks/positions/orders all carry it as a number -- keying these
            // maps by the raw string would make every lookup against a live
            // token silently miss.
            const token = Number(inst.instrument_token);
            instrumentExpiryByToken.set(token, inst.expiry);
            instrumentLotSizeByToken.set(token, inst.lot_size);
        }
        console.log(`Loaded expiry/lot-size data for ${instrumentExpiryByToken.size} instruments`);
    } catch (err) {
        console.log(err, "❌ Failed loading instrument expiry data, expiry-day stall tightening will be skipped");
    }


    // console.log("Margin data ",ticker)
    ticker.connect();
 ticker.on("connect", () => {
    console.log("🟢 Kite Ticker connected");})
     ticker.on("ready", () => {
        console.log("Ticker is ready");
      });

    // Live price (and OI, since we subscribe in full mode) feed for the
    // trailing check. evaluateTrailingExitOnTick runs on every tick instead
    // of waiting for the next REST poll, so a fast intra-cycle move (a
    // spike that peaks and reverses within one refresh window) isn't missed.
    ticker.on("ticks", ticks => {
        for (const tick of ticks) {
            latestTickByToken.set(tick.instrument_token, tick);

            evaluateTrailingExitOnTick(kite, ticker, tick).catch(err => {
                console.log(err, `❌ evaluateTrailingExitOnTick error for token ${tick.instrument_token}`);
            });
        }
    });

    ticker.on("order_update", async orderUpdate => {

      //  console.log("🔔 Order Update:", orderUpdate)    ;

    let { instrument_token, status, transaction_type, tradingsymbol, quantity, exchange } = orderUpdate;

    if (status != "COMPLETE") {
        return;
    }

    // This script is options-only -- ignore fills on any other exchange
    // (e.g. an NSE equity or MCX commodity trade on the same Kite session).
    if (!OPTION_EXCHANGES.includes(exchange)) {
        return;
    }

    /*
    option buyer only: an SL is only needed against an entry
    BUY. a completed SELL is an exit (target or SL fill), not
    a new position to protect.
    */
    if (transaction_type != "BUY") {
        return;
    }

    subscribeForLiveTicks(ticker, instrument_token);

    try {

        await placeStopLossOrder(kite, {
            instrument_token,
            tradingsymbol,
            exchange,
            quantity,
            positionTransactionType: transaction_type
        });

    } catch (error) {

        console.log(error);

    }

});






/*
periodic safety net: catches any position that somehow ended
up without an SL order and places one
*/

setInterval(() => {

    ensureStopLossForOpenPositions(kite, ticker);

}, 10000);

/*
Keeps the trailing-check caches (positions, open SL orders, 3-candle low)
current. The actual exit/trail decisions happen per tick in
evaluateTrailingExitOnTick, not here -- this only refreshes the REST-backed
data it reads from.
*/

refreshTrailingCache(kite, ticker); // warm the cache immediately, don't wait for the first interval tick

setInterval(() => {

    refreshTrailingCache(kite, ticker);

}, 15000);









} // <- closes main()

