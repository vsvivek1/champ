/*
What a round trip actually costs, so the P&L on screen is the money that
reaches the account.

WHY

Every number in the app was gross: (sell - buy) x qty. On a small premium
that is not a rounding error, it is the whole result. One lot of NIFTY
(75) bought at 100 and sold at 101 looks like +75 and is about +22 after
costs. A scalp that "broke even" lost money, and the review called it
flat. The entry price on the chart had the same problem: the line sat at
the buy price, but the price that gets you out whole is higher than that.

WHAT IS CHARGED (Zerodha, index options, intraday or carried)

  brokerage     flat ₹20 per executed order, both sides
  STT           0.1% of the SELL premium only
  exchange txn  % of premium, per side, different for NSE and BSE
  SEBI          ₹10 per crore of premium, per side
  GST           18% on (brokerage + exchange txn + SEBI), per side
  stamp duty    0.003% of the BUY premium only

Two of them are one-sided and that is the part worth remembering: STT is
charged when you sell, stamp duty when you buy. So the two legs of the
same trade do not cost the same.

RATES CHANGE. They are in charges.json so they can be corrected without
touching code; the defaults below are what applied when this was written
(06/11/2026). If a bill does not match, fix the file, not this file.

ORDER COUNT MATTERS. Brokerage is per ORDER, not per trade, and
placeOrderInFreezeChunks splits a large quantity into several orders --
each one its own ₹20. Callers that know they chunked should pass the
count; the default of 1 per side is the common case and understates a
chunked entry rather than inventing a number.
*/

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'charges.json');

const DEFAULTS = {
    brokeragePerOrder: 20,      // ₹ flat, per executed order, each side
    sttPctSell: 0.1,            // % of sell premium turnover (SELL side only)
    stampPctBuy: 0.003,         // % of buy premium turnover (BUY side only)
    sebiPerCrore: 10,           // ₹ per crore of premium turnover, each side
    gstPct: 18,                 // % on brokerage + exchange txn + SEBI
    txnPct: {                   // exchange transaction charge, % of premium
        NFO: 0.03503,           // NSE options
        BFO: 0.0325,            // BSE options (SENSEX)
    },
    txnPctDefault: 0.03503,     // anything else: assume NSE rates
};

let cache = null, cacheAt = 0;

function readRates() {
    // re-read at most once a minute: this is called per tick in places
    if (cache && Date.now() - cacheAt < 60000) return cache;
    let onDisk = {};
    try { onDisk = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) { /* defaults */ }
    cache = {
        ...DEFAULTS, ...onDisk,
        txnPct: { ...DEFAULTS.txnPct, ...(onDisk.txnPct || {}) },
    };
    cacheAt = Date.now();
    return cache;
}

function txnPctFor(exchange, r) {
    const key = String(exchange || '').toUpperCase();
    return r.txnPct[key] != null ? r.txnPct[key] : r.txnPctDefault;
}

/*
The cost of ONE side.

  side      'buy' or 'sell' -- decides STT vs stamp duty
  turnover  premium x quantity for that side
  orders    executed orders on that side (brokerage is per order)
*/
function sideCharges({ side, turnover, exchange, orders = 1 }) {
    const r = readRates();
    const t = Math.max(0, Number(turnover) || 0);
    const n = Math.max(1, Math.round(Number(orders) || 1));

    const brokerage = r.brokeragePerOrder * n;
    const txn = t * txnPctFor(exchange, r) / 100;
    const sebi = t * (r.sebiPerCrore / 10000000);
    const gst = (brokerage + txn + sebi) * r.gstPct / 100;
    const stt = side === 'sell' ? t * r.sttPctSell / 100 : 0;
    const stamp = side === 'buy' ? t * r.stampPctBuy / 100 : 0;

    const total = brokerage + txn + sebi + gst + stt + stamp;
    const r2 = v => +v.toFixed(2);
    return {
        brokerage: r2(brokerage), txn: r2(txn), sebi: r2(sebi),
        gst: r2(gst), stt: r2(stt), stamp: r2(stamp), total: r2(total),
    };
}

/*
The whole round trip, with the sell leg optional.

Called with no sell price it answers the question you have at ENTRY: what
does this position already owe, and what does the price have to reach
before the trade is worth anything. Called with one it answers the
question you have at EXIT: what did this actually make.

  breakEven -- the sell price at which net P&L is zero. This is the number
               that belongs on the chart instead of the raw buy price:
               above the entry line, by exactly what the trade costs.
*/
function roundTrip({ buy, sell, quantity, exchange, buyOrders = 1, sellOrders = 1 }) {
    const qty = Math.max(0, Number(quantity) || 0);
    const b = Number(buy) || 0;
    const hasSell = sell != null && Number(sell) > 0;
    const s = hasSell ? Number(sell) : 0;

    const entry = sideCharges({ side: 'buy', turnover: b * qty, exchange, orders: buyOrders });

    /*
    With no sell price yet, the exit leg still has to be estimated or the
    break-even is wrong. Estimate it at the BUY price: close enough at the
    distances that matter, and the error is in the safe direction for a
    winner (a higher sell costs slightly more than quoted).
    */
    const exit = sideCharges({
        side: 'sell', turnover: (hasSell ? s : b) * qty, exchange, orders: sellOrders,
    });

    const total = +(entry.total + exit.total).toFixed(2);
    const gross = hasSell ? +((s - b) * qty).toFixed(2) : null;
    const net = gross != null ? +(gross - total).toFixed(2) : null;

    return {
        entry, exit, total,
        gross, net,
        // what one unit of premium has to move just to pay the costs
        perUnit: qty > 0 ? +(total / qty).toFixed(2) : null,
        breakEven: qty > 0 && b > 0 ? +(b + total / qty).toFixed(2) : null,
        breakEvenPct: qty > 0 && b > 0 ? +((total / qty) / b * 100).toFixed(2) : null,
    };
}

/*
Net P&L alone, for the many places that only want the number. Returns null
rather than a guess when it has nothing to work with -- a wrong net is
worse than an honest gross, because it would be trusted.
*/
function netPnl({ buy, sell, quantity, exchange, buyOrders, sellOrders }) {
    if (!(Number(buy) > 0) || !(Number(sell) > 0) || !(Number(quantity) > 0)) return null;
    return roundTrip({ buy, sell, quantity, exchange, buyOrders, sellOrders }).net;
}

module.exports = { sideCharges, roundTrip, netPnl, readRates, DEFAULTS };
