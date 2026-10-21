
/*

Single-resting-order guard for long option positions.

Kite margin-checks every pending SELL order independently -- two resting
SELLs against one long position makes the second look like a naked short
and demands full short-option margin (seen live: ~14L demanded, rejected).
So this script keeps exactly ONE resting SELL order per position and
modifies it in place as conditions change, never placing a second one:

  1. On a BUY fill, a 2% profit-target SELL LIMIT is placed immediately
     (buy_price * 1.02), tagged TARGET_ORDER_TAG.
  2. While that target rests, the stop-loss conditions are enforced per
     live tick. When one fires, the SAME order is MODIFIED:
       - price broke the rolling 3-candle low, or gave back too much of
         the peak gain -> modified into a marketable LIMIT exit (ltp*0.9)
       - price stalled below its peak           -> modified into an SL
         with trigger at the 3-candle low
  3. The conversion is one-way: once the order is an SL it never goes
     back to being a target. From there the existing trailing logic
     tightens (never loosens) the trigger.

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

const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');
const dayjs = require("dayjs");

const path = require('path');
const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');
const { target, targetPct } = require('./targetLock.js');
const scriptDirectory = __dirname;
const FILE_LOCATION = path.join(scriptDirectory);
const fs = require('fs').promises;
var margin;

const TICK = 0.05;

// EDIT ME: profit % locked in by the target order placed right after a buy.
const TARGET_PCT = 2;

// Tag on the resting order while it is still the 2% target (it keeps the
// tag after being modified into an SL/exit -- mode is detected from the
// live order's order_type/price, not the tag).
const TARGET_ORDER_TAG = 'TGT2PCT';

// Kite parks a resting SL/SL-M order in "TRIGGER PENDING" -- not "OPEN" --
// until its trigger price is hit, at which point it briefly shows "OPEN"
// before filling. A resting LIMIT (the target) shows "OPEN" from the start.
const RESTING_ORDER_STATUSES = ["TRIGGER PENDING", "OPEN"];

// This script is options-only -- NSE F&O and BSE F&O. Every place positions
// or fills are pulled in filters against this so a stray equity/commodity
// trade on the same Kite session never gets an options-style SL/exit order.
const OPTION_EXCHANGES = ['NFO', 'BFO'];

// Kite's HTTP client has no built-in retry, and a single transient timeout
// (network blip, or contention with entryGuard.js hitting the same account)
// used to blank out an entire refreshTrailingCache cycle -- silently
// dropping trailing/give-back protection for every open position until the
// next 15s cycle. One quick retry catches the common transient case instead
// of leaving a live position unprotected for a full cycle.
async function withRetry(fn, label, retries = 1, delayMs = 1000) {
    try {
        return await fn();
    } catch (err) {
        if (retries <= 0) throw err;
        console.log(err, `⚠️ ${label} failed, retrying once`);
        await new Promise(r => setTimeout(r, delayMs));
        return withRetry(fn, label, retries - 1, delayMs);
    }
}

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

    // The breach level is the min low of the last 3 COMPLETED candles; the
    // live (4th, still-forming) candle is what gets checked against it per
    // tick -- the moment a live tick prints at/below the level, exit
    // immediately. The live candle's own low must NOT be part of the level
    // itself: that would be self-referential (any retest of a low the live
    // candle just made would read as a breach).
    const currentMinuteStart = dayjs().startOf('minute');
    const completedCandles = historicalData.filter(
        c => dayjs(c.date).isBefore(currentMinuteStart)
    );

    let referenceCandles = completedCandles.slice(-3);

    // First minutes of the session there may be no completed candles yet --
    // fall back to whatever is available rather than Math.min() of an empty
    // list (which is +Infinity and would exit instantly).
    if (referenceCandles.length == 0) {
        referenceCandles = historicalData.slice(-3);
    }

    return Math.min(...referenceCandles.map(c => c.low));
}

/*
Places the single resting order for a freshly bought position: a SELL
LIMIT at buy_price * (1 + TARGET_PCT/100), locking the profit target on
the exchange immediately. Called once when the entry order completes, and
again by the periodic safety net if a position is ever found without any
resting SELL order.
*/
async function placeTargetOrder(kite, { instrument_token, tradingsymbol, exchange, quantity, buyPrice }) {

    const targetPrice = roundToTick(buyPrice * (1 + TARGET_PCT / 100));

    let targetOrderIds = await placeOrderInFreezeChunks(kite, {
        exchange: exchange || "NFO",
        tradingsymbol: tradingsymbol,
        transaction_type: "SELL",
        quantity: quantity,
        order_type: "LIMIT",
        price: targetPrice,
        product: "NRML",
        validity: "DAY",
        tag: TARGET_ORDER_TAG
    }, instrumentLotSizeByToken.get(instrument_token));

    console.log(
        `🎯 Target order(s) placed for ${tradingsymbol} at ${targetPrice} (buy ${buyPrice} + ${TARGET_PCT}%). Order ID(s): ${targetOrderIds.join(', ')}`
    );

    return targetOrderIds;
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
Immediate exit by MODIFYING the resting order(s) in place into an
aggressive marketable LIMIT 10% below LTP. Options don't reliably support
MARKET orders (thin/wide spreads can give a terrible fill), so this
marketable LIMIT is the immediate-exit path. Modify (not cancel+place) so
there is never a second SELL order in flight for Kite to margin-check as
a naked short, and never a window where the position has no resting order.
Falls back to cancel+place only if the modify itself fails.
*/
async function exitPositionImmediately(kite, position, openSellOrders, ltp, reason) {

    const { tradingsymbol } = position;
    const exitPrice = roundToTick(ltp * 0.9);

    for (const order of openSellOrders) {

        try {

            await kite.modifyOrder("regular", order.order_id, {
                order_type: "LIMIT",
                price: exitPrice,
            });

            order.order_type = "LIMIT";
            order.price = exitPrice;

            console.log(
                `🚨 Exit: modified order ${order.order_id} for ${tradingsymbol} into marketable LIMIT at ${exitPrice} (${reason})`
            );

        } catch (err) {

            console.log(
                err,
                `❌ Modify-to-exit failed for order ${order.order_id} (${tradingsymbol}), falling back to cancel+place`
            );

            try {

                await kite.cancelOrder("regular", order.order_id);

                const orderIds = await placeOrderInFreezeChunks(kite, {
                    exchange: position.exchange,
                    tradingsymbol,
                    transaction_type: "SELL",
                    order_type: "LIMIT",
                    quantity: order.quantity - (order.filled_quantity || 0),
                    price: exitPrice,
                    product: "NRML",
                    validity: "DAY",
                }, instrumentLotSizeByToken.get(position.instrument_token));

                console.log(
                    `🚨 Exit placed (fallback) for ${tradingsymbol} at ${exitPrice} (${reason}). Order ID(s): ${orderIds.join(', ')}`
                );

            } catch (fallbackErr) {

                console.log(
                    fallbackErr,
                    `❌ Fallback exit failed for ${tradingsymbol} (${reason})`
                );
            }
        }
    }
}

/*
One-way conversion of the resting 2% target LIMIT into a protective SL
(trigger at the rolling 3-candle low). Modify in place, same order id(s),
so Kite never sees a second SELL. Once converted, the order never goes
back to being a target -- the trailing logic below only ever tightens it.
*/
async function convertTargetToStopLoss(kite, position, openSellOrders, desiredTrigger, ltp, reason) {

    const { tradingsymbol, instrument_token } = position;

    const { triggerPrice, price } =
        await getSafeSlTriggerAndPrice(kite, instrument_token, desiredTrigger, ltp);

    for (const order of openSellOrders) {

        try {

            await kite.modifyOrder("regular", order.order_id, {
                order_type: "SL",
                trigger_price: triggerPrice,
                price: price,
            });

            order.order_type = "SL";
            order.trigger_price = triggerPrice;
            order.price = price;

            console.log(
                `🔄 Converted target -> SL for ${tradingsymbol} (order ${order.order_id}): trigger ${triggerPrice}, limit ${price} (${reason})`
            );

        } catch (err) {

            console.log(
                err,
                `❌ Target->SL conversion failed for order ${order.order_id} (${tradingsymbol}), exiting instead`
            );

            await exitPositionImmediately(kite, position, [order], ltp, `conversion to SL failed (${reason})`);
        }
    }
}

// instrument_token -> position / resting SELL orders / last-3-candle-low,
// kept current by refreshTrailingCache on a REST timer.
// evaluateTrailingExitOnTick reads these on every live tick instead of
// hitting REST per tick.
const cachedPositionByToken = new Map();
const cachedOpenSellOrdersByToken = new Map();
const last3CandleLowByToken = new Map();

// instrument_token -> actual entry fill price of the CURRENT lot, recorded
// from the BUY order_update. Kite's position.average_price blends every
// buy of the day (earlier closed round-trips included), so it is NOT the
// cost of the live lot and must never be used for mode detection or
// profit math. If the entry fill wasn't observed (process restart), the
// entry is recovered from the resting target order's own price
// (price / (1 + TARGET_PCT/100)).
const actualBuyPriceByToken = new Map();

// Guards against a burst of ticks (several per second) re-triggering the
// same modify/exit while a previous attempt for that token is still in
// flight.
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

        let positions = await withRetry(() => kite.getPositions(), 'refreshTrailingCache getPositions');

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
                cachedOpenSellOrdersByToken.delete(token);
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

            // The single resting SELL order for this position -- whether it
            // is still the 2% target LIMIT or has been converted to an SL.
            const openSellOrders = orders.filter(
                o => o.tradingsymbol == tradingsymbol &&
                    o.transaction_type == "SELL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
            );
            cachedOpenSellOrdersByToken.set(instrument_token, openSellOrders);

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
Per-tick guard logic. The position's single resting SELL order is either:

TARGET MODE (order_type LIMIT, price above entry) -- the 2% target is
resting. The target never fills on the way down, so every SL condition is
enforced here per tick by MODIFYING that same order:
  - price broke the rolling 3-candle low (winners AND losers)
      -> modified into a marketable LIMIT exit
  - gave back >= 35% of the peak gain (winners)
      -> modified into a marketable LIMIT exit
  - stalled below its peak for 2 min / 1 min on expiry day (winners)
      -> converted (one-way) into an SL with trigger at the 3-candle low

SL MODE (order_type SL) -- the order has been converted. From here the
original trailing behaviour applies: the trigger only ever tightens, the
give-back/breakdown checks still force an immediate exit (again via
modify), and the targetPct locked-trailing logic manages runaway winners.
*/
async function evaluateTrailingExitOnTick(kite, ticker, tick) {

    const instrument_token = tick.instrument_token;

    const position = cachedPositionByToken.get(instrument_token);
    if (!position) {
        return; // not one of our tracked long positions
    }

    const openSellOrders = cachedOpenSellOrdersByToken.get(instrument_token);
    if (!openSellOrders || openSellOrders.length == 0) {
        return; // ensureTargetForOpenPositions will place the target order
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

    const restingOrder = openSellOrders[0];
    const last3CandleLow = last3CandleLowByToken.get(instrument_token);

    // Entry price of the CURRENT lot -- never Kite's blended day average.
    let entryPrice = actualBuyPriceByToken.get(instrument_token);
    if (entryPrice == null) {
        if (restingOrder.tag == TARGET_ORDER_TAG && restingOrder.order_type == "LIMIT") {
            entryPrice = Number(restingOrder.price) / (1 + TARGET_PCT / 100);
            actualBuyPriceByToken.set(instrument_token, entryPrice);
        } else {
            entryPrice = average_price;
        }
    }

    const isSlMode = restingOrder.order_type == "SL";

    // A LIMIT order priced below entry is a marketable exit already in
    // flight (placed by an earlier condition) -- leave it to fill.
    const isTargetMode =
        restingOrder.order_type == "LIMIT" &&
        Number(restingOrder.price) > entryPrice;

    if (!isSlMode && !isTargetMode) {
        return;
    }

    const maxGain = peak.peakPrice - entryPrice;
    const giveBackAmount = peak.peakPrice - ltp;
    const gaveBackTooMuch =
        ltp > entryPrice &&
        maxGain > 0 && giveBackAmount >= maxGain * GIVE_BACK_FRACTION;

    if (isTargetMode) {

        // Hard stop: the resting target can't protect the downside, so the
        // 3-candle-low breach is enforced here for winners and losers alike.
        if (last3CandleLow != null && ltp <= last3CandleLow) {
            await exitAndInvalidateCache(
                kite, ticker, instrument_token, position, openSellOrders, ltp,
                `price ${ltp} broke 3-candle low ${last3CandleLow}`
            );
            return;
        }

        if (gaveBackTooMuch) {
            await exitAndInvalidateCache(
                kite, ticker, instrument_token, position, openSellOrders, ltp,
                `gave back ${giveBackAmount.toFixed(2)} of peak gain ${maxGain.toFixed(2)} (>= ${GIVE_BACK_FRACTION * 100}%)`
            );
            return;
        }

        const inProfit = ltp > entryPrice;
        if (!inProfit || last3CandleLow == null) {
            return;
        }

        const stallThresholdMs = isExpiryDay(instrumentExpiryByToken.get(instrument_token))
            ? TRAIL_STALL_MS_EXPIRY_DAY
            : TRAIL_STALL_MS_DEFAULT;

        const stalled = (Date.now() - peak.peakTime) >= stallThresholdMs;

        if (!stalled) {
            return;
        }

        exitInProgressByToken.add(instrument_token);

        try {

            await convertTargetToStopLoss(
                kite, position, openSellOrders, last3CandleLow, ltp,
                `price stalled below peak ${peak.peakPrice} for ${stallThresholdMs / 1000}+ seconds`
            );

        } finally {

            exitInProgressByToken.delete(instrument_token);
        }

        return;
    }

    // ---- SL mode below: the order has been converted, trail it ----

    // Target lock: once profit has ever reached targetPct, stop trying to
    // exit and instead continuously tighten the real SL trigger to lock in
    // (1 - GIVE_BACK_FRACTION) of the peak gain. The market's own SL fill
    // closes the position from here, not our own market order -- so this
    // replaces the give-back/breakdown/stall checks below for this symbol.
    const currentProfitPct = ((ltp - entryPrice) / entryPrice) * 100;

    if (target && currentProfitPct >= targetPct && !targetLockedSymbols.has(tradingsymbol)) {
        targetLockedSymbols.add(tradingsymbol);
        console.log(
            `🎯 ${tradingsymbol} hit target ${targetPct}% (current ${currentProfitPct.toFixed(2)}%) -- switching to locked trailing`
        );
    }

    if (target && targetLockedSymbols.has(tradingsymbol)) {

        const lockedGain = (peak.peakPrice - entryPrice) * (1 - GIVE_BACK_FRACTION);
        const desiredTrigger = entryPrice + lockedGain;

        const currentTrigger = Number(restingOrder.trigger_price);
        const currentSlLimitPrice = Number(restingOrder.price);

        // The resting order is a SELL LIMIT once triggered: it can only fill
        // at or above its own limit price. A fast/gappy crash in the option
        // premium can blow straight through the trigger *and* the limit
        // price (set 5% below trigger) in one move, leaving the order stuck
        // open and unfillable while price keeps falling. Modify it into a
        // marketable exit now instead of trusting it to eventually fill.
        if (ltp <= currentSlLimitPrice) {

            await exitAndInvalidateCache(
                kite,
                ticker,
                instrument_token,
                position,
                openSellOrders,
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

                await kite.modifyOrder("regular", restingOrder.order_id, {
                    order_type: "SL",
                    trigger_price: newTrigger,
                    price: newPrice,
                });

                restingOrder.trigger_price = newTrigger;
                restingOrder.price = newPrice;

                console.log(
                    `🎯🔒 Target-locked trail for ${tradingsymbol}: ${currentTrigger} -> ${newTrigger} (locking ${((1 - GIVE_BACK_FRACTION) * 100).toFixed(0)}% of peak gain ${(peak.peakPrice - entryPrice).toFixed(2)})`
                );

            } catch (err) {

                console.log(
                    err,
                    `❌ Failed target-locked trail for ${tradingsymbol}, falling back to a marketable exit`
                );

                await exitPositionImmediately(kite, position, openSellOrders, ltp, `SL modify failed while target-locked trailing`);
                cachedOpenSellOrdersByToken.delete(instrument_token);

            } finally {

                exitInProgressByToken.delete(instrument_token);
            }
        }

        return; // target-locked: skip give-back/breakdown/stall below, the real SL now manages the exit
    }

    if (gaveBackTooMuch) {
        await exitAndInvalidateCache(
            kite,
            ticker,
            instrument_token,
            position,
            openSellOrders,
            ltp,
            `gave back ${giveBackAmount.toFixed(2)} of peak gain ${maxGain.toFixed(2)} (>= ${GIVE_BACK_FRACTION * 100}%)`
        );
        return;
    }

    const inProfit = ltp > entryPrice;
    if (!inProfit) {
        return; // only trail winners below; the resting SL is the exit for losers
    }

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
            openSellOrders,
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

    const currentTrigger = Number(restingOrder.trigger_price);

    const { triggerPrice: newTrigger, price: newPrice } =
        await getSafeSlTriggerAndPrice(kite, instrument_token, last3CandleLow, ltp);

    // Only ever tighten (raise) the stop for a long position, never loosen it.
    if (!(newTrigger > currentTrigger)) {
        return;
    }

    exitInProgressByToken.add(instrument_token);

    try {

        await kite.modifyOrder("regular", restingOrder.order_id, {
            order_type: "SL",
            trigger_price: newTrigger,
            price: newPrice,
        });

        // Reflect the new trigger in the cache immediately so a tick
        // arriving before the next REST refresh doesn't re-attempt the
        // same modify.
        restingOrder.trigger_price = newTrigger;

        console.log(
            `🔒 Trailed SL for ${tradingsymbol}: ${currentTrigger} -> ${newTrigger} (price stalled below peak ${peak.peakPrice} for ${stallThresholdMs / 1000}+ seconds, OI ${tick.oi})`
        );

    } catch (err) {

        console.log(
            err,
            `❌ Failed trailing SL for ${tradingsymbol}, falling back to a marketable exit`
        );

        await exitPositionImmediately(kite, position, openSellOrders, ltp, `SL modify failed while trailing`);
        cachedOpenSellOrdersByToken.delete(instrument_token);

    } finally {

        exitInProgressByToken.delete(instrument_token);
    }
}

async function exitAndInvalidateCache(kite, ticker, instrument_token, position, openSellOrders, ltp, reason) {

    exitInProgressByToken.add(instrument_token);

    try {
        await exitPositionImmediately(kite, position, openSellOrders, ltp, reason);
    } finally {
        // Drop the cached resting orders so a tick arriving before the next
        // refresh sees "no resting order" and does nothing, instead of
        // re-triggering this same exit on every tick until the cache
        // catches up.
        cachedOpenSellOrdersByToken.delete(instrument_token);
        exitInProgressByToken.delete(instrument_token);
    }
}

/*
Periodic safety net: any open long option position that doesn't have a
resting SELL order (target or SL) gets the 2% target placed, based on its
current average_price. Also the reconciliation path for positions that
existed before this process (re)started.
*/
async function ensureTargetForOpenPositions(kite, ticker) {

    try {

        let positions = await withRetry(() => kite.getPositions(), 'ensureTargetForOpenPositions getPositions');

        /*
        option buyer only: only long positions need the resting order
        */
        let netPositions = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        if (netPositions.length == 0) {
            return;
        }

        let orders = await withRetry(() => kite.getOrders(), 'ensureTargetForOpenPositions getOrders');

        // Any resting SELL order -- the target, the converted SL, or a
        // marketable exit in flight -- is THE single order for that
        // position. Placing anything else alongside it would get
        // margin-checked by Kite as a naked short and rejected (or worse,
        // accepted and double-sold).
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

            // A tick-driven modify/exit for this token is in flight right
            // now -- the REST snapshot above may have been taken
            // mid-transition. Skip this cycle rather than race it.
            if (exitInProgressByToken.has(position.instrument_token)) {
                continue;
            }

            console.log(
                `⚠️ No resting SELL order for ${position.tradingsymbol}, placing the ${TARGET_PCT}% target`
            );

            // Entry price of the current lot: the observed fill if we saw
            // it, else the latest completed BUY in today's order book.
            // position.average_price (blended across the day's buys) is the
            // last resort only.
            let buyPrice = actualBuyPriceByToken.get(Number(position.instrument_token));
            if (buyPrice == null) {
                const lastBuy = orders
                    .filter(o =>
                        o.tradingsymbol == position.tradingsymbol &&
                        o.transaction_type == "BUY" &&
                        o.status == "COMPLETE" &&
                        o.average_price > 0
                    )
                    .pop();
                buyPrice = lastBuy ? lastBuy.average_price : position.average_price;
                actualBuyPriceByToken.set(Number(position.instrument_token), buyPrice);
            }

            try {

                await placeTargetOrder(kite, {
                    instrument_token: position.instrument_token,
                    tradingsymbol: position.tradingsymbol,
                    exchange: position.exchange,
                    quantity: Math.abs(position.quantity),
                    buyPrice: buyPrice
                });

            } catch (err) {

                console.log(
                    err,
                    `❌ Failed placing target for ${position.tradingsymbol}`
                );
            }
        }

    } catch (err) {

        console.log(
            err,
            "❌ ensureTargetForOpenPositions error"
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


    ticker.connect();
 ticker.on("connect", () => {
    console.log("🟢 Kite Ticker connected");})
     ticker.on("ready", () => {
        console.log("Ticker is ready");
      });

    // Live price (and OI, since we subscribe in full mode) feed for the
    // guard. evaluateTrailingExitOnTick runs on every tick instead of
    // waiting for the next REST poll, so a fast intra-cycle move (a
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
    option buyer only: the single resting order (2% target) is only needed
    against an entry BUY. a completed SELL is an exit (target or SL fill),
    not a new position to protect.
    */
    if (transaction_type == "BUY") {

        subscribeForLiveTicks(ticker, instrument_token);

        // The real cost of this lot -- position.average_price blends every
        // buy of the day and must not be trusted for profit math.
        actualBuyPriceByToken.set(Number(instrument_token), orderUpdate.average_price);

        try {

            await placeTargetOrder(kite, {
                instrument_token,
                tradingsymbol,
                exchange,
                quantity,
                buyPrice: orderUpdate.average_price
            });

        } catch (error) {

            console.log(error);

        }

        return;
    }

    if (transaction_type == "SELL") {

        // A SELL completed. If the position is now flat, cancel any of our
        // orders still resting for this symbol so a stale one can't fire
        // later and open an unintended short. If the position still has
        // quantity (a freeze-chunk partially closing), leave the remaining
        // chunk orders alone -- they're still protecting the remainder.
        try {

            let positions = await kite.getPositions();
            const stillOpen = (positions.net || []).some(
                p => p.tradingsymbol == tradingsymbol && p.quantity > 0
            );

            if (stillOpen) {
                return;
            }

            // Flat now: the recorded entry price belongs to the closed lot,
            // a future buy must not inherit it.
            actualBuyPriceByToken.delete(Number(instrument_token));

            let orders = await kite.getOrders();

            let leftoverOrders = orders.filter(
                o => o.tradingsymbol == tradingsymbol &&
                    o.transaction_type == "SELL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
            );

            for (const order of leftoverOrders) {
                try {
                    await kite.cancelOrder("regular", order.order_id);
                    console.log(`🧹 Cancelled leftover order ${order.order_id} for ${tradingsymbol} (position closed)`);
                } catch (cancelErr) {
                    console.log(cancelErr, `⚠️ Failed cancelling leftover order ${order.order_id} for ${tradingsymbol}`);
                }
            }

        } catch (error) {

            console.log(error, `❌ Post-close cleanup failed for ${tradingsymbol}`);
        }
    }

});




/*
periodic safety net: catches any position that somehow ended up without
its resting target/SL order and places the 2% target
*/

setInterval(() => {

    ensureTargetForOpenPositions(kite, ticker);

}, 10000);

/*
Keeps the guard caches (positions, resting SELL orders, 3-candle low)
current. The actual modify/exit decisions happen per tick in
evaluateTrailingExitOnTick, not here -- this only refreshes the REST-backed
data it reads from.
*/

refreshTrailingCache(kite, ticker); // warm the cache immediately, don't wait for the first interval tick

setInterval(() => {

    refreshTrailingCache(kite, ticker);

}, 15000);


} // <- closes main()
