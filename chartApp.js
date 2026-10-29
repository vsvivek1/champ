
/*

chartApp.js -- self-hosted Zerodha-style live chart dashboard.

- Pick NIFTY or SENSEX: spot chart with yesterday's high/low lines and a
  live INSIDE/OUTSIDE yesterday's-range badge.
- The CE and PE n strikes away from spot (nearest expiry) charted
  alongside, all three fed by the same live tick stream (one KiteTicker,
  forwarded to the browser over a WebSocket).
- Position panel: current qty, entry, P&L for this entry and day total,
  the single resting SELL order, and place/modify Target (LIMIT) or
  SL (SL) -- always by MODIFYING the one resting order when it exists
  (a second resting SELL gets margin-checked as a naked short).
- The GUARD (what used to be simpleGuard.js) is built in: on a BUY fill it
  places the one resting SELL (target or SL), freezes the 3-candle breach
  level, and exits the moment a live tick breaks it. See the BUILT-IN GUARD
  section below.

- After every close: a full-page REVIEW (trade P&L + today's history + a
  verdict saying what went wrong), and if the exit was a stop (SL order or
  guard breach) NEW ENTRIES ARE LOCKED FOR 10 MINUTES. See the POST-TRADE
  REVIEW section below. Exits are never locked.

Runs standalone on PORT below -- ONE process, nothing else to start. Do not
run simpleGuard.js / stopLossGuard.js / targetGuard.js alongside it: two
guards would each place a SELL on the same fill (margin rejection).

*/

console.log("🚀 chartApp starting", new Date().toISOString());

process.on('unhandledRejection', r => console.error('🔥 UNHANDLED REJECTION', r));
process.on('uncaughtException', e => console.error('💥 UNCAUGHT EXCEPTION', e.stack || e));

const fs = require('fs');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
// older ws versions export the server class as WebSocket.Server
const WebSocketServer = WebSocket.WebSocketServer || WebSocket.Server;
const dayjs = require('dayjs');

const { connectToDatabase } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const AccessTokens = require('./models/AccessTokens');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');
const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');
const { initAlerts, alertPhone, marketOpenIst } = require('./chartAlerts.js');

const PORT = 3456;
const TICK = 0.05;

const INDICES = {
    NIFTY: { spotKey: "NSE:NIFTY 50", spotToken: 256265, optName: "NIFTY", optExchange: "NFO", strikeStep: 50 },
    SENSEX: { spotKey: "BSE:SENSEX", spotToken: 265, optName: "SENSEX", optExchange: "BFO", strikeStep: 100 },
};

const RESTING_ORDER_STATUSES = ["TRIGGER PENDING", "OPEN"];

function roundToTick(v) { return +(Math.round(v / TICK) * TICK).toFixed(2); }

/*
Kite's HTTP client aborts a call now and then (ECONNABORTED / NetworkException)
and rate-limits a burst -- and a page reload fires one: setup + three candle
calls + margin + positions. One such miss used to 500 /api/position, which
blanked the dashboard's positions table, so give a transient failure two more
goes before handing the error up.
*/
async function kiteRetry(fn, tries = 3, waitMs = 350) {
    let last;
    for (let i = 0; i < tries; i++) {
        try { return await fn(); } catch (e) { last = e; }
        await new Promise(r => setTimeout(r, waitMs * (i + 1)));
    }
    throw last;
}

let kite, ticker;
let optionInstruments = [];          // NFO + BFO option master
const lotSizeByToken = new Map();
const instByToken = new Map();       // token -> the option's master row (symbol, exchange)

// tokens the dashboard currently charts (spot + CE + PE)
let chartedTokens = [];

/*
Tokens of instruments we actually HOLD. Subscribed on top of the charted ones
and never unsubscribed while the position is open, so the live P&L on an open
entry keeps ticking even when that strike is not one of the two on screen.
Harvested from /api/position (no extra Kite call).
*/
const heldTokens = new Set();
function subscribeHeld() {
    const toks = [...heldTokens].filter(t => !chartedTokens.includes(t));
    if (toks.length == 0) return;
    try {
        ticker.subscribe(toks);
        ticker.setMode(ticker.modeFull, toks);
    } catch (e) {
        console.log("⚠️ held subscribe failed", e.message || e);
    }
}

// browser clients
const wsClients = new Set();

function subscribeCharted() {
    if (chartedTokens.length == 0) return;
    try {
        ticker.subscribe(chartedTokens);
        ticker.setMode(ticker.modeFull, chartedTokens); // full: ltp + day volume + OI
    } catch (e) {
        console.log("⚠️ subscribe failed", e.message || e);
    }
}

function setChartedTokens(tokens) {
    // never unsubscribe a token a pending trigger still watches
    const needed = new Set(spotTriggers.flatMap(t => [Number(t.spotToken), Number(t.token)]));
    for (const t of heldTokens) needed.add(Number(t));   // an open position keeps its ticks
    for (const t of guardTokens) needed.add(Number(t));  // the guard watches its own tokens
    const old = chartedTokens.filter(t => !tokens.includes(t) && !needed.has(Number(t)));
    chartedTokens = tokens;
    try { if (old.length) ticker.unsubscribe(old); } catch (e) { /* ignore */ }
    subscribeCharted();
}

function broadcast(obj) {
    const p = JSON.stringify(obj);
    for (const c of wsClients) if (c.readyState == 1) c.send(p);
    phoneAlertFor(obj);
}

// Trigger outcomes go to the phone too, not just to open browser tabs.
function phoneAlertFor(obj) {
    if (obj.type == 'trigger_fired') {
        alertPhone(`⚡ Trigger #${obj.id} fired`,
            `${String(obj.action).toUpperCase()} ${obj.tradingsymbol} at level ${obj.level}`);
    } else if (obj.type == 'trigger_failed') {
        alertPhone(`❌ Trigger #${obj.id} failed`, obj.error || 'order failed');
    }
}

/*
Fills and rejections from Kite's order_update stream. Kite sends several
updates per order (OPEN, UPDATE, COMPLETE...), so only the final states
alert, once per order_id + status.
*/
const alertedOrders = new Set();
function phoneAlertForOrder(u) {
    if (!['COMPLETE', 'REJECTED'].includes(u.status)) return;
    const k = `${u.order_id}:${u.status}`;
    if (alertedOrders.has(k)) return;
    alertedOrders.add(k);
    const qty = u.filled_quantity || u.quantity;
    const px = u.average_price || u.price;
    if (u.status == 'REJECTED') {
        alertPhone(`🚫 ${u.transaction_type} rejected: ${u.tradingsymbol}`,
            u.status_message || 'rejected by Kite', { key: k });
    } else if (u.transaction_type == 'BUY') {
        alertPhone(`✅ Bought ${u.tradingsymbol}`, `${qty} @ ${px}`, { key: k });
    } else {
        alertPhone(`💰 Sold ${u.tradingsymbol}`, `${qty} @ ${px}${u.tag ? ` (${u.tag})` : ''}`, { key: k });
    }
}

/*
Unprotected position watch: during market hours, every 30s, any long F&O
position with no resting SELL (target or SL) for two checks in a row
alerts once; it re-arms when the position is covered or closed. Two
checks, so the few seconds between a fill and simpleGuard's target don't
cause false alarms.
*/
const nakedSince = new Map();   // tradingsymbol -> consecutive naked checks
async function checkNakedPositions() {
    if (!marketOpenIst()) return;
    try {
        const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
        const longs = (positions.net || []).filter(p =>
            (p.exchange == 'NFO' || p.exchange == 'BFO') && p.quantity > 0);
        const seen = new Set();
        for (const p of longs) {
            seen.add(p.tradingsymbol);
            const covered = orders.some(o => o.tradingsymbol == p.tradingsymbol &&
                o.transaction_type == 'SELL' && RESTING_ORDER_STATUSES.includes(o.status));
            if (covered) { nakedSince.delete(p.tradingsymbol); continue; }
            const n = (nakedSince.get(p.tradingsymbol) || 0) + 1;
            nakedSince.set(p.tradingsymbol, n);
            if (n == 2) {
                alertPhone(`⚠️ No reverse order: ${p.tradingsymbol}`,
                    `${p.quantity} qty open with no resting SELL (target/SL). Check simpleGuard.`,
                    { key: `naked:${p.tradingsymbol}` });
            }
        }
        for (const sym of [...nakedSince.keys()]) if (!seen.has(sym)) nakedSince.delete(sym);
    } catch (e) {
        console.log('⚠️ naked-position check failed', e.message || e);
    }
}

/*
Price-level triggers, watched server-side on the tick stream; one-shot.
Two flavours, set by `watch`:
  'spot'   — "BUY/SELL the loaded CE/PE when the INDEX crosses a level"
  'option' — "BUY/SELL this option when ITS OWN price reaches a level"
`watchToken` is the instrument whose ticks arm the trigger, so the matching
loop does not care which flavour it is. Persisted to disk so a restart keeps
them — but only same-day triggers are restored (an overnight gap firing a
stale trigger at open would be dangerous).
*/
let spotTriggers = [];
let trigSeq = 1;
const lastLtpByToken = new Map();

/*
Rolling 5s candles built from live ticks (Kite has no history below 1min).
Covers every charted token (spot + CE + PE) from the moment it's charted.
The first bucket swallows the day's cumulative volume so far, so the sum of
bucket volumes always equals the day's cumulative — the page's live-volume
math (cumVol − volBase) stays consistent. Capped at a full session.
*/
// Kite timestamps arrive as Date objects; anything unparseable becomes null
// rather than a string the page would silently fail to read.
function isoOrNull(v) {
    if (!v) return null;
    const d = v instanceof Date ? v : new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

const SEC_BUCKET = 5, SEC_CAP = 5400; // 5400 × 5s = 7.5h
const secCandles = new Map();  // token -> [{time,open,high,low,close,volume,oi}]
const secVolBase = new Map();  // token -> day volume attributed to closed buckets
function pushSecTick(tok, ltp, cumVol, oi) {
    const bucket = Math.floor(Date.now() / 1000 / SEC_BUCKET) * SEC_BUCKET;
    let arr = secCandles.get(tok);
    if (!arr) { arr = []; secCandles.set(tok, arr); }
    let c = arr[arr.length - 1];
    if (!c || bucket > c.time) {
        if (c) secVolBase.set(tok, (secVolBase.get(tok) || 0) + (c.volume || 0));
        else secVolBase.set(tok, 0);
        c = {
            time: bucket, open: ltp, high: ltp, low: ltp, close: ltp,
            volume: Math.max(0, cumVol - (secVolBase.get(tok) || 0)), oi: oi || 0
        };
        arr.push(c);
        if (arr.length > SEC_CAP) arr.shift();
    } else {
        c.high = Math.max(c.high, ltp);
        c.low = Math.min(c.low, ltp);
        c.close = ltp;
        if (cumVol) c.volume = Math.max(0, cumVol - (secVolBase.get(tok) || 0));
        if (oi) c.oi = oi;
    }
}
const TRIG_FILE = path.join(__dirname, 'chartTriggers.json');

function saveTriggers() {
    try {
        fs.writeFileSync(TRIG_FILE, JSON.stringify({ seq: trigSeq, triggers: spotTriggers }, null, 2));
    } catch (e) { console.log('⚠️ trigger save failed', e.message || e); }
}

function loadTriggers() {
    try {
        if (!fs.existsSync(TRIG_FILE)) return;
        const d = JSON.parse(fs.readFileSync(TRIG_FILE, 'utf8'));
        trigSeq = d.seq || 1;
        const today = dayjs().format('YYYY-MM-DD');
        const all = d.triggers || [];
        spotTriggers = all.filter(t => (t.created || '').slice(0, 10) == today);
        const dropped = all.length - spotTriggers.length;
        if (dropped) { console.log(`🗑 dropped ${dropped} stale trigger(s) from a previous day`); saveTriggers(); }
        if (spotTriggers.length) console.log(`🔁 restored ${spotTriggers.length} pending trigger(s):`,
            spotTriggers.map(t => `#${t.id} ${t.action.toUpperCase()} ${t.tradingsymbol} ${t.direction} ${t.level}`).join(' | '));
    } catch (e) { console.log('⚠️ trigger load failed', e.message || e); }
}

// pending triggers must get ticks even before anyone presses Load in the browser
function subscribeTriggerTokens() {
    const toks = [...new Set(spotTriggers.flatMap(t => [Number(t.spotToken), Number(t.token)]))].filter(Boolean);
    if (!toks.length) return;
    try {
        ticker.subscribe(toks);
        ticker.setMode(ticker.modeFull, toks);
    } catch (e) { console.log('⚠️ trigger subscribe failed', e.message || e); }
}

/*
Dump long option positions NOW at a deep marketable LIMIT (ltp × 0.97 —
Kite rejects plain MARKET). Resting SELLs are MODIFIED to that price
(single-resting-order rule); any uncovered remainder gets fresh SELL
chunks. only = one tradingsymbol, null = everything. Used by the EXIT
buttons (/api/exit) and by 'exitall' spot triggers.
*/
async function exitAllLongs(only, reason) {
    const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
    const longs = (positions.net || []).filter(p =>
        (p.exchange == "NFO" || p.exchange == "BFO") && p.quantity > 0 &&
        (!only || p.tradingsymbol == only));
    const done = [];
    for (const p of longs) {
        const ltp = p.last_price || lastLtpByToken.get(Number(p.instrument_token));
        const price = roundToTick(ltp * 0.97);
        const resting = orders.filter(o =>
            o.tradingsymbol == p.tradingsymbol && o.transaction_type == "SELL" &&
            RESTING_ORDER_STATUSES.includes(o.status));
        const ids = [];
        let covered = 0;
        for (const o of resting) {
            await kite.modifyOrder("regular", o.order_id, { order_type: "LIMIT", price, trigger_price: 0 });
            ids.push(o.order_id);
            covered += o.quantity - (o.filled_quantity || 0);
        }
        const remaining = p.quantity - covered;
        if (remaining > 0) {
            const newIds = await placeOrderInFreezeChunks(kite, {
                exchange: p.exchange, tradingsymbol: p.tradingsymbol,
                transaction_type: "SELL", quantity: remaining,
                order_type: "LIMIT", price,
                product: p.product || "NRML", validity: "DAY", tag: "EXIT"
            }, lotSizeByToken.get(Number(p.instrument_token)) || remaining);
            ids.push(...newIds);
        }
        noteExitReason(p.instrument_token, reason || 'manual_exit');
        console.log(`🚨 EXIT ${p.tradingsymbol}: ${p.quantity} qty @ ${price} → ${ids.join(',')}`);
        done.push({ tradingsymbol: p.tradingsymbol, quantity: p.quantity, price, order_ids: ids });
    }
    return done;
}

/*
Per-entry "what to place on this fill" override, keyed by instrument token.
The guard normally reads guardSettings.json, which is one global choice for
every fill. This file lets a single entry say "SL first" without flipping that
global and having to remember to flip it back. Written just BEFORE the BUY goes
out, so it is already on disk when the fill arrives; takeFirstOrderOverride
consumes and deletes the entry, so it applies to exactly one fill (a file, not
a Map, so a restart between the BUY and its fill still honours the choice).

Same shape and failure style as breachOverride.json: if the file is missing or
unreadable, everyone falls back to the global setting.
*/
const FIRST_ORDER_FILE = path.join(__dirname, 'firstOrderOverride.json');
function setFirstOrderOverride(token, which) {
    if (!['target', 'sl'].includes(which) || !(Number(token) > 0)) return false;
    let ov = {};
    try { ov = JSON.parse(fs.readFileSync(FIRST_ORDER_FILE, 'utf8')); } catch (e) { }
    ov[Number(token)] = { which, at: new Date().toISOString() };
    try { fs.writeFileSync(FIRST_ORDER_FILE, JSON.stringify(ov, null, 2)); }
    catch (e) { console.log(e, '❌ could not write firstOrderOverride'); return false; }
    console.log(`📌 on this fill for token ${token}: ${which.toUpperCase()} first (one fill only)`);
    return true;
}

async function fireTrigger(trig, spotLtp) {
    // spotLtp is the watched instrument's ltp -- the index for a spot trigger,
    // the option's own price for an option trigger. Name the right one in logs.
    const firedAt = trig.watch == 'option' ? `${trig.tradingsymbol} ${spotLtp}` : `spot ${spotLtp}`;
    try {
        if (trig.action == 'exitall') {
            const done = await exitAllLongs(null, 'trigger_sell');
            console.log(`⚡ trigger #${trig.id} fired at ${firedAt}: EXIT ALL → ${done.map(d => `${d.tradingsymbol} ${d.quantity} @ ${d.price}`).join(' | ') || 'nothing open'}`);
            broadcast({ type: "trigger_fired", id: trig.id, action: 'exitall', tradingsymbol: done.map(d => d.tradingsymbol).join(',') || 'no longs', level: trig.level, order_ids: done.flatMap(d => d.order_ids) });
            return;
        }
        let optLtp = lastLtpByToken.get(Number(trig.token));
        if (!optLtp) {
            const key = `${trig.exchange}:${trig.tradingsymbol}`;
            const q = await kite.getLTP([key]);
            optLtp = q[key].last_price;
        }
        let orderIds = [];
        if (trig.action == 'sell') {
            /*
            Exit the open long position. Single-resting-order rule: if a SELL
            is already resting, MODIFY it to a marketable LIMIT — never add
            a second SELL (margin-rejected as naked short).
            */
            const positions = await kite.getPositions();
            const pos = (positions.net || []).find(p =>
                p.tradingsymbol == trig.tradingsymbol && p.exchange == trig.exchange && p.quantity > 0);
            if (!pos) throw new Error(`no open long position in ${trig.tradingsymbol}`);
            noteExitReason(Number(trig.token), 'trigger_sell', `price trigger #${trig.id} ${trig.direction} ${trig.level}`);
            const sellPrice = roundToTick(optLtp * 0.98); // marketable LIMIT
            const orders = await kite.getOrders();
            const resting = orders.filter(o =>
                o.tradingsymbol == trig.tradingsymbol && o.transaction_type == 'SELL' &&
                ['OPEN', 'TRIGGER PENDING'].includes(o.status));
            if (resting.length) {
                for (const o of resting) {
                    await kite.modifyOrder('regular', o.order_id, { order_type: 'LIMIT', price: sellPrice, trigger_price: 0 });
                    orderIds.push(o.order_id);
                }
            } else {
                orderIds = await placeOrderInFreezeChunks(kite, {
                    exchange: trig.exchange, tradingsymbol: trig.tradingsymbol,
                    transaction_type: "SELL", quantity: pos.quantity,
                    order_type: "LIMIT", price: sellPrice,
                    product: "NRML", validity: "DAY", tag: "SPOTTRIG"
                }, lotSizeByToken.get(Number(trig.token)));
            }
            console.log(`⚡ trigger #${trig.id} fired at ${firedAt}: SELL ${trig.tradingsymbol} @ ${sellPrice} → ${orderIds.join(',')}`);
        } else {
            // the gate has to stop a parked trigger from entering too: it was
            // armed minutes ago, and the clock/streak/lock may have turned since
            const g = noTradeChecks({ premium: optLtp, tradingsymbol: trig.tradingsymbol });
            if (g.blocked) {
                const why = g.blockers.map(b => b.label).join(' | ');
                console.log(`⛔ trigger #${trig.id} BUY ${trig.tradingsymbol} SKIPPED — ${why}`);
                broadcast({ type: "trigger_failed", id: trig.id, error: `NO TRADE: ${why}` });
                return;
            }
            const price = roundToTick(optLtp * 1.02); // marketable LIMIT
            // must be on disk before the BUY: the fill can land immediately
            if (trig.firstOrder) setFirstOrderOverride(trig.token, trig.firstOrder);
            orderIds = await placeOrderInFreezeChunks(kite, {
                exchange: trig.exchange,
                tradingsymbol: trig.tradingsymbol,
                transaction_type: "BUY",
                quantity: trig.quantity,
                order_type: "LIMIT",
                price,
                product: "NRML",
                validity: "DAY",
                tag: "SPOTTRIG"
            }, lotSizeByToken.get(Number(trig.token)));
            console.log(`⚡ trigger #${trig.id} fired at ${firedAt}: BUY ${trig.quantity} ${trig.tradingsymbol} @ ${price} → ${orderIds.join(',')}`);
        }
        broadcast({ type: "trigger_fired", id: trig.id, action: trig.action, tradingsymbol: trig.tradingsymbol, level: trig.level, order_ids: orderIds });
    } catch (e) {
        console.log(e, `❌ trigger #${trig.id} order failed`);
        broadcast({ type: "trigger_failed", id: trig.id, error: String(e.message || e) });
    }
}

function checkSpotTriggers(token, ltp) {
    if (spotTriggers.length == 0) return;
    /*
    Match on watchToken -- the index spot for a spot trigger, the option
    itself for an option trigger. Triggers restored from a file written
    before `watch` existed have no watchToken; those were all spot-watched.
    */
    const due = spotTriggers.filter(g => Number(g.watchToken || g.spotToken) == Number(token) &&
        ((g.direction == 'above' && ltp >= g.level) ||
         (g.direction == 'below' && ltp <= g.level)));
    if (due.length == 0) return;
    spotTriggers = spotTriggers.filter(g => !due.includes(g)); // remove first: no double-fire on the next tick
    saveTriggers();
    for (const g of due) fireTrigger(g, ltp);
}

/*
Resolve the CE/PE n strikes away from spot for the nearest expiry.
CE strike = ATM + n*step, PE strike = ATM - n*step (n=0 -> both ATM).
want = {ceStrike, peStrike} overrides the offset math (auto-strike mode);
those are snapped to the nearest strike that actually trades.
*/
function resolveOptions(indexKey, spot, offset, want) {

    const idx = INDICES[indexKey];
    const atm = Math.round(spot / idx.strikeStep) * idx.strikeStep;
    const ceStrike = want ? want.ceStrike : atm + offset * idx.strikeStep;
    const peStrike = want ? want.peStrike : atm - offset * idx.strikeStep;

    const today = dayjs().startOf('day');

    const candidates = optionInstruments.filter(i =>
        i.exchange == idx.optExchange &&
        i.name == idx.optName &&
        dayjs(i.expiry).isAfter(today.subtract(1, 'day'))
    );

    if (candidates.length == 0) return null;

    const nearestExpiry = candidates
        .map(i => dayjs(i.expiry).format('YYYY-MM-DD'))
        .sort()[0];

    const atExpiry = candidates.filter(i => dayjs(i.expiry).format('YYYY-MM-DD') == nearestExpiry);

    const snap = (type, target) => {
        let best = null;
        for (const i of atExpiry) {
            if (i.instrument_type != type) continue;
            if (!best || Math.abs(Number(i.strike) - target) < Math.abs(Number(best.strike) - target)) best = i;
        }
        return best;
    };

    const ce = atExpiry.find(i => i.instrument_type == "CE" && Number(i.strike) == ceStrike)
        || (want && snap("CE", ceStrike));
    const pe = atExpiry.find(i => i.instrument_type == "PE" && Number(i.strike) == peStrike)
        || (want && snap("PE", peStrike));

    return { atm, expiry: nearestExpiry, ce, pe };
}

/*
Auto-strike: OTM strike = spot ± 0.6 × spot × IV × √(D/365), rounded to the
index's strike step (50 NIFTY / 100 SENSEX). + for CE, − for PE.
D = calendar days to nearest expiry counting today as 1; 0.5 on expiry
afternoon (≥12:00 IST). IV from India VIX, fallback 0.13.
*/
async function autoStrikes(idx, spot, expiry) {
    let D = dayjs(expiry).startOf('day').diff(dayjs().startOf('day'), 'day') + 1;
    if (D <= 1 && dayjs().hour() >= 12) D = 0.5;
    let iv = 0.13, ivSource = 'fallback';
    try {
        const v = await kite.getLTP(["NSE:INDIA VIX"]);
        if (v["NSE:INDIA VIX"] && v["NSE:INDIA VIX"].last_price > 0) {
            iv = v["NSE:INDIA VIX"].last_price / 100;
            ivSource = 'India VIX';
        }
    } catch (e) { /* keep fallback */ }
    const dist = 0.6 * spot * iv * Math.sqrt(D / 365);
    const step = idx.strikeStep;
    return {
        iv: +iv.toFixed(4), ivSource, D, dist: Math.round(dist),
        ceStrike: Math.round((spot + dist) / step) * step,
        peStrike: Math.round((spot - dist) / step) * step,
    };
}

// Keep only the candles of the latest date in `data` (Kite returns oldest first).
function lastSession(data) {
    if (!data || data.length == 0) return [];
    const day = c => dayjs(c.date).format('YYYY-MM-DD');
    const last = day(data[data.length - 1]);
    return data.filter(c => day(c) == last);
}

async function yesterdayRange(spotToken) {
    const from = dayjs().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss');
    const to = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const days = await kite.getHistoricalData(spotToken, 'day', from, to);
    const todayStr = dayjs().format('YYYY-MM-DD');
    const prior = days.filter(c => dayjs(c.date).format('YYYY-MM-DD') != todayStr);
    if (prior.length == 0) return null;
    const y = prior[prior.length - 1];
    return { high: y.high, low: y.low, date: dayjs(y.date).format('YYYY-MM-DD') };
}

/* =====================================================================
BUILT-IN GUARD -- this is simpleGuard.js, now living inside chartApp so
there is only ONE process to run (and only one KiteTicker / order_update
stream). Behaviour is unchanged:

1. On a BUY fill (order_update): record the actual fill price and place
   ONE resting SELL -- a LIMIT target at fill + targetPct%, or an SL at
   fill - slPct%, per guardSettings.json (a per-entry choice from the
   chart wins once).
2. Freeze a breach level at entry = lowest low of the last CANDLE_COUNT
   COMPLETED 1-min candles. Never recomputed while the position is open;
   the chart can drag it (POST /api/breach), which now applies instantly
   instead of within one refresh.
3. Every live tick: the moment LTP <= breach level, MODIFY that same
   resting order into a marketable LIMIT (never a second SELL -- Kite
   margin-checks a second resting SELL as a naked short and rejects it).

IMPORTANT: do NOT also run simpleGuard.js / stopLossGuard.js / targetGuard.js
as separate processes -- two guards would both place a target on the same
buy (duplicate SELL -> margin rejection). `pm2 delete simpleGuard`.
===================================================================== */

const GUARD_REFRESH_MS = 15000;    // positions/orders/level refresh
const CANDLE_COUNT = 3;            // completed candles forming the breach level
const TARGET_ORDER_TAG = 'TGT50PCT';
const OPTION_EXCHANGES = ['NFO', 'BFO'];
const FIRST_ORDER_TTL_MIN = 15;

const GUARD_SETTINGS_FILE = path.join(__dirname, 'guardSettings.json');
const GUARD_DEFAULTS = {
    firstOrder: 'target', targetPct: 50, slPct: 2,
    partialPct: 50,       // share of the lot sold at the immediate resistance
    /*
    How the partial is taken:
      'app'      ONE SL at the exchange for the WHOLE position, and this app
                 sells the partial when price reaches the level. The entire
                 position is stopped exchange-side at all times.
      'exchange' the partial rests as a real LIMIT at the level and the SL
                 covers only the remainder. The partial then fills even if
                 this app is dead -- but the partial's half has no
                 exchange-side stop, which is exactly the hole that cost
                 INR 7,947 on 28/10. A missed profit-take costs nothing by
                 comparison, so 'app' is the default.
    */
    partialMode: 'app',
    trail: true,          // a cleared resistance becomes the new stop
    levelGapPct: 2,       // ignore a resistance closer than this (inside the noise)
    levelMaxPct: 60,      // ignore one further than this (not a target, a dream)
    slMode: 'level',      // 'level' = stop just under the immediate support, 'pct' = flat slPct
    slMaxPct: 8           // and never further from entry than this, whatever the support says
};
const PIVOT_WIN = 2;            // bars each side of a 1-min swing pivot
const LEVEL_CLUSTER_PCT = 0.75; // pivots within this % of each other are one level
const TRAIL_CLEAR_PCT = 0.5;    // price must clear a level by this much before it becomes the stop
const GUARD_STATE_FILE = path.join(__dirname, 'guardState.json');
const BREACH_OVERRIDE_FILE = path.join(__dirname, 'breachOverride.json');
const TRADE_LOG_FILE = path.join(__dirname, 'tradeLog.json');

const guardStartedAt = Date.now();

function roundDownToTick(v) { return +(Math.floor(v / TICK) * TICK).toFixed(2); }
// a target rounds UP so the locked profit is never less than targetPct
function roundUpToTick(v) { return +(Math.ceil(v / TICK) * TICK).toFixed(2); }

/*
What to place on a BUY fill -- editable from the dashboard, stored in
guardSettings.json. Read fresh at every placement so a change applies to
the NEXT fill with no restart.
*/
function readGuardSettings() {
    const def = { ...GUARD_DEFAULTS };
    try {
        const s = { ...def, ...JSON.parse(fs.readFileSync(GUARD_SETTINGS_FILE, 'utf8')) };
        if (!['target', 'sl'].includes(s.firstOrder)) s.firstOrder = def.firstOrder;
        if (!(s.targetPct > 0 && s.targetPct <= 50)) s.targetPct = def.targetPct;
        if (!(s.slPct > 0 && s.slPct <= 50)) s.slPct = def.slPct;
        if (!(s.partialPct >= 0 && s.partialPct < 100)) s.partialPct = def.partialPct;
        if (!(s.levelGapPct >= 0 && s.levelGapPct <= 50)) s.levelGapPct = def.levelGapPct;
        if (!(s.levelMaxPct > 0 && s.levelMaxPct <= 300)) s.levelMaxPct = def.levelMaxPct;
        if (!['level', 'pct'].includes(s.slMode)) s.slMode = def.slMode;
        if (!['app', 'exchange'].includes(s.partialMode)) s.partialMode = def.partialMode;
        if (!(s.slMaxPct >= s.slPct && s.slMaxPct <= 50)) s.slMaxPct = Math.max(s.slPct, def.slMaxPct);
        s.trail = s.trail !== false;
        return s;
    } catch (e) {
        return def;
    }
}

/*
Per-entry "what to place on this fill", written by setFirstOrderOverride
just before a BUY goes out. Read once and deleted, so it can never apply
to a second fill. An entry whose BUY was rejected and never filled is
retired by age instead.
*/
function takeFirstOrderOverride(token) {
    try {
        const ov = JSON.parse(fs.readFileSync(FIRST_ORDER_FILE, 'utf8'));
        const e = ov[Number(token)];
        if (!e) return null;
        // tolerate the plain-string form in case an old file is lying around
        const which = typeof e == 'string' ? e : e.which;
        const at = typeof e == 'string' ? null : e.at;
        delete ov[Number(token)];
        fs.writeFileSync(FIRST_ORDER_FILE, JSON.stringify(ov, null, 2));
        if (!['target', 'sl'].includes(which)) return null;
        if (at && dayjs().diff(dayjs(at), 'minute') > FIRST_ORDER_TTL_MIN) {
            console.log(`⏭ ignoring a ${FIRST_ORDER_TTL_MIN}min+ stale on-fill choice for token ${token} (its BUY never filled)`);
            return null;
        }
        return which;
    } catch (e) {
        return null;
    }
}

// instrument_token -> actual entry fill of the CURRENT lot (from the BUY
// order_update). Kite's position.average_price blends every buy of the day
// and must not be used.
const actualBuyPriceByToken = new Map();

// per-token caches the guard's tick check reads (kept current by guardRefresh)
const guardPositionByToken = new Map();
const guardRestingByToken = new Map();
const breachLevelByToken = new Map();
const breachSymbolByToken = new Map();

// a modify fired from an earlier tick is still in flight for this token
const exitInProgressByToken = new Set();

// tokens the guard needs ticks for (an open position), so setChartedTokens
// never unsubscribes one
const guardTokens = new Set();

function subscribeGuard() {
    const toks = [...guardTokens];
    if (toks.length == 0) return;
    try {
        ticker.subscribe(toks);
        ticker.setMode(ticker.modeFull, toks);
    } catch (e) { console.log('⚠️ guard subscribe failed', e.message || e); }
}

function guardSubscribeToken(token) {
    const t = Number(token);
    if (guardTokens.has(t)) return;
    guardTokens.add(t);
    try {
        ticker.subscribe([t]);
        ticker.setMode(ticker.modeFull, [t]);
        console.log(`📡 guard subscribed to token ${t}`);
    } catch (e) { console.log('⚠️ guard subscribe failed', e.message || e); }
}

// guardState.json is no longer needed to talk to another process, but it is
// kept as the on-disk record of the frozen levels (handy when debugging, and
// read by anything else that still looks at it).
function writeGuardState() {
    try {
        const levels = {};
        for (const [t, lvl] of breachLevelByToken) {
            levels[t] = { level: lvl, tradingsymbol: breachSymbolByToken.get(t) || '' };
        }
        fs.writeFileSync(GUARD_STATE_FILE, JSON.stringify({ updated: new Date().toISOString(), levels }, null, 2));
    } catch (e) { console.log('⚠️ guardState write failed', e.message || e); }
}

/*
A level dragged on the chart wins over the frozen one. POST /api/breach now
sets it in memory immediately; this re-read only matters after a restart
mid-trade, where the level would otherwise re-freeze and lose the drag.
*/
function applyBreachOverrides() {
    let ov;
    try { ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8')); } catch (e) { return; }
    let changed = false;
    for (const [tok, lvl] of Object.entries(ov)) {
        const token = Number(tok), level = Number(lvl);
        if (!guardPositionByToken.has(token) || !(level > 0)) continue;
        if (breachLevelByToken.get(token) != level) {
            breachLevelByToken.set(token, level);
            console.log(`✏️ Breach level set from chart for ${breachSymbolByToken.get(token) || token}: ${level}`);
            changed = true;
        }
    }
    if (changed) writeGuardState();
}

function saveBreachOverride(token, level) {
    try {
        let ov = {};
        try { ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8')); } catch (e) { }
        ov[Number(token)] = +Number(level).toFixed(2);
        fs.writeFileSync(BREACH_OVERRIDE_FILE, JSON.stringify(ov, null, 2));
    } catch (e) { console.log('⚠️ breachOverride write failed', e.message || e); }
}

// the override must not outlive its trade: a re-entry freezes a fresh level
function clearBreachOverride(token) {
    try {
        if (!fs.existsSync(BREACH_OVERRIDE_FILE)) return;
        const ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8'));
        if (token == null) {
            if (Object.keys(ov).length > 0) fs.writeFileSync(BREACH_OVERRIDE_FILE, '{}');
            return;
        }
        if (ov[token] != null) { delete ov[token]; fs.writeFileSync(BREACH_OVERRIDE_FILE, JSON.stringify(ov, null, 2)); }
    } catch (e) { /* no file yet */ }
}

/* ---------------------------------------------------------------------
POST-TRADE REVIEW + STOP-LOSS LOCKOUT

Every close produces a record rich enough to answer "why did that go
wrong?" without reading the chart again, so the page can throw a full-page
review up the moment a trade ends:

- how the trade was exited (target / SL order / guard breach / manual /
  price trigger),
- how far it ran in your favour before it died (MFE) and how much heat it
  took (MAE) -- tracked tick by tick from the entry fill,
- how long it was held, and how far the guard level sat under entry,
- a verdict naming the part that actually failed (entry, exit, level,
  timing) rather than just the number.

And the rule a quick-entry/quick-exit buyer breaks most: re-entering
straight after being stopped out. Any stop-style exit (SL order triggered
or guard breach) locks NEW entries for LOCKOUT_MIN minutes. Exits are never
blocked -- you can always close what you are holding.
--------------------------------------------------------------------- */

const LOCKOUT_MIN = 10;
const LOCK_FILE = path.join(__dirname, 'tradeLock.json');

// token -> live picture of the open trade, from its BUY fill onward
const tradeCtxByToken = new Map();

// token -> {reason, detail, at}: set by whichever code path is about to
// cause the exit, read when the SELL fill lands
const exitReasonByToken = new Map();
const EXIT_REASON_TTL_MS = 5 * 60 * 1000;

const EXIT_LABELS = {
    target_hit: 'target hit',
    sl_hit: 'SL order triggered',
    guard_breach: 'guard breach (candle low broken)',
    manual_exit: 'manual EXIT button',
    quick_sell: 'quick S50/S100',
    trigger_sell: 'price-trigger SELL',
    unknown: 'closed'
};
// the two that mean "you were stopped out" -> lockout
const STOP_REASONS = ['sl_hit', 'guard_breach'];

let lockUntil = 0, lockWhy = null;

// the review the page re-opens with its "last trade" button
let lastClosedTrade = null;

function lockInfo() {
    const left = Math.max(0, lockUntil - Date.now());
    return {
        locked: left > 0,
        until: lockUntil || null,
        secondsLeft: Math.ceil(left / 1000),
        minutes: LOCKOUT_MIN,
        why: left > 0 ? lockWhy : null
    };
}

function saveLock() {
    try { fs.writeFileSync(LOCK_FILE, JSON.stringify({ until: lockUntil, why: lockWhy }, null, 2)); }
    catch (e) { console.log('⚠️ lock save failed', e.message || e); }
}

// a restart must not hand back the entries the lockout was protecting you from
function loadLock() {
    try {
        const d = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
        if (d.until > Date.now()) {
            lockUntil = d.until; lockWhy = d.why;
            console.log(`🔒 trading still locked for ${lockInfo().secondsLeft}s (${lockWhy})`);
        }
    } catch (e) { /* no lock file */ }
}

function lockTrading(minutes, why) {
    lockUntil = Date.now() + minutes * 60000;
    lockWhy = why;
    saveLock();
    console.log(`🔒 NEW ENTRIES LOCKED for ${minutes} min — ${why}`);
    broadcast({ type: 'lock', lock: lockInfo() });
}

function unlockTrading(by) {
    if (!lockInfo().locked) return false;
    lockUntil = 0; lockWhy = null;
    saveLock();
    console.log(`🔓 lockout cleared early${by ? ' (' + by + ')' : ''}`);
    broadcast({ type: 'lock', lock: lockInfo() });
    return true;
}

function noteExitReason(token, reason, detail) {
    exitReasonByToken.set(Number(token), { reason, detail: detail || null, at: Date.now() });
}

function startTradeCtx(token, { tradingsymbol, entry, qty, entryAt }) {
    tradeCtxByToken.set(Number(token), {
        tradingsymbol, entry: Number(entry), qty: Number(qty) || 0,
        entryAt: entryAt || Date.now(),
        maxLtp: Number(entry), minLtp: Number(entry), ticks: 0
    });
}

// MFE/MAE, tick by tick -- the only honest way to tell a bad entry from a
// bad exit after the fact
function touchTradeCtx(token, ltp) {
    const c = tradeCtxByToken.get(Number(token));
    if (!c || !ltp) return;
    if (ltp > c.maxLtp) c.maxLtp = ltp;
    if (ltp < c.minLtp) c.minLtp = ltp;
    c.ticks++;
}

/*
How did this position actually end? The code path that caused it wins (it
knows); otherwise the filled SELL itself tells us -- an SL order type means
the stop triggered, the target tag on a LIMIT above entry means the target
filled.
*/
function classifyExit(u, ctx) {
    const noted = exitReasonByToken.get(Number(u.instrument_token));
    exitReasonByToken.delete(Number(u.instrument_token));
    if (noted && Date.now() - noted.at < EXIT_REASON_TTL_MS) return noted.reason;
    if (u.order_type == 'SL' || u.order_type == 'SL-M') return 'sl_hit';
    if (u.order_type == 'LIMIT' && u.tag == TARGET_ORDER_TAG && ctx && u.average_price > ctx.entry) return 'target_hit';
    return 'unknown';
}

/*
The verdict. Deliberately opinionated and scalper-specific: for a
quick-in/quick-out buyer there are only a few ways a trade dies, and which
one it was is decided by MFE (did it ever work?), hold time (did you give
it a chance / did you sit in chop?) and the gap to the stop level (was the
risk even sane?).
*/
function diagnoseTrade({ reason, entry, exit, mfePct, maePct, exitPct, heldMin, levelGapPct, qty, pnl }) {

    const pts = [];
    const n = v => (v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(1) + '%');

    // the facts first -- same four numbers every time, so they become readable at a glance
    pts.push(`ran ${n(mfePct)} in your favour at best (MFE), ${n(maePct)} against at worst (MAE)`);
    pts.push(`held ${heldMin < 1 ? Math.round(heldMin * 60) + 's' : heldMin.toFixed(1) + ' min'}, exited ${n(exitPct)} from entry ${entry} → ${exit}`);
    if (levelGapPct != null) pts.push(`guard level sat ${levelGapPct.toFixed(1)}% under entry`);

    let verdict, tag;

    if (exitPct >= 0) {
        tag = 'win';
        verdict = reason == 'target_hit'
            ? `Worked as planned — target filled ${n(exitPct)} in ${heldMin.toFixed(1)} min.`
            : `Closed green ${n(exitPct)}.`;
        if (maePct < -10) pts.push(`⚠ it was ${n(maePct)} underwater first — you got paid for sitting through real heat, which is not repeatable. Size for that next time.`);
        if (mfePct - exitPct > 10) pts.push(`⚠ left ${(mfePct - exitPct).toFixed(1)}% on the table (best was ${n(mfePct)}) — a 50% scale-out at the spike would have banked it.`);
        if (reason == 'guard_breach') pts.push(`exit was the guard, not your target — the move stalled and broke the candle low while still green.`);
        return { verdict, points: pts, tag };
    }

    // ---- losses: name the part that actually failed ----
    if (mfePct < 2) {
        tag = 'entry';
        verdict = `ENTRY was the mistake — it never went ${mfePct < 0 ? 'green at all' : '2% in your favour'} (best ${n(mfePct)}).`;
        pts.push(`no follow-through from the first tick: you bought into chop, or after the move was already spent.`);
        pts.push(`fix: enter on a level breaking with momentum, not on a feeling that it "should" go.`);
    } else if (mfePct >= 15) {
        tag = 'exit';
        verdict = `EXIT was the mistake — you were ${n(mfePct)} up and gave it all back (${n(exitPct)}).`;
        pts.push(`a 50% scale-out at ${n(mfePct / 2)} would have turned this into a flat-to-green trade.`);
        pts.push(`fix: once a scalp is +10%, book half or trail the stop to entry. Never let a winner become a loser.`);
    } else if (reason == 'guard_breach' && levelGapPct != null && levelGapPct < 1) {
        tag = 'level';
        verdict = `LEVEL was too tight — the guard sat only ${levelGapPct.toFixed(1)}% under entry, which is inside one candle of noise.`;
        pts.push(`you entered right on top of the 3-candle low: a late entry into support stops out on a normal wick.`);
        pts.push(`fix: enter when the level is 2–4% below, or wait for the retest to hold.`);
    } else if (reason == 'guard_breach' && levelGapPct != null && levelGapPct > 8) {
        tag = 'risk';
        verdict = `RISK was wrong — the stop level was ${levelGapPct.toFixed(1)}% away, so one breach cost ${n(exitPct)}.`;
        pts.push(`the level was fine, the size was not: ${qty} qty against that distance is a big single loss.`);
        pts.push(`fix: size from the stop distance (risk per trade ÷ entry-to-level), not from % of margin.`);
    } else if (heldMin < 2) {
        tag = 'timing';
        verdict = `TOO EARLY — stopped out in ${heldMin < 1 ? Math.round(heldMin * 60) + 's' : heldMin.toFixed(1) + ' min'}.`;
        pts.push(`you clicked inside a forming candle and the candle went the other way.`);
        pts.push(`fix: let the 1-min candle close above/below the level before entering.`);
    } else if (heldMin > 15 && Math.abs(exitPct) < 4) {
        tag = 'theta';
        verdict = `DEAD TRADE — ${heldMin.toFixed(0)} min sideways, closed ${n(exitPct)}.`;
        pts.push(`a scalp that goes nowhere is already a loss: theta charges rent every minute you hold a long option.`);
        pts.push(`fix: time-stop it. No movement in 5–10 min → out, take the small loss.`);
    } else {
        tag = 'normal';
        verdict = `Normal stop — the setup simply failed (${n(exitPct)}).`;
        pts.push(`it worked ${n(mfePct)} then rolled over: nothing obviously broken in entry or exit.`);
        pts.push(`this is the cost of doing business — only the size of it is yours to control.`);
    }

    if (STOP_REASONS.includes(reason)) {
        pts.push(`🔒 stop-style exit → new entries locked for ${LOCKOUT_MIN} min. The next click after a stop-out is the one that usually doubles the damage.`);
    }

    return { verdict, points: pts, tag };
}

/* ---------------------------------------------------------------------
NO-TRADE GATE

The checklist a quick-in/quick-out buyer breaks when the screen is moving
and judgement is not. It is not advice printed on the page -- every HARD
rule here refuses the order server-side (HTTP 423), so B50/B100, a chart
BUY and even an already-parked BUY trigger all go through it. Exits are
never gated: you can always close what you hold.

Thresholds live in noTrade.json so they can be tuned without a restart
(re-read on every check).

HARD (order refused):
  clock      -- the first minutes after open, the lunch chop, and the
                late-session window where a long option is all theta
  lockout    -- the 10-min stop-out cooldown (see the review section)
  day loss   -- the day's realised loss has hit its cap
  streak     -- N losses in a row: the problem is you, not the setup
  trade cap  -- N closed trades today is enough clicking
  premium    -- too cheap (all gamma, no liquidity) or too rich (one tick
                of slippage eats the scalp)
  stacking   -- already holding the max number of open longs, or already
                holding THIS symbol (averaging into a loser)

SOFT (shown on the page, does not refuse): a dead chart -- the browser
owns the candles, so the speed check lives there and greys the buttons.
--------------------------------------------------------------------- */


/* ---------------------------------------------------------------------
REGIME GATE -- the choppy-day blocker.

28/10/2026 is the day this exists for. SENSEX travelled 922 points and
closed 7 points from its open; spot walked 7,846 points of path to go
nowhere, and the ATM straddle went 910 -> 621, down 32%. As a buyer you
paid decay all day for swings that never paid. The worst cluster in the
replay was six consecutive PE buys between 11:20 and 12:41 for -Rs 5,904
-- every one of them placed inside a +604 point index RALLY, because the
support-bounce signal has no idea which way the index is going.

Two numbers, both off the index's own 1-min closes:

  efficiency = |last - first| / sum(|close_i - close_i-1|)   over regimeWin
      How much of the distance walked became progress. On 28/10 the
      09:30-10:45 chop measured 3% and the dead 13:10-15:30 afternoon 5%,
      while the one tradeable leg (10:45-13:10) measured 23%. Under
      minEff -> CHOP, refuse the entry.

  bias = which side of the emaMin EMA price sits on, AND the EMA moving
      that way. A CE is a long bet on the index and a PE a short one, so
      a CE needs bias up and a PE needs bias down. 'flat' blocks both --
      no side, no trade. This is the rule that refuses those six PE buys.

The series is kept from live ticks (one sample a minute) and seeded once
from history so a restart mid-session is not blind for half an hour. Both
rules are hard blocks in noTradeChecks and both are switchable from
noTrade.json. The numbers broadcast every 30s so the chart can show chop
BUILDING, instead of only refusing the click after the fact.
--------------------------------------------------------------------- */

const INDEX_SPOT_TOKENS = new Set(Object.values(INDICES).map(i => Number(i.spotToken)));
const spotSeries = new Map();     // index spot token -> [{ min, px }]
const SPOT_SERIES_MAX = 400;      // a full session of minutes, plus slack
const spotSeeded = new Set();

/*
One sample a minute off the tick stream. A gap of over an hour means a new
session (or a long restart), so the stale series is dropped rather than
averaged across the boundary.
*/
function pushSpotSample(token, px) {
    if (!INDEX_SPOT_TOKENS.has(Number(token)) || !(px > 0)) return;
    const min = Math.floor(Date.now() / 60000);
    let a = spotSeries.get(token);
    if (!a) { a = []; spotSeries.set(token, a); }
    if (a.length && min - a[a.length - 1].min > 60) a.length = 0;
    const last = a[a.length - 1];
    if (last && last.min == min) { last.px = px; return; }
    a.push({ min, px });
    if (a.length > SPOT_SERIES_MAX) a.shift();
}

/*
Backfill today's minutes once per token, so the gate is live immediately
after a restart instead of waiting regimeWin minutes. History bars are
merged UNDER whatever ticks already arrived -- live samples win.
*/
async function seedSpotSeries(token) {
    if (spotSeeded.has(token)) return;
    spotSeeded.add(token);
    try {
        const from = dayjs().hour(9).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
        const to = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const bars = await kiteRetry(() => kite.getHistoricalData(token, 'minute', from, to));
        const live = spotSeries.get(token) || [];
        const byMin = new Map();
        for (const b of bars) byMin.set(Math.floor(new Date(b.date).getTime() / 60000), b.close);
        for (const s of live) byMin.set(s.min, s.px);   // a live sample beats the bar
        const merged = [...byMin.entries()].sort((a, b) => a[0] - b[0])
            .map(([min, px]) => ({ min, px })).slice(-SPOT_SERIES_MAX);
        spotSeries.set(token, merged);
        console.log(`📐 regime seeded: ${merged.length} index minutes for token ${token}`);
    } catch (e) {
        spotSeeded.delete(token);   // let the next tick try again
        console.log('⚠️ regime seed failed', e.message || e);
    }
}

// the index the chart is on; falls back to any index we have samples for
const REGIME_IDX_FILE = path.join(__dirname, 'regimeIndex.json');
let regimeToken = (() => {
    try { return Number(JSON.parse(fs.readFileSync(REGIME_IDX_FILE, 'utf8')).token) || null; }
    catch { return null; }
})();

function setRegimeToken(tok) {
    regimeToken = Number(tok) || null;
    if (!regimeToken) return;
    try { fs.writeFileSync(REGIME_IDX_FILE, JSON.stringify({ token: regimeToken })); }
    catch (e) { console.log('⚠️ regimeIndex write failed', e.message); }
}

function activeSpotToken() {
    if (regimeToken && INDEX_SPOT_TOKENS.has(Number(regimeToken))) return Number(regimeToken);
    const c = chartedTokens.map(Number).find(t => INDEX_SPOT_TOKENS.has(t));
    if (c) return c;
    for (const t of spotSeries.keys()) if (INDEX_SPOT_TOKENS.has(Number(t))) return Number(t);
    return null;
}

function computeRegime(token) {
    const s = readNoTrade();
    const a = spotSeries.get(token) || [];
    const win = Math.max(5, Math.round(s.regimeWin));
    if (a.length < win + 1) {
        return { ok: false, token, bars: a.length,
            why: `only ${a.length} min of index data, need ${win + 1}` };
    }
    const seg = a.slice(-(win + 1));
    const net = seg[seg.length - 1].px - seg[0].px;
    let path = 0;
    for (let i = 1; i < seg.length; i++) path += Math.abs(seg[i].px - seg[i - 1].px);
    const eff = path > 0 ? +(Math.abs(net) / path * 100).toFixed(1) : 0;

    const n = Math.max(5, Math.round(s.emaMin));
    const k = 2 / (n + 1);
    const e = [];
    let ema = a[0].px;
    for (const q of a) { ema = q.px * k + ema * (1 - k); e.push(ema); }
    const emaNow = e[e.length - 1];
    const slope = emaNow - e[Math.max(0, e.length - 6)];   // 5-minute EMA slope
    const px = a[a.length - 1].px;
    const bias = (px > emaNow && slope > 0) ? 'up'
        : ((px < emaNow && slope < 0) ? 'down' : 'flat');

    return {
        ok: true, token, bars: a.length, win, eff, minEff: s.minEff,
        chop: eff < s.minEff, bias,
        px: +px.toFixed(2), ema: +emaNow.toFixed(2), slope: +slope.toFixed(2),
        net: +net.toFixed(1), path: +path.toFixed(1)
    };
}

function spotRegime() {
    const t = activeSpotToken();
    if (!t) return { ok: false, why: 'no index subscribed — press Load on the chart' };
    return computeRegime(t);
}

// 'ce' | 'pe' | null, straight off the tradingsymbol's tail
function legOfSymbol(sym) {
    const m = /(CE|PE)$/.exec(String(sym || '').trim().toUpperCase());
    return m ? m[1].toLowerCase() : null;
}

const NO_TRADE_FILE = path.join(__dirname, 'noTrade.json');

const NO_TRADE_DEFAULTS = {
    noEntryBefore: '09:20',   // let the open settle; the first prints are noise
    lunchFrom: '12:00',       // the dead zone: wide spreads, no follow-through
    lunchTo: '13:15',
    noEntryAfter: '15:10',    // nothing new this late -- only theta and squaring off
    blockLunch: true,
    maxDayLoss: 3000,         // INR realised, today
    maxLossStreak: 3,         // consecutive losing trades today
    maxTradesPerDay: 8,       // closed trades today
    minPremium: 8,            // INR per unit
    maxPremium: 400,
    maxOpenPositions: 1,      // how many option longs at once
    oneEntryPerSymbol: true,  // no averaging into an open position
    minSpeed: 0.6,            // page-side only: chart dead-ness cutoff

    /* regime gate -- see the REGIME block above */
    blockChop: true,          // refuse entries while the index is chopping
    regimeWin: 30,            // minutes in the efficiency window
    minEff: 10,               // % efficiency below which it counts as chop
    blockWrongWay: true,      // a CE needs the index biased up, a PE down
    emaMin: 20                // minutes in the direction EMA
};

function readNoTrade() {
    try { return { ...NO_TRADE_DEFAULTS, ...JSON.parse(fs.readFileSync(NO_TRADE_FILE, 'utf8')) }; }
    catch (e) { return { ...NO_TRADE_DEFAULTS }; }
}

function writeNoTrade(s) {
    fs.writeFileSync(NO_TRADE_FILE, JSON.stringify(s, null, 2));
}

// "09:20" -> minutes since midnight, so the windows compare as plain numbers
function hhmmToMin(s) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
    return m ? (+m[1]) * 60 + (+m[2]) : null;
}

/*
Today's realised record, straight off tradeLog.json: how much is gone, how
many clicks, and the current losing streak (counted from the newest trade
backwards -- one green trade resets it, which is the point).
*/
function todayStats() {
    let log = [];
    try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
    const today = dayjs().format('YYYY-MM-DD');
    const rows = log.filter(t => t.date == today);
    let streak = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
        if ((rows[i].pnl || 0) < 0) streak++; else break;
    }
    return {
        trades: rows.length,
        pnl: +rows.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2),
        lossStreak: streak,
        wins: rows.filter(t => (t.pnl || 0) > 0).length,
        losses: rows.filter(t => (t.pnl || 0) < 0).length
    };
}

/*
Every check, every time -- returned as a list so the page can render the
whole checklist (passing rules included) instead of only the first failure.
`premium` and `tradingsymbol` are optional: without them the premium and
same-symbol rules are reported as "n/a", which is what the page wants on
load, before you have picked anything.
*/
function noTradeChecks({ premium, tradingsymbol } = {}) {
    const s = readNoTrade();
    const st = todayStats();
    const l = lockInfo();
    const now = dayjs();
    const mins = now.hour() * 60 + now.minute();
    const open = [...guardPositionByToken.keys()];
    const holdingThis = tradingsymbol
        ? open.some(t => breachSymbolByToken.get(t) == tradingsymbol)
        : false;

    const chk = [];
    const add = (code, label, failed, detail, hard = true) =>
        chk.push({ code, label, ok: !failed, blocked: !!failed && hard, hard, detail });

    const before = hhmmToMin(s.noEntryBefore), after = hhmmToMin(s.noEntryAfter);
    const lFrom = hhmmToMin(s.lunchFrom), lTo = hhmmToMin(s.lunchTo);

    add('open', `No entry before ${s.noEntryBefore}`,
        before != null && mins < before,
        `now ${now.format('HH:mm')} — the first minutes are a spread-widening coin flip`);

    add('lunch', `No entry ${s.lunchFrom}–${s.lunchTo} (chop)`,
        s.blockLunch && lFrom != null && lTo != null && mins >= lFrom && mins < lTo,
        `now ${now.format('HH:mm')} — no follow-through, theta still charging`);

    add('late', `No entry after ${s.noEntryAfter}`,
        after != null && mins >= after,
        `now ${now.format('HH:mm')} — too late for a new long option`);

    add('lock', `No entry for ${LOCKOUT_MIN} min after a stop-out`,
        l.locked,
        l.locked ? `${l.secondsLeft}s left — ${l.why}` : 'no recent stop-out');

    add('dayloss', `Day loss under ₹${s.maxDayLoss}`,
        st.pnl <= -Math.abs(s.maxDayLoss),
        `today ${st.pnl >= 0 ? '+' : ''}${st.pnl}`);

    add('streak', `Fewer than ${s.maxLossStreak} losses in a row`,
        st.lossStreak >= s.maxLossStreak,
        `current streak ${st.lossStreak}`);

    add('cap', `Max ${s.maxTradesPerDay} trades a day`,
        st.trades >= s.maxTradesPerDay,
        `${st.trades} closed today`);

    /*
    Regime. Reported even when switched off (as a passing soft row) so the
    checklist on the page never silently loses a line.
    */
    const reg = spotRegime();
    const leg = tradingsymbol ? legOfSymbol(tradingsymbol) : null;
    const na = (code, label, detail) =>
        chk.push({ code, label, ok: true, blocked: false, hard: true, detail });

    if (!s.blockChop) {
        chk.push({ code: 'chop', label: 'Index not chopping', ok: true, blocked: false, hard: false, detail: 'chop filter switched off' });
    } else if (!reg.ok) {
        na('chop', `Index not chopping (${s.regimeWin}-min efficiency ≥ ${s.minEff}%)`, `n/a — ${reg.why}`);
    } else {
        add('chop', `Index not chopping (${s.regimeWin}-min efficiency ≥ ${s.minEff}%)`,
            reg.chop,
            `efficiency ${reg.eff}% — ${reg.net >= 0 ? '+' : ''}${reg.net} pts of progress for ${reg.path} pts walked` +
            (reg.chop ? ' — this is the day that bleeds you: swings that pay nothing while theta runs' : ''));
    }

    if (!s.blockWrongWay) {
        chk.push({ code: 'wrongway', label: 'Trading with the index', ok: true, blocked: false, hard: false, detail: 'direction filter switched off' });
    } else if (!leg) {
        na('wrongway', 'Trading with the index', 'n/a until a CE or PE is picked');
    } else if (!reg.ok) {
        na('wrongway', 'Trading with the index', `n/a — ${reg.why}`);
    } else {
        const want = leg == 'ce' ? 'up' : 'down';
        add('wrongway', `${leg.toUpperCase()} needs the index biased ${want}`,
            reg.bias != want,
            `index ${reg.px} vs ${s.emaMin}-min EMA ${reg.ema} (slope ${reg.slope >= 0 ? '+' : ''}${reg.slope}) — bias ${reg.bias}` +
            (reg.bias != want ? ` — a ${leg.toUpperCase()} here bets against the index` : ''));
    }

    const bare = unprotectedList();
    add('guarded', 'Every open position has a resting SELL',
        bare.length > 0,
        bare.length
            ? `${bare.map(b => b.tradingsymbol).join(', ')} has no resting SELL (${bare[0].why}) — fix that before entering anything else`
            : 'all protected');

    add('open_count', `Max ${s.maxOpenPositions} position${s.maxOpenPositions == 1 ? '' : 's'} at a time`,
        open.length >= s.maxOpenPositions,
        `${open.length} open`);

    if (tradingsymbol) {
        add('same_symbol', 'Not already holding this symbol',
            s.oneEntryPerSymbol && holdingThis,
            holdingThis ? `already long ${tradingsymbol} — that is averaging, not a scalp` : 'not held');
    } else {
        chk.push({ code: 'same_symbol', label: 'Not already holding this symbol', ok: true, blocked: false, hard: true, detail: 'n/a until a symbol is picked' });
    }

    if (premium > 0) {
        add('premium', `Premium ₹${s.minPremium}–${s.maxPremium}`,
            premium < s.minPremium || premium > s.maxPremium,
            `₹${premium} — ${premium < s.minPremium ? 'too cheap: one tick is a huge % and the book is thin' : 'too rich: slippage eats the scalp'}`);
    } else {
        chk.push({ code: 'premium', label: `Premium ₹${s.minPremium}–${s.maxPremium}`, ok: true, blocked: false, hard: true, detail: 'n/a until a price is picked' });
    }

    const blockers = chk.filter(c => c.blocked);
    return { checks: chk, blockers, blocked: blockers.length > 0, settings: s, stats: st, lock: l, openPositions: open.length, regime: reg };
}

/*
The one call every entry path makes. Returns true (and has already
answered 423) when the order must not be sent.
*/
function entryBlocked(res, opts) {
    const g = noTradeChecks(opts || {});
    if (!g.blocked) return false;
    const why = g.blockers.map(b => `${b.label} — ${b.detail}`).join(' | ');
    console.log(`⛔ entry refused: ${why}`);
    res.status(423).json({
        error: `⛔ NO TRADE: ${g.blockers.map(b => b.label).join(' | ')}`,
        blockers: g.blockers, lock: g.lock
    });
    return true;
}

/* ---------------------------------------------------------------------
TRADE ANALYSIS, DATE WISE

The per-trade review answers "why did THAT one go wrong?". This answers
the harder one: "what do I keep doing wrong?" -- one abstract per trading
day, built from tradeLog.json alone, so it also works for the days logged
before the review existed (those rows have no MFE/verdict; the day-level
patterns -- count, payoff, churn, re-entry speed, hour of day -- need none
of it).

Nothing here places or blocks an order. It is the paperwork that tells you
which no-trade rule you should be tightening.
--------------------------------------------------------------------- */

// "HH:mm:ss" -> minutes since midnight (log rows store local time strings)
function timeToMin(t) {
    const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''));
    return m ? (+m[1]) * 60 + (+m[2]) : null;
}

const TAG_LESSON = {
    entry: 'bought into chop or into a move already spent — the trade never went green',
    exit: 'sat through the whole round trip — up double digits, closed red',
    level: 'entered right on top of the stop level, so normal noise took you out',
    risk: 'stop too far for the size — one breach made a big hole',
    timing: 'clicked inside a forming candle and the candle went the other way',
    theta: 'held a long option sideways and paid rent for it',
    normal: 'setup simply failed — unavoidable cost, size is the only lever',
    win: 'worked',
    partial: 'no tick history (app restarted mid-trade)'
};

/*
One day, chewed into the numbers that actually drive the P&L, plus an
abstract that says the thing out loud.
*/
function analyseDay(date, rows) {
    const n = rows.length;
    const pnl = +rows.reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2);
    const wins = rows.filter(t => (t.pnl || 0) > 0);
    const losses = rows.filter(t => (t.pnl || 0) < 0);
    const avgWin = wins.length ? +(wins.reduce((s, t) => s + t.pnl, 0) / wins.length).toFixed(2) : 0;
    const avgLoss = losses.length ? +(losses.reduce((s, t) => s + t.pnl, 0) / losses.length).toFixed(2) : 0;
    const best = rows.reduce((a, t) => (a == null || (t.pnl || 0) > (a.pnl || 0)) ? t : a, null);
    const worst = rows.reduce((a, t) => (a == null || (t.pnl || 0) < (a.pnl || 0)) ? t : a, null);

    const held = rows.map(t => t.heldMin).filter(v => v != null);
    const avgHoldMin = held.length ? +(held.reduce((s, v) => s + v, 0) / held.length).toFixed(1) : null;

    const tags = {}, reasons = {}, bySymbol = {}, byHour = {};
    for (const t of rows) {
        if (t.tag) tags[t.tag] = (tags[t.tag] || 0) + 1;
        const r = t.reasonLabel || t.reason || 'unrecorded';
        reasons[r] = (reasons[r] || 0) + 1;
        if (!bySymbol[t.tradingsymbol]) bySymbol[t.tradingsymbol] = { trades: 0, pnl: 0 };
        bySymbol[t.tradingsymbol].trades++;
        bySymbol[t.tradingsymbol].pnl = +(bySymbol[t.tradingsymbol].pnl + (t.pnl || 0)).toFixed(2);
        const mn = timeToMin(t.time);
        if (mn != null) {
            const h = String(Math.floor(mn / 60)).padStart(2, '0');
            if (!byHour[h]) byHour[h] = { trades: 0, pnl: 0 };
            byHour[h].trades++;
            byHour[h].pnl = +(byHour[h].pnl + (t.pnl || 0)).toFixed(2);
        }
    }

    // worst losing streak of the day, and how fast you went back in after a loss
    let streak = 0, maxStreak = 0, revenge = 0;
    for (let i = 0; i < n; i++) {
        if ((rows[i].pnl || 0) < 0) {
            streak++; maxStreak = Math.max(maxStreak, streak);
            const a = timeToMin(rows[i].time), b = i + 1 < n ? timeToMin(rows[i + 1].time) : null;
            // log rows carry close times only, so this is "in and out again
            // within 2 min of a loss" -- the tilt signature, close to close
            if (a != null && b != null && b - a <= 2) revenge++;
        } else streak = 0;
    }

    // what the day would have been if it had stopped at the trade cap...
    const nt = readNoTrade();
    const cap = nt.maxTradesPerDay;
    const firstN = +rows.slice(0, cap).reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2);
    const afterN = +(pnl - firstN).toFixed(2);

    // ...and at the day-loss limit, which is usually the rule that bites first
    let run = 0, breachAt = -1;
    for (let i = 0; i < n; i++) {
        run += rows[i].pnl || 0;
        if (breachAt < 0 && run <= -Math.abs(nt.maxDayLoss)) breachAt = i;
    }
    const afterBreach = breachAt < 0 ? 0
        : +rows.slice(breachAt + 1).reduce((s, t) => s + (t.pnl || 0), 0).toFixed(2);
    const tradesAfterBreach = breachAt < 0 ? 0 : n - breachAt - 1;

    const topTag = Object.entries(tags).filter(([k]) => k != 'win')
        .sort((a, b) => b[1] - a[1])[0] || null;
    const churn = Object.entries(bySymbol).filter(([, v]) => v.trades >= 4)
        .sort((a, b) => a[1].pnl - b[1].pnl);
    const worstHour = Object.entries(byHour).sort((a, b) => a[1].pnl - b[1].pnl)[0] || null;

    // ---------------- the abstract ----------------
    const money = v => (v >= 0 ? '+₹' : '-₹') + Math.abs(v).toFixed(0);
    const parts = [], lessons = [];

    parts.push(`${n} trade${n == 1 ? '' : 's'}, ${wins.length}W/${losses.length}L, net ${money(pnl)}.`);
    if (wins.length && losses.length) {
        parts.push(`Average win ${money(avgWin)} against average loss ${money(avgLoss)}` +
            (Math.abs(avgLoss) > avgWin
                ? ` — the payoff is upside down, so even a ${Math.round(wins.length / n * 100)}% hit rate loses money.`
                : `, which is the right way round.`));
    }

    // the day-loss limit first: on a bad day it is almost always the rule
    // that would have cost the least to obey
    if (breachAt >= 0 && tradesAfterBreach > 0) {
        parts.push(`Crossed -₹${Math.abs(nt.maxDayLoss)} on trade ${breachAt + 1} of ${n}.`);
        lessons.push(afterBreach < 0
            ? `THE DAY-LOSS LIMIT is the rule that would have saved the most: the day was already past -₹${Math.abs(nt.maxDayLoss)} at trade ${breachAt + 1}, and the ${tradesAfterBreach} trades taken after that added ${money(afterBreach)}.`
            : `Past -₹${Math.abs(nt.maxDayLoss)} at trade ${breachAt + 1}; the ${tradesAfterBreach} trades after it clawed back ${money(afterBreach)} — it ended well, but that is the recovery that teaches the wrong lesson.`);
    }

    if (n > cap) {
        parts.push(`First ${cap} trades: ${money(firstN)}. Everything after: ${money(afterN)}.`);
        // only credit the trade cap when the damage actually came after it
        if (afterN < 0 && firstN >= 0)
            lessons.push(`OVERTRADING is the headline: ${money(firstN)} after ${cap} trades, then ${money(afterN)} over the next ${n - cap}. The trade cap alone would have saved the day.`);
        else if (afterN < 0 && Math.abs(afterN) > Math.abs(firstN))
            lessons.push(`${n} trades, and the bleed is in the tail: ${money(firstN)} over the first ${cap}, ${money(afterN)} over the next ${n - cap}. The trade cap takes out the worse half.`);
        else if (afterN < 0)
            lessons.push(`${n} trades is past the ${cap} cap, but the damage was front-loaded (${money(firstN)} in the first ${cap}, ${money(afterN)} after) — the trade cap is not what was needed here; size and the day-loss limit are.`);
        else
            lessons.push(`${n} trades is past the ${cap} cap and it worked out this time (${money(afterN)} after the cap) — which is exactly how the habit survives.`);
    }

    if (topTag) lessons.push(`Most common failure: ${topTag[0].toUpperCase()} (${topTag[1]}×) — ${TAG_LESSON[topTag[0]] || ''}.`);

    // a breach exit that filled well under the frozen level means the guard
    // had no resting order to modify (rejected target / app down), not that
    // the level was wrong -- worth separating from a sizing mistake
    const slipped = rows.filter(t => t.level != null && t.sell != null && t.sell < t.level * 0.95);
    if (slipped.length) {
        const w = slipped.reduce((a, t) => (a == null || t.pnl < a.pnl) ? t : a, null);
        lessons.push(`${slipped.length} exit${slipped.length == 1 ? '' : 's'} filled more than 5% BELOW the level the guard was watching (worst: ${w.tradingsymbol} ${w.time}, level ${w.level} → sold ${w.sell}). That is a guard failure, not a bad level — check the log for a rejected resting SELL.`);
    }

    if (maxStreak >= 3) lessons.push(`${maxStreak} losses in a row at one point — that is the stretch where a 10-minute lockout pays for itself.`);
    if (revenge >= 2) lessons.push(`${revenge} times you were in and out again within 2 minutes of a loss — re-entry on tilt, not on a setup.`);
    if (churn.length) {
        const [sym, v] = churn[0];
        lessons.push(`Churned ${sym} ${v.trades}× for ${money(v.pnl)} — repeating the same strike is averaging a view, not scalping.`);
    }
    if (worstHour && worstHour[1].pnl < 0 && worstHour[1].trades >= 3) {
        lessons.push(`Worst hour ${worstHour[0]}:00 — ${worstHour[1].trades} trades for ${money(worstHour[1].pnl)}. Consider making it a no-entry window.`);
    }
    if (avgHoldMin != null && avgHoldMin > 15 && pnl < 0) {
        lessons.push(`Average hold ${avgHoldMin} min on a scalping plan — long options bleed while you wait to be proved right.`);
    }
    if (worst && losses.length && Math.abs(worst.pnl) > Math.abs(pnl) * 0.5 && pnl < 0) {
        // don't blame size when the row cannot tell us whether a stop was
        // even resting -- an unprotected position looks exactly like oversizing
        const bare = worst.level == null;
        lessons.push(`One trade (${worst.tradingsymbol} ${worst.time}, ${money(worst.pnl)}${worst.exitPct != null ? ', ' + worst.exitPct + '%' : ''}) is over half the day's damage. `
            + (bare
                ? `This row has no guard data, so check the log for a rejected resting SELL before blaming size — a position with no exchange-side exit looks identical to oversizing.`
                : `The stop was resting and the level held, so this one is sizing.`));
    }
    if (!lessons.length) lessons.push(pnl >= 0 ? `Clean day — nothing in the numbers to fix.` : `Small, ordinary loss with no pattern in it.`);
    if (!rows.some(t => t.tag)) lessons.push(`(These rows predate the per-trade diagnosis, so only day-level patterns are available — no MFE/MAE, hold time or verdict.)`);

    return {
        date, trades: n, wins: wins.length, losses: losses.length, pnl,
        avgWin, avgLoss, avgHoldMin, maxLossStreak: maxStreak, revengeEntries: revenge,
        stopOuts: rows.filter(t => STOP_REASONS.includes(t.reason)).length,
        firstNPnl: firstN, afterNPnl: afterN, cap,
        dayLossLimit: Math.abs(nt.maxDayLoss),
        breachAtTrade: breachAt < 0 ? null : breachAt + 1, tradesAfterBreach, afterBreachPnl: afterBreach,
        best: best ? { tradingsymbol: best.tradingsymbol, time: best.time, pnl: best.pnl } : null,
        worst: worst ? { tradingsymbol: worst.tradingsymbol, time: worst.time, pnl: worst.pnl } : null,
        tags, reasons, bySymbol, byHour,
        abstract: parts.join(' '),
        lessons,
        rows
    };
}

/*
Date-wise analysis, newest day first, plus the across-days view: which
mistake repeats, and what the record looks like day by day.
*/
function analyseAll() {
    let log = [];
    try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
    const byDate = {};
    for (const t of log) (byDate[t.date] = byDate[t.date] || []).push(t);

    const days = Object.keys(byDate).sort().reverse().map(d => analyseDay(d, byDate[d]));

    const tagTotals = {};
    for (const d of days) for (const [k, v] of Object.entries(d.tags)) tagTotals[k] = (tagTotals[k] || 0) + v;
    const repeat = Object.entries(tagTotals).filter(([k]) => k != 'win').sort((a, b) => b[1] - a[1])[0] || null;
    const green = days.filter(d => d.pnl > 0), red = days.filter(d => d.pnl < 0);
    const total = +days.reduce((s, d) => s + d.pnl, 0).toFixed(2);
    const trades = days.reduce((s, d) => s + d.trades, 0);
    const money = v => (v >= 0 ? '+₹' : '-₹') + Math.abs(v).toFixed(0);

    const overall = {
        days: days.length, trades, pnl: total,
        greenDays: green.length, redDays: red.length,
        bestDay: days.reduce((a, d) => (a == null || d.pnl > a.pnl) ? d : a, null),
        worstDay: days.reduce((a, d) => (a == null || d.pnl < a.pnl) ? d : a, null),
        tagTotals,
        abstract: days.length
            ? `${days.length} trading day${days.length == 1 ? '' : 's'}, ${trades} trades, net ${money(total)} (${green.length} green / ${red.length} red).`
            + (repeat ? ` The mistake that repeats most is ${repeat[0].toUpperCase()} (${repeat[1]}×): ${TAG_LESSON[repeat[0]] || ''}.` : '')
            + (days.some(d => d.trades > d.cap) ? ` Trade count went past the daily cap on ${days.filter(d => d.trades > d.cap).length} of those days.` : '')
            : 'No closed trades logged yet.'
    };

    return { days, overall };
}

/*
One record per closed trade (read back by /api/pnl and thrown up as the
full-page review). Entry comes from the BUY fill we tracked (never Kite's
blended average_price); qty = the day's sold qty not yet logged, so chunked
exits and re-entries in the same symbol each log once, correctly. On top of
the money it stores how the trade behaved while it was open -- MFE/MAE, hold
time, the stop distance -- and the verdict built from them.
*/
function logClosedTrade({ tradingsymbol, position, sellPrice, fallbackQty, token, reason, level, ctx }) {
    try {
        let log = [];
        try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
        const today = dayjs().format('YYYY-MM-DD');
        const already = log.filter(t => t.date == today && t.tradingsymbol == tradingsymbol)
            .reduce((s, t) => s + (t.quantity || 0), 0);
        const qty = Math.max(0, (position ? position.day_sell_quantity : 0) - already) || Number(fallbackQty) || 0;
        const buy = (ctx && ctx.entry) || actualBuyPriceByToken.get(token);
        const pnl = (buy != null && sellPrice > 0 && qty > 0)
            ? +((sellPrice - buy) * qty).toFixed(2)
            : (position ? position.pnl : null); // entry unknown (restart): symbol's day total is the best we have

        const pct = (a, b) => (a != null && b) ? +(((a - b) / b) * 100).toFixed(2) : null;
        const mfePct = ctx ? pct(ctx.maxLtp, buy) : null;
        const maePct = ctx ? pct(ctx.minLtp, buy) : null;
        const exitPct = pct(sellPrice, buy);
        const heldMin = ctx ? +((Date.now() - ctx.entryAt) / 60000).toFixed(2) : null;
        const levelGapPct = (level != null && buy) ? +(((buy - level) / buy) * 100).toFixed(2) : null;
        const why = (ctx && buy && sellPrice)
            ? diagnoseTrade({ reason, entry: buy, exit: sellPrice, mfePct, maePct, exitPct, heldMin, levelGapPct, qty, pnl })
            : {
                verdict: `Closed ${exitPct != null ? (exitPct >= 0 ? '+' : '') + exitPct + '%' : ''} — no tick history for this entry (the app restarted while it was open), so entry-vs-exit cannot be judged.`,
                points: ['fix: nothing to learn from this one; the review needs the position to have been open while the app was running.'],
                tag: 'partial'
            };

        const rec = {
            date: today, time: dayjs().format('HH:mm:ss'), tradingsymbol,
            quantity: qty, buy: buy != null ? +Number(buy).toFixed(2) : null,
            sell: sellPrice ? +Number(sellPrice).toFixed(2) : null,
            pnl, symbolDayPnl: position ? position.pnl : null,
            reason: reason || 'unknown', reasonLabel: EXIT_LABELS[reason] || EXIT_LABELS.unknown,
            mfePct, maePct, exitPct, heldMin, level: level != null ? level : null, levelGapPct,
            verdict: why.verdict, points: why.points, tag: why.tag
        };
        log.push(rec);
        fs.writeFileSync(TRADE_LOG_FILE, JSON.stringify(log, null, 2));
        console.log(`🧾 Trade logged: ${tradingsymbol} qty ${qty} buy ${buy} sell ${sellPrice} pnl ${pnl} [${rec.reasonLabel}]`);
        console.log(`   ↳ ${rec.verdict}`);
        return rec;
    } catch (err) { console.log(err, '⚠️ trade log failed'); return null; }
}

/*
Places THE resting SELL on a fill: a LIMIT target or an SL, per
guardSettings.json (or this entry's one-shot override).
*/
async function placeFirstOrder({ instrument_token, tradingsymbol, exchange, quantity, buyPrice }) {

    const s = readGuardSettings();
    const perEntry = takeFirstOrderOverride(instrument_token);
    let which = perEntry || s.firstOrder;

    /*
    The exchange rejects a SELL LIMIT above the upper circuit band. On
    28/10/2026 a +50% target on a 53.93 premium worked out to ~80.9 against
    an 80.15 band: rejected on every refresh for the whole trade, so the
    position had no resting SELL at all. Clamp the target into the band,
    and if the band is too tight to rest a target above entry, protect the
    position with an SL instead of leaving it bare.
    */
    let upper = null;
    try {
        const key = `${exchange || 'NFO'}:${tradingsymbol}`;
        const q = await kiteRetry(() => kite.getQuote([key]));
        if (q && q[key] && q[key].upper_circuit_limit > 0) upper = q[key].upper_circuit_limit;
    } catch (e) {
        console.log(`⚠️ no quote for ${tradingsymbol} — placing the first order without a circuit clamp`);
    }

    let note = '';
    if (which != 'sl' && upper) {
        const wanted = roundUpToTick(buyPrice * (1 + s.targetPct / 100));
        if (wanted >= upper) {
            const clamped = roundDownToTick(upper * 0.995);
            if (clamped > buyPrice) {
                note = ` [clamped from ${wanted}: upper circuit ${upper}]`;
            } else {
                which = 'sl';
                note = ` [target impossible: +${s.targetPct}% = ${wanted} is above the ${upper} circuit band and the band is at entry — resting an SL instead]`;
            }
        }
    }

    /*
    Where the money comes off: the immediate resistance on this option's own
    chart, not a round +N%. Part of the lot rests there as a LIMIT, the rest
    keeps a real SL at the exchange, and once price CLEARS that resistance
    the level itself becomes the stop (maybeTrail). A fixed +targetPct%
    ignores where price actually struggled; a swing high is the place it
    already failed to get through once.
    */
    let levels = null;
    try { levels = await computeLevels(instrument_token); }
    catch (e) { console.log(`⚠️ no levels for ${tradingsymbol} — ${String(e.message || e).slice(0, 90)}`); }

    const lot = lotSizeByToken.get(Number(instrument_token)) || quantity;
    const res = pickResistance(levels, buyPrice, s, upper);
    const sup = pickSupport(levels, buyPrice);
    const planned = plannedStop(buyPrice, levels, s);

    let partial = null;
    if (res && s.partialPct > 0) {
        const pq = Math.floor((quantity * s.partialPct / 100) / lot) * lot;
        // a split needs something left to hold: a single lot cannot be halved
        if (pq >= lot && pq < quantity) partial = { price: res.price, qty: pq, touches: res.touches };
    }
    if (res && !partial) {
        console.log(`ℹ️ ${tradingsymbol}: resistance ${res.price} found but ${quantity} is one lot — no split, whole lot on the ${which.toUpperCase()}`);
    }

    const build = (kind, price) => {
        if (kind == 'sl') {
            const trigger = planned.stop;
            const limit = roundDownToTick(trigger * 0.99); // marketable once triggered
            return { part: { order_type: "SL", price: limit, trigger_price: trigger },
                desc: `SL trigger ${trigger} @ ${limit} — ${planned.why}, ${(((buyPrice - trigger) / buyPrice) * 100).toFixed(1)}% under ${buyPrice}` };
        }
        if (kind == 'level') {
            const pct = (((price - buyPrice) / buyPrice) * 100).toFixed(1);
            return { part: { order_type: "LIMIT", price },
                desc: `partial target ${price} at the immediate resistance (+${pct}%)` };
        }
        let targetPrice = roundUpToTick(buyPrice * (1 + s.targetPct / 100));
        if (upper && targetPrice >= upper) targetPrice = roundDownToTick(upper * 0.995);
        return { part: { order_type: "LIMIT", price: targetPrice },
            desc: `target ${targetPrice} (buy ${buyPrice} + ${s.targetPct}%)` };
    };

    const send = async (kind, qty, price) => {
        const { part, desc } = build(kind, price);
        const ids = await placeOrderInFreezeChunks(kite, {
            exchange: exchange || "NFO",
            tradingsymbol,
            transaction_type: "SELL",
            quantity: qty,
            ...part,
            product: "NRML",
            validity: "DAY",
            tag: TARGET_ORDER_TAG
        }, lotSizeByToken.get(Number(instrument_token)));
        console.log(`🎯 ${tradingsymbol} ×${qty}: ${desc}${note}${perEntry ? ' [per-entry choice from the chart]' : ''}. Order ID(s): ${ids.join(', ')}`);
        return ids;
    };

    /*
    Say the money at risk from the orders that actually rested, never from
    the intention. The stop is a real trigger, so the number is real; with
    only a target resting there is no exchange-side stop at all and the
    honest answer is the whole premium, which is what the page then shows.
    */
    const sayRisk = (stop, kind) => {
        const premium = +(buyPrice * quantity).toFixed(0);
        const risk = stop ? +((buyPrice - stop) * quantity).toFixed(0) : null;
        console.log(stop
            ? `💸 risk on this entry: ₹${risk} (${quantity} × ${buyPrice.toFixed(2)} → stop ${stop}), premium at stake ₹${premium}`
            : `💸 NO exchange-side stop on this entry — the whole ₹${premium} premium is at risk until the app's guard line fires`);
        broadcast({
            type: 'entry_risk', tradingsymbol, quantity, kind,
            buy: +buyPrice.toFixed(2), stop, risk, premium,
            riskPct: stop ? +(((buyPrice - stop) / buyPrice) * 100).toFixed(2) : null,
            partial: partial ? { price: partial.price, qty: partial.qty } : null,
            support: sup ? sup.price : null, stopWhy: stop ? planned.why : null,
            // what the partial pays per rupee risked, from the orders that rested
            rr: (stop && partial && stop < buyPrice)
                ? +((partial.price - buyPrice) / (buyPrice - stop)).toFixed(2) : null
        });
    };

    try {

        if (partial && s.partialMode == 'app') {
            /*
            The whole position is stopped at the exchange; the partial is
            this app's job. If the app dies the profit-take is missed --
            and nothing worse than that.
            */
            const ids = await send('sl', quantity);
            const appSide = ids.length == 1;   // the quantity dance in maybePartial needs one order
            if (!appSide) console.log(`⚠️ ${tradingsymbol}: the stop is ${ids.length} freeze chunks — no app-side partial, the trail still runs`);
            sayRisk(planned.stop, 'sl');
            console.log(`✂️ ${tradingsymbol}: ${partial.qty} of ${quantity} will be sold at ${partial.price} (resistance, ${partial.touches} touch${partial.touches > 1 ? 'es' : ''}) by this app; stop ${planned.stop} covers all ${quantity} at the exchange`);
            armTrail(instrument_token, tradingsymbol, { entry: buyPrice, levels, partial, support: sup, trail: s.trail, appSide, slIds: ids });
            markProtected(instrument_token);
            return ids;
        }

        if (partial) {
            const runner = quantity - partial.qty;
            // the stop goes out FIRST: if the second leg fails, what is already
            // placed is the protective one, never the profitable one
            const slIds = await send('sl', runner);
            try {
                const pIds = await send('level', partial.qty, partial.price);
                sayRisk(planned.stop, 'split');
                console.log(`✂️ ${tradingsymbol}: ${partial.qty} resting at ${partial.price} (resistance, ${partial.touches} touch${partial.touches > 1 ? 'es' : ''}), ${runner} held with the stop at ${planned.stop}`);
                armTrail(instrument_token, tradingsymbol, { entry: buyPrice, levels, partial, support: sup, trail: s.trail, slIds });
                markProtected(instrument_token);
                return [...slIds, ...pIds];
            } catch (e) {
                /*
                The LIMIT at the level was refused. Cover the other half with
                an SL too -- a position never waits bare for a profit order --
                and take the partial app-side when price reaches the level.
                One SL order: that keeps the quantity dance in maybePartial
                unambiguous, so only try it when the first leg was one order.
                */
                console.log(e, `⚠️ ${tradingsymbol}: the partial LIMIT at ${partial.price} was refused — covering that half with an SL and taking the partial app-side`);
                const slIds2 = await send('sl', partial.qty);
                const appSide = slIds.length == 1 && slIds2.length == 1;
                if (!appSide) console.log(`⚠️ ${tradingsymbol}: the stop is split across ${slIds.length + slIds2.length} orders — no app-side partial, the trail still runs`);
                sayRisk(planned.stop, 'sl');
                armTrail(instrument_token, tradingsymbol, { entry: buyPrice, levels, partial, support: sup, trail: s.trail, appSide, slIds: [...slIds, ...slIds2] });
                markProtected(instrument_token);
                return [...slIds, ...slIds2];
            }
        }

        const ids = await send(which, quantity);
        sayRisk(which == 'sl' ? planned.stop : null, which);
        armTrail(instrument_token, tradingsymbol, { entry: buyPrice, levels, partial: null, support: sup, trail: s.trail, slIds: which == 'sl' ? ids : [] });
        markProtected(instrument_token);
        return ids;

    } catch (err) {
        console.log(err, `❌ first order rejected for ${tradingsymbol}`);
        // whatever the reason, a long option must not sit with no resting
        // SELL: an SL sits below the market, so no circuit band can refuse it
        if (which != 'sl') {
            try {
                const ids = await send('sl', quantity);
                console.log(`🛟 fell back to an SL for ${tradingsymbol} — the target was refused`);
                sayRisk(planned.stop, 'sl');
                armTrail(instrument_token, tradingsymbol, { entry: buyPrice, levels, partial: null, support: sup, trail: s.trail, slIds: ids });
                markProtected(instrument_token);
                return ids;
            } catch (e2) { console.log(e2, `❌ SL fallback also rejected for ${tradingsymbol}`); }
        }
        markUnprotected(instrument_token, tradingsymbol, String(err.message || err).slice(0, 160));
        throw err;
    }
}

/*
Unprotected = an open long with no resting SELL that the guard could not
fix. It beeps on the page, it is a hard no-trade blocker (you do not add a
second unguarded position), and the per-tick breach exit will now sell
outright instead of waiting for an order to modify.
*/
const unprotectedByToken = new Map();   // token -> { tradingsymbol, since, why }

function markUnprotected(token, tradingsymbol, why) {
    const t = Number(token);
    if (!unprotectedByToken.has(t)) {
        unprotectedByToken.set(t, { tradingsymbol, since: Date.now(), why });
        console.log(`🔴 UNPROTECTED: ${tradingsymbol} has no resting SELL — ${why}`);
    }
    broadcast({ type: 'unprotected', list: unprotectedList() });
}

function markProtected(token) {
    const t = Number(token);
    if (unprotectedByToken.delete(t)) {
        console.log(`🟢 protected again: resting SELL is back on token ${t}`);
        broadcast({ type: 'unprotected', list: unprotectedList() });
    }
}

function unprotectedList() {
    return [...unprotectedByToken.entries()].map(([token, v]) => ({
        token, tradingsymbol: v.tradingsymbol, why: v.why,
        forMin: +((Date.now() - v.since) / 60000).toFixed(1)
    }));
}

/*
What this entry puts at risk, BEFORE it is placed: the stop the guard will
rest, in rupees. SL first -> a real number. Target first -> there is no
exchange-side stop, so the premium is the risk; the caller shows that.
*/
async function riskPreview({ price, quantity, firstOrder, token }) {
    const s = readGuardSettings();
    const which = ['target', 'sl'].includes(firstOrder) ? firstOrder : s.firstOrder;
    const premium = +(price * quantity).toFixed(0);
    if (which != 'sl') {
        return { firstOrder: which, stop: null, risk: null, riskPct: null, premium, slMode: s.slMode,
            note: 'target first — no exchange-side stop, the app-side guard line is the only exit' };
    }
    /*
    With slMode 'level' the stop is a tick under the immediate support, so
    the honest preview needs that support -- hence the token. Without one
    the exact spot is unknowable in advance, so the reply carries the BAND
    the stop must land in (slPct .. slMaxPct) and the page shows a range
    rather than a single number it would be wrong about.
    */
    let levels = null, known = true;
    if (s.slMode == 'level') {
        if (Number(token) > 0) {
            try { levels = await computeLevels(Number(token)); } catch (e) { known = false; }
        } else {
            known = false;
        }
    }
    const { stop, why } = plannedStop(price, levels, s);
    const widest = roundDownToTick(price * (1 - s.slMaxPct / 100));
    /*
    The partial target is the immediate resistance, so its reward-to-risk is
    knowable at entry -- and worth reporting, because a level only 2% up
    against a 2% stop is a 1:1 partial. Reported, not blocked: where the
    level sits is the market's call, whether 1:1 is worth taking is yours.
    */
    const res = levels ? pickResistance(levels, price, s, null) : null;
    const rr = (res && stop < price) ? +((res.price - price) / (price - stop)).toFixed(2) : null;
    return {
        firstOrder: which, stop, premium, slMode: s.slMode, known,
        target: res ? res.price : null, rr,
        risk: +((price - stop) * quantity).toFixed(0),
        riskPct: +(((price - stop) / price) * 100).toFixed(2),
        worstStop: widest,
        worstRisk: +((price - widest) * quantity).toFixed(0),
        worstPct: s.slMaxPct,
        note: known ? why : `stop lands between ${s.slPct}% and ${s.slMaxPct}% under entry, at the immediate support`
    };
}

/* ---------------------------------------------------------------------
OPEN INTEREST: SHORT COVERING AS AN ENTRY

The read: on a CE, price rising while OI FALLS means the writers are buying
their shorts back. Nobody is selling into the move, so it tends to keep
going. Price rising while OI RISES is the opposite -- fresh writers are
capping it.

Two things to know before trusting this:

1. Kite publishes OI roughly every 3 minutes, not every tick. On 28/10 the
   option's OI changed 143 times across 385 minutes. So the drop is always
   a few minutes stale and no lookback under ~5 minutes means anything.

2. On 28/10's data this signal was a COIN FLIP. Simulated against the real
   exit rules (2% stop, half out at the resistance, trail to breakeven) the
   win rate sat at 10-67% depending on where the thresholds were put, and
   the sign flipped between neighbouring thresholds -- which is noise, not
   an edge. Sample sizes were 3 to 12 trades on one day.

So this ships as an ALERT that logs itself, with `autoBuy` off. Every fire
is written to oiLog.json with the forward price at +5/+10/+15/+30 minutes,
so after a week /api/oiLog can answer "does this pay?" with real numbers
instead of a hunch. Turn autoBuy on when it does.
--------------------------------------------------------------------- */

const OI_FILE = path.join(__dirname, 'oiSignals.json');
const OI_LOG_FILE = path.join(__dirname, 'oiLog.json');

const OI_DEFAULTS = {
    enabled: true,      // detect and log
    autoBuy: false,     // place a real BUY on a fire -- OFF until the log earns it
    lookMin: 5,         // minutes back to measure the OI and price change over
    oiDropPct: 3,       // OI must be at least this much LOWER than lookMin ago
    pxUpPct: 1.5,       // and price at least this much HIGHER
    cooldownMin: 10,    // per symbol, so one unwind is not twenty signals
    minRR: 1.5,         // skip the fire if the partial at the resistance pays less
    quantity: 0         // 0 = one lot
};

let oiCfgCache = null, oiCfgAt = 0;
function readOiCfg() {
    // the detector asks once per tick, so the file is read at most once a
    // second and a Save invalidates the cache outright
    if (oiCfgCache && Date.now() - oiCfgAt < 1000) return oiCfgCache;
    try { oiCfgCache = { ...OI_DEFAULTS, ...JSON.parse(fs.readFileSync(OI_FILE, 'utf8')) }; }
    catch (e) { oiCfgCache = { ...OI_DEFAULTS }; }
    oiCfgAt = Date.now();
    return oiCfgCache;
}
function writeOiCfg(s) {
    fs.writeFileSync(OI_FILE, JSON.stringify(s, null, 2));
    oiCfgCache = null;
}

function readOiLog() {
    try { return JSON.parse(fs.readFileSync(OI_LOG_FILE, 'utf8')); } catch (e) { return []; }
}
function writeOiLog(rows) { fs.writeFileSync(OI_LOG_FILE, JSON.stringify(rows, null, 2)); }

/*
One sample per minute per token: enough for a 5-minute lookback, and a
restart only costs the first few minutes rather than the day. Ticks arrive
many times a second, so the minute key is what keeps this small.
*/
const oiSeries = new Map();      // token -> [{ min, ltp, oi }]
const oiLastFire = new Map();    // token -> minute key of the last signal
const OI_SERIES_MAX = 90;

function pushOiSample(token, ltp, oi) {
    if (!(oi > 0)) return null;
    const min = Math.floor(Date.now() / 60000);
    let a = oiSeries.get(token);
    if (!a) { a = []; oiSeries.set(token, a); }
    const last = a[a.length - 1];
    if (last && last.min == min) { last.ltp = ltp; last.oi = oi; return a; }
    a.push({ min, ltp, oi });
    if (a.length > OI_SERIES_MAX) a.shift();
    return a;
}

/*
Fill in what happened AFTER each logged signal. Called off the same minute
tick: every row still missing a forward price gets one once enough minutes
have passed, so the log scores itself without a cron job.
*/
function scoreOiLog(token, ltp) {
    const rows = readOiLog();
    const min = Math.floor(Date.now() / 60000);
    let touched = false;
    for (const r of rows) {
        if (r.token != token || r.min == null) continue;
        for (const h of [5, 10, 15, 30]) {
            const k = 'fwd' + h;
            if (r[k] == null && min - r.min >= h) {
                r[k] = +ltp.toFixed(2);
                r[k + 'Pct'] = +(((ltp - r.ltp) / r.ltp) * 100).toFixed(2);
                touched = true;
            }
        }
    }
    if (touched) writeOiLog(rows);
}

/* ---------------------------------------------------------------------
SETUP ALERTS

Alert only. Nothing here places, modifies or cancels an order -- there is
no order call in this whole block, by design. It watches the charted
option tokens for the two price setups the backtest actually paid for and
tells you, with the plan already worked out: stop, partial, R.

  bounce -- the bar wicked into a support and closed back above it
  break  -- the bar closed 0.5% clear of a resistance the previous bar
            was still under

Every alert carries the regime verdict and the no-trade verdict, so a
setup that fires inside chop or against the index arrives marked DO NOT
TAKE rather than silently dropped -- that is how you learn to see the
choppy day yourself instead of trusting the filter blind.

Runs once per completed minute per token, off the back of the tick that
opens a new minute.
--------------------------------------------------------------------- */
const SETUP_FILE = path.join(__dirname, 'setupAlerts.json');
const SETUP_LOG_FILE = path.join(__dirname, 'setupLog.json');
const SETUP_DEFAULTS = {
    enabled: true,
    cooldownMin: 10,     // per token per kind, so one level is not twenty alerts
    minRR: 1.5,          // below this the partial is not worth the spread
    minTouches: 1,       // raise to 2 once there is a multi-day sample
    breakClearPct: 0.5,  // how far past the level the close must be
    wickPct: 0.2         // how deep into the support the low may poke
};
function readSetupCfg() {
    try { return { ...SETUP_DEFAULTS, ...JSON.parse(fs.readFileSync(SETUP_FILE, 'utf8')) }; }
    catch { return { ...SETUP_DEFAULTS }; }
}
function readSetupLog() {
    try { return JSON.parse(fs.readFileSync(SETUP_LOG_FILE, 'utf8')); } catch { return []; }
}
function writeSetupLog(rows) {
    try { fs.writeFileSync(SETUP_LOG_FILE, JSON.stringify(rows.slice(-500), null, 1)); }
    catch (e) { console.log('⚠️ setupLog write failed', e.message); }
}

const setupLastMin = new Map();          // token -> last minute scanned
const setupLastFire = new Map();         // token|kind -> minute it last fired

async function checkSetups(token, ltp) {
    const cfg = readSetupCfg();
    if (!cfg.enabled) return;
    if (!chartedTokens.map(Number).includes(Number(token))) return;   // only what is on screen
    const inst = instByToken.get(Number(token));
    if (!inst) return;                                               // spot has no setups

    const min = Math.floor(Date.now() / 60000);
    if (setupLastMin.get(token) == min) return;                      // already did this minute
    setupLastMin.set(token, min);

    const lv = await computeLevels(token);
    if (!lv || !lv.candles || lv.candles.length < 3) return;
    const c = lv.candles;
    const last = c[c.length - 1], prev = c[c.length - 2];

    const hits = [];
    const sup = pickSupport(lv, last.close);
    if (sup && sup.touches >= cfg.minTouches
        && last.low <= sup.price * (1 + cfg.wickPct / 100)
        && last.close > sup.price && last.close > last.open) {
        hits.push({ kind: 'bounce', level: sup.price, touches: sup.touches,
            what: `wicked into ${sup.price} (${sup.touches}t) and closed back above at ${last.close}` });
    }
    const below = lv.resistances.filter(L => L.price < last.close);
    const R = below[below.length - 1];
    if (R && R.touches >= cfg.minTouches
        && last.close >= R.price * (1 + cfg.breakClearPct / 100)
        && prev.close < R.price) {
        hits.push({ kind: 'break', level: R.price, touches: R.touches,
            what: `closed ${last.close} — ${cfg.breakClearPct}% clear of ${R.price} (${R.touches}t)` });
    }
    if (!hits.length) return;

    const gset = readGuardSettings();
    for (const h of hits) {
        const key = token + '|' + h.kind;
        const fired = setupLastFire.get(key);
        if (fired != null && min - fired < cfg.cooldownMin) continue;
        setupLastFire.set(key, min);

        const ps = plannedStop(ltp, lv, gset);
        const res = pickResistance(lv, ltp, gset, null);
        const target = res ? res.price : null;
        const rr = (target && ps.stop < ltp) ? +((target - ltp) / (ltp - ps.stop)).toFixed(2) : null;
        const risk = +((ltp - ps.stop)).toFixed(2);

        const g = noTradeChecks({ premium: ltp, tradingsymbol: inst.tradingsymbol });
        const thin = rr == null || rr < cfg.minRR;
        const verdict = g.blocked ? 'BLOCKED' : (thin ? 'THIN' : 'TAKE');

        const row = {
            at: dayjs().format('YYYY-MM-DD HH:mm:ss'), date: dayjs().format('YYYY-MM-DD'),
            min, token: Number(token), tradingsymbol: inst.tradingsymbol,
            kind: h.kind, level: h.level, touches: h.touches, what: h.what,
            ltp: +ltp.toFixed(2), stop: ps.stop, stopWhy: ps.why, riskPerUnit: risk,
            target, rr, verdict,
            blockers: g.blocked ? g.blockers.map(b => b.label) : [],
            regime: g.regime && g.regime.ok
                ? { eff: g.regime.eff, chop: g.regime.chop, bias: g.regime.bias }
                : null
        };

        console.log(`🔔 SETUP ${h.kind.toUpperCase()} ${inst.tradingsymbol} @ ${row.ltp} — ${h.what}`
            + (rr != null ? ` — stop ${ps.stop}, partial ${target}, ${rr}R` : ' — no partial above')
            + ` — ${verdict}` + (g.blocked ? ': ' + row.blockers.join(' | ') : ''));

        const rows = readSetupLog();
        rows.push(row);
        writeSetupLog(rows);
        broadcast({ type: 'setup_alert', ...row });
    }
}

/*
The detector. Runs on the minute boundary only -- OI does not move faster
than that anyway, and it keeps one Kite history call per minute per token
rather than one per tick.
*/
async function checkOiSignal(token, ltp, oi) {
    const cfg = readOiCfg();
    if (!cfg.enabled) return;
    const a = pushOiSample(token, ltp, oi);
    if (!a) return;
    const now = a[a.length - 1];
    // the sample we just pushed is only new once a minute; everything below
    // is per-minute work, so bail unless this tick opened a fresh minute
    if (a.length < 2 || a[a.length - 2].min == now.min) return;

    scoreOiLog(token, ltp);

    const inst = instByToken.get(token);
    if (!inst) return;                                 // spot, or an unknown token
    const past = [...a].reverse().find(s => now.min - s.min >= cfg.lookMin);
    if (!past || !(past.oi > 0)) return;

    const dOi = +(((now.oi - past.oi) / past.oi) * 100).toFixed(2);
    const dPx = +(((now.ltp - past.ltp) / past.ltp) * 100).toFixed(2);
    if (!(dOi <= -cfg.oiDropPct && dPx >= cfg.pxUpPct)) return;

    const fired = oiLastFire.get(token);
    if (fired != null && now.min - fired < cfg.cooldownMin) return;

    // where the stop and the partial would land, so the fire carries its own R
    let stop = null, target = null, rr = null, why = '';
    try {
        const s = readGuardSettings();
        const lv = await computeLevels(token);
        const ps = plannedStop(ltp, lv, s);
        stop = ps.stop; why = ps.why;
        const res = pickResistance(lv, ltp, s, null);
        target = res ? res.price : null;
        if (target && stop < ltp) rr = +((target - ltp) / (ltp - stop)).toFixed(2);
    } catch (e) { /* a signal with no levels is still worth logging */ }

    oiLastFire.set(token, now.min);
    const thin = rr != null && rr < cfg.minRR;
    const row = {
        at: dayjs().format('YYYY-MM-DD HH:mm:ss'), date: dayjs().format('YYYY-MM-DD'),
        min: now.min, token, tradingsymbol: inst.tradingsymbol,
        ltp: +ltp.toFixed(2), oi: now.oi, oiWas: past.oi, dOi, dPx,
        lookMin: cfg.lookMin, stop, target, rr, stopWhy: why,
        skipped: thin ? `rr ${rr} under ${cfg.minRR}` : null, bought: false, orderIds: []
    };

    console.log(`📉 OI SIGNAL ${inst.tradingsymbol}: OI ${dOi}% (${past.oi} → ${now.oi}) `
        + `while price ${dPx > 0 ? '+' : ''}${dPx}% to ${ltp} over ${cfg.lookMin}m`
        + (rr != null ? ` — stop ${stop}, partial ${target}, ${rr}R` : ' — no levels yet')
        + (thin ? ` — SKIPPED, ${row.skipped}` : ''));

    if (cfg.autoBuy && !thin) {
        const g = noTradeChecks({ premium: ltp, tradingsymbol: inst.tradingsymbol });
        if (g.blocked) {
            row.skipped = 'NO TRADE: ' + g.blockers.map(b => b.label).join(' | ');
            console.log(`⛔ OI signal ${inst.tradingsymbol} not taken — ${row.skipped}`);
        } else {
            try {
                const lot = lotSizeByToken.get(token) || 1;
                const qty = cfg.quantity > 0 ? cfg.quantity : lot;
                // on disk before the BUY: the fill can land before the next line runs
                setFirstOrderOverride(token, 'sl');
                row.orderIds = await placeOrderInFreezeChunks(kite, {
                    exchange: inst.exchange, tradingsymbol: inst.tradingsymbol,
                    transaction_type: "BUY", quantity: qty, order_type: "LIMIT",
                    price: roundToTick(ltp * 1.02), product: "NRML", validity: "DAY", tag: "OISIG"
                }, lot);
                row.bought = true; row.quantity = qty;
                console.log(`🟩 OI SIGNAL BUY ${qty} ${inst.tradingsymbol} @ ~${ltp} → ${row.orderIds.join(',')}`);
            } catch (e) {
                row.skipped = 'order failed: ' + String(e.message || e);
                console.log(`❌ OI signal BUY failed ${inst.tradingsymbol}`, e.message || e);
            }
        }
    }

    const rows = readOiLog();
    rows.push(row);
    writeOiLog(rows);
    broadcast({ type: 'oi_signal', ...row, autoBuy: cfg.autoBuy });
}

/* ---------------------------------------------------------------------
PRICE LEVELS ON THE OPTION'S OWN CHART

A swing pivot is a bar whose high is the highest (or low the lowest) of the
PIVOT_WIN bars each side of it -- the places where price actually turned.
Pivots within LEVEL_CLUSTER_PCT of each other are the same level touched
twice, so they are merged: three taps of 46.0/46.2/46.1 is ONE level, not
three. The day's own high and low count as levels too.

These are computed from completed 1-min candles only, for the same reason
the breach level is: a level made by the live forming candle would be
tested against the very bar that made it.
--------------------------------------------------------------------- */
function clusterLevels(vals, asc) {
    const sorted = [...vals].filter(v => v > 0).sort((a, b) => a - b);
    const out = [];
    for (const v of sorted) {
        const last = out[out.length - 1];
        // same level, touched again: keep the group's mean. The second test
        // bounds the GROUP, not just the gap -- without it a slow drift
        // merges step by step into one level spanning half the session.
        if (last && (v - last.max) / last.max * 100 <= LEVEL_CLUSTER_PCT
                 && (v - last.min) / last.min * 100 <= LEVEL_CLUSTER_PCT * 2) {
            last.sum += v; last.n++; last.max = v;
        } else {
            out.push({ sum: v, n: 1, max: v, min: v });
        }
    }
    const levels = out.map(g => ({ price: +roundToTick(g.sum / g.n).toFixed(2), touches: g.n }));
    return asc ? levels : levels.reverse();
}

async function computeLevels(instrument_token) {
    const from = dayjs().format('YYYY-MM-DD') + ' 09:15:00';
    const to = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const candles = await kiteRetry(() => kite.getHistoricalData(Number(instrument_token), 'minute', from, to));
    if (!candles || candles.length == 0) return null;

    const cur = dayjs().startOf('minute');
    const c = candles.filter(x => dayjs(x.date).isBefore(cur));
    if (c.length < PIVOT_WIN * 2 + 1) return null;   // too early in the session to have turned anywhere

    const highs = [], lows = [];
    for (let i = PIVOT_WIN; i < c.length - PIVOT_WIN; i++) {
        const w = c.slice(i - PIVOT_WIN, i + PIVOT_WIN + 1);
        if (c[i].high >= Math.max(...w.map(x => x.high))) highs.push(c[i].high);
        if (c[i].low <= Math.min(...w.map(x => x.low))) lows.push(c[i].low);
    }
    const dayHigh = Math.max(...c.map(x => x.high));
    const dayLow = Math.min(...c.map(x => x.low));
    highs.push(dayHigh); lows.push(dayLow);

    return {
        at: new Date().toISOString(), bars: c.length, dayHigh, dayLow,
        candles: c,                                // the completed bars, for the setup scanner
        resistances: clusterLevels(highs, true),   // ascending: [0] is the closest above
        supports: clusterLevels(lows, false)       // descending: [0] is the closest below
    };
}

/*
The immediate resistance: the nearest clustered swing high that is far
enough above `price` to be worth aiming at, near enough to be reachable,
and inside the upper circuit band (a SELL LIMIT above the band is refused
-- that is what cost INR 7,947 on 28/10).
*/
function pickResistance(levels, price, s, upper) {
    if (!levels) return null;
    const lo = price * (1 + s.levelGapPct / 100);
    const hi = price * (1 + s.levelMaxPct / 100);
    for (const L of levels.resistances) {
        if (L.price < lo || L.price > hi) continue;
        if (upper && L.price >= upper) continue;
        return L;
    }
    return null;
}
// the immediate support: where a stop has somewhere to hide
function pickSupport(levels, price) {
    if (!levels) return null;
    return (levels.supports || []).find(L => L.price < price) || null;
}

/*
Where the stop goes. A flat -2% is a stop placed by arithmetic: it sits
wherever the percentage lands, which on a quiet option is inside the
spread and on a fast one is miles past the level that mattered. So the
LEVEL picks the spot and the PERCENTAGES fence it in:

  slPct     the tightest it may ever be  (closer than this is noise)
  slMaxPct  the widest it may ever be    (further than this is not a stop)

A tick under the support, clamped into that band. slMode 'pct' restores
the old flat behaviour, and the band is why the risk figure stays bounded:
worst case is always slMaxPct of the premium.
*/
function plannedStop(entry, levels, s) {
    const tight = roundDownToTick(entry * (1 - s.slPct / 100));
    const wide = roundDownToTick(entry * (1 - s.slMaxPct / 100));
    if (s.slMode != 'level') return { stop: tight, why: `flat ${s.slPct}% under entry` };
    const sup = pickSupport(levels, entry);
    if (!sup) return { stop: tight, why: `no support found below entry — flat ${s.slPct}%` };
    const raw = roundDownToTick(sup.price - TICK);        // a tick UNDER the level, not on it
    if (raw > tight) return { stop: tight, why: `support ${sup.price} is inside the ${s.slPct}% noise band — held at ${s.slPct}%` };
    if (raw < wide) return { stop: wide, why: `support ${sup.price} is further than ${s.slMaxPct}% — capped at ${s.slMaxPct}%` };
    return { stop: raw, why: `a tick under the immediate support ${sup.price} (${sup.touches} touch${sup.touches > 1 ? 'es' : ''})` };
}

/* ---------------------------------------------------------------------
PARTIAL EXIT AT THE LEVEL, THEN THE LEVEL BECOMES THE STOP

A fill rests two orders: a LIMIT for part of the lot at the immediate
resistance, and a real SL at the exchange for the rest. Together they are
exactly the position size, so neither half looks like a naked short.

Then the ratchet: each time price CLEARS one of the resistances above entry
by TRAIL_CLEAR_PCT, that level becomes the stop -- the app-side guard line
and the resting SL order's trigger both move up to it. A level price has
just broken through is where it should hold on the way back; if it does
not, the trade is over and the gain is kept. The stop only moves UP, never
down, and a manual drag still wins until the next level is cleared.
--------------------------------------------------------------------- */
const trailByToken = new Map();     // token -> { tradingsymbol, entry, ladder, stop, partial, support, steps }
const trailInProgress = new Set();

function armTrail(token, tradingsymbol, { entry, levels, partial, support, trail, appSide, slIds }) {
    const t = Number(token);
    const ladder = levels ? levels.resistances.map(L => L.price).filter(p => p > entry) : [];
    trailByToken.set(t, {
        tradingsymbol, entry, trail: trail !== false, ladder, slIds: slIds || [],
        stop: breachLevelByToken.get(t) != null ? breachLevelByToken.get(t) : null,
        partial: partial ? { price: partial.price, qty: partial.qty, appSide: !!appSide, done: false } : null,
        support: support ? support.price : null,
        steps: []
    });
    console.log(`🪜 ${tradingsymbol}: ladder above entry ${ladder.length ? ladder.join(' → ') : '(none)'}`
        + `${support ? `, immediate support ${support.price}` : ''}${trail === false ? ' [trail off]' : ''}`);
    broadcastTrail(t);
}
function trailInfo(t) {
    const st = trailByToken.get(Number(t));
    if (!st) return null;
    return {
        token: Number(t), tradingsymbol: st.tradingsymbol, entry: st.entry, ladder: st.ladder,
        stop: st.stop, support: st.support, trail: st.trail,
        partial: st.partial ? { ...st.partial } : null, steps: st.steps
    };
}
function broadcastTrail(t) {
    const info = trailInfo(t);
    if (info) broadcast({ type: 'levels', ...info });
}

async function maybeTrail(token, ltp) {
    const t = Number(token);
    const st = trailByToken.get(t);
    if (!st || !st.trail || !st.ladder.length) return;
    if (trailInProgress.has(t) || exitInProgressByToken.has(t)) return;

    // the HIGHEST level price has cleared, not merely the first one
    let lv = null;
    for (const L of st.ladder) {
        if (st.stop != null && L <= st.stop) continue;
        if (ltp >= L * (1 + TRAIL_CLEAR_PCT / 100)) lv = L;
    }
    if (lv == null) return;

    trailInProgress.add(t);
    const prev = st.stop;
    try {
        st.stop = lv;
        breachLevelByToken.set(t, lv);
        saveBreachOverride(t, lv);   // else applyBreachOverrides() puts the entry level back
        writeGuardState();

        const trigger = roundDownToTick(lv);
        const limit = roundDownToTick(trigger * 0.99);
        const sls = (guardRestingByToken.get(t) || []).filter(o => o.order_type == 'SL');
        let moved = 0;
        for (const o of sls) {
            if (o.trigger_price >= trigger) continue;          // never move a stop down
            await kite.modifyOrder('regular', o.order_id, {
                order_type: 'SL', price: limit, trigger_price: trigger
            });
            o.trigger_price = trigger; o.price = limit;         // cache honest until the next refresh
            moved++;
        }
        st.steps.push({ at: new Date().toISOString(), level: lv, ltp, moved });
        const lockedPct = +(((lv - st.entry) / st.entry) * 100).toFixed(1);
        console.log(`🪜 TRAIL ${st.tradingsymbol}: LTP ${ltp} cleared ${lv} → stop ${prev == null ? '—' : prev} to ${lv}`
            + ` (${lockedPct >= 0 ? '+' : ''}${lockedPct}% vs entry ${st.entry})`
            + (moved ? `, ${moved} SL order${moved > 1 ? 's' : ''} modified`
                     : `, app-side line only — no SL order resting`));
        broadcast({ type: 'trail', token: t, tradingsymbol: st.tradingsymbol, level: lv, ltp, prev, moved, entry: st.entry, lockedPct });
        broadcastTrail(t);
    } catch (err) {
        // the app-side line is already at the new level, which is the tighter
        // of the two -- say the exchange order did not follow
        console.log(err, `❌ TRAIL ${st.tradingsymbol}: could not move the resting SL to ${lv} (the app-side guard line did move)`);
    } finally {
        trailInProgress.delete(t);
    }
}

/*
Fallback partial: only when the exchange refused the LIMIT at the level.
The resting SL covers the whole position, so its quantity comes DOWN first
and the sale goes out second -- never the other way round, or the remainder
would briefly be short more than it holds.
*/
async function maybePartial(token, ltp) {
    const t = Number(token);
    const st = trailByToken.get(t);
    if (!st || !st.partial || !st.partial.appSide || st.partial.done) return;
    if (ltp < st.partial.price) return;
    const position = guardPositionByToken.get(t);
    if (!position) return;
    const held = Math.abs(position.quantity);
    const pq = st.partial.qty;
    if (!(pq > 0) || pq >= held) return;
    if (trailInProgress.has(t) || exitInProgressByToken.has(t)) return;

    trailInProgress.add(t);
    st.partial.done = true;   // one attempt, whatever happens: no tick-by-tick retry loop
    const sls = (guardRestingByToken.get(t) || []).filter(o => o.order_type == 'SL');
    if (sls.length != 1) {
        console.log(`⏭ ${st.tradingsymbol}: ${sls.length} resting SL orders — not touching quantities, no app-side partial`);
        trailInProgress.delete(t);
        return;
    }
    try {
        for (const o of sls) {
            await kite.modifyOrder('regular', o.order_id, { quantity: held - pq });
            o.quantity = held - pq;
        }
        const ids = await placeOrderInFreezeChunks(kite, {
            exchange: position.exchange || 'NFO',
            tradingsymbol: st.tradingsymbol,
            transaction_type: 'SELL',
            quantity: pq,
            order_type: 'LIMIT',
            price: st.partial.price,
            product: 'NRML',
            validity: 'DAY',
            tag: TARGET_ORDER_TAG
        }, lotSizeByToken.get(t));
        console.log(`✂️ APP-SIDE PARTIAL ${st.tradingsymbol}: LTP ${ltp} reached ${st.partial.price} — sold ${pq} of ${held} → ${ids.join(',')}`);
        broadcast({ type: 'partial_exit', token: t, tradingsymbol: st.tradingsymbol, qty: pq, price: st.partial.price, appSide: true });
    } catch (err) {
        console.log(err, `❌ app-side partial failed for ${st.tradingsymbol} — putting the SL quantity back to ${held}`);
        for (const o of sls) {
            try { await kite.modifyOrder('regular', o.order_id, { quantity: held }); o.quantity = held; }
            catch (e2) { console.log(e2, `❌ could not restore the SL quantity for ${st.tradingsymbol} — check it by hand`); }
        }
    } finally {
        trailInProgress.delete(t);
    }
}

/*
Breach level: min low of the last CANDLE_COUNT COMPLETED 1-min candles.
The live forming candle is excluded -- including it would be
self-referential (a retest of a low the live candle itself just made would
read as a breach).
*/
async function computeBreachLevel(instrument_token) {

    const from = dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss');
    const to = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const candles = await kiteRetry(() => kite.getHistoricalData(Number(instrument_token), 'minute', from, to));
    if (!candles || candles.length == 0) return null;

    const currentMinuteStart = dayjs().startOf('minute');
    const completed = candles.filter(c => dayjs(c.date).isBefore(currentMinuteStart));

    // first minutes of the session: nothing completed yet -- no level rather
    // than Math.min() of an empty list (+Infinity would never breach)
    const reference = completed.slice(-CANDLE_COUNT);
    if (reference.length == 0) return null;

    return Math.min(...reference.map(c => c.low));
}

async function freezeBreachLevel(token, tradingsymbol) {
    try {
        const level = await computeBreachLevel(token);
        if (level != null) {
            breachLevelByToken.set(Number(token), level);
            breachSymbolByToken.set(Number(token), tradingsymbol);
            writeGuardState();
            console.log(`📏 Breach level frozen for ${tradingsymbol}: ${level}`);
        }
    } catch (err) {
        console.log(err, `⚠️ Failed computing breach level for ${tradingsymbol}`);
    }
}

/*
REST refresh: positions, resting SELL orders and the breach level per token.
Also the safety net that places a missing first order (e.g. a buy that
filled while this process was down).
*/
async function guardRefresh() {

    try {

        const positions = await kiteRetry(() => kite.getPositions());
        const netLong = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        guardPositionByToken.clear();

        if (netLong.length == 0) {
            guardRestingByToken.clear();
            trailByToken.clear();
            for (const t of [...unprotectedByToken.keys()]) markProtected(t);
            if (breachLevelByToken.size > 0) {
                breachLevelByToken.clear();
                breachSymbolByToken.clear();
                writeGuardState();
            }
            clearBreachOverride(null); // a leftover drag must never leak into the next trade
            return;
        }

        const orders = await kiteRetry(() => kite.getOrders());

        for (const position of netLong) {

            const token = Number(position.instrument_token);
            guardPositionByToken.set(token, position);
            guardSubscribeToken(token);

            const resting = orders.filter(
                o => o.tradingsymbol == position.tradingsymbol &&
                    o.transaction_type == "SELL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
            );
            guardRestingByToken.set(token, resting);
            if (resting.length) markProtected(token);

            // The level is FROZEN at entry -- computed once (at the BUY fill,
            // or here once after a restart) and never recomputed while the
            // position is open.
            if (!breachLevelByToken.has(token)) {
                await freezeBreachLevel(token, position.tradingsymbol);
            } else {
                breachSymbolByToken.set(token, position.tradingsymbol);
            }

            // safety net: position without any resting SELL -> place the first order
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
                if (!tradeCtxByToken.has(token) && buyPrice > 0) {
                    // restarted mid-trade: MFE/MAE only from here on, flagged as partial
                    startTradeCtx(token, {
                        tradingsymbol: position.tradingsymbol, entry: buyPrice,
                        qty: Math.abs(position.quantity)
                    });
                    tradeCtxByToken.get(token).partial = true;
                }

                console.log(`⚠️ No resting SELL for ${position.tradingsymbol}, placing the first order`);

                try {
                    await placeFirstOrder({
                        instrument_token: token,
                        tradingsymbol: position.tradingsymbol,
                        exchange: position.exchange,
                        quantity: Math.abs(position.quantity),
                        buyPrice
                    });
                } catch (err) {
                    console.log(err, `❌ Failed placing the first order for ${position.tradingsymbol}`);
                }
            }
        }

        // a flag for a position that is no longer open is noise
        for (const t of [...unprotectedByToken.keys()])
            if (!guardPositionByToken.has(t)) markProtected(t);

        applyBreachOverrides();

    } catch (err) {
        console.log(err, "❌ guardRefresh error");
    }
}

/*
Per-tick check: LTP at/below the frozen breach level -> modify the resting
order(s) into a marketable LIMIT, instant exit. Called for every tick from
the one ticker this process runs.
*/
async function guardOnTick(token, ltp) {

    if (!ltp) return;

    touchTradeCtx(token, ltp);   // MFE/MAE for the post-trade review

    const position = guardPositionByToken.get(token);
    if (!position) return;

    // money off at the level, then the level becomes the stop -- both before
    // the breach check, so a stop raised on this tick applies on this tick
    await maybePartial(token, ltp);
    await maybeTrail(token, ltp);

    const level = breachLevelByToken.get(token);
    if (level == null || ltp > level) return;

    if (exitInProgressByToken.has(token)) return;
    exitInProgressByToken.add(token);

    /*
    No resting SELL is a reason to sell NOW, not a reason to do nothing.
    28/10/2026, SENSEX26OCT71400PE: the +50% target was above the upper
    circuit band, so every placement was rejected and this list stayed
    empty -- the old code returned here on every single tick and the
    position ran to -33% (-INR 7,947) with nothing watching it.
    */
    const restingOrders = guardRestingByToken.get(token) || [];

    // the SELL fill will look like any other LIMIT fill, so say now what caused it
    noteExitReason(token, 'guard_breach', `LTP ${ltp} broke the ${CANDLE_COUNT}-candle low ${level}`);

    const exitPrice = roundDownToTick(ltp * 0.9);

    try {

        if (restingOrders.length) {
            for (const order of restingOrders) {
                await kite.modifyOrder("regular", order.order_id, {
                    order_type: "LIMIT",
                    price: exitPrice,
                    trigger_price: 0, // the resting order may be an SL now
                });
                console.log(`🚨 Exit: modified order ${order.order_id} for ${position.tradingsymbol} into marketable LIMIT at ${exitPrice} (LTP ${ltp} broke ${CANDLE_COUNT}-candle low ${level})`);
            }
        } else {
            // nothing resting to modify -> place the exit outright
            const ids = await placeOrderInFreezeChunks(kite, {
                exchange: position.exchange || 'NFO',
                tradingsymbol: position.tradingsymbol,
                transaction_type: "SELL",
                quantity: Math.abs(position.quantity),
                order_type: "LIMIT",
                price: exitPrice,
                product: "NRML",
                validity: "DAY",
                tag: TARGET_ORDER_TAG
            }, lotSizeByToken.get(Number(token)));
            console.log(`🚨 Exit: ${position.tradingsymbol} had NO resting SELL — placed a fresh marketable LIMIT ${Math.abs(position.quantity)} @ ${exitPrice} (LTP ${ltp} broke ${CANDLE_COUNT}-candle low ${level}) → ${ids.join(',')}`);
        }

        broadcast({ type: "guard_exit", tradingsymbol: position.tradingsymbol, ltp, level, price: exitPrice });

        // don't re-fire off stale caches; the next refresh rebuilds reality
        guardRestingByToken.delete(token);
        guardPositionByToken.delete(token);

    } catch (err) {
        console.log(err, `❌ Exit modify failed for ${position.tradingsymbol}`);
    } finally {
        exitInProgressByToken.delete(token);
    }
}

/*
Order stream: a BUY fill arms the guard (freeze level + place the one
resting SELL); a SELL that flattens the position logs the trade and cleans
up. Same handler the page's order_update broadcast comes from.
*/
async function guardOnOrderUpdate(u) {

    const { instrument_token, status, transaction_type, tradingsymbol, quantity, exchange } = u;

    if (status != "COMPLETE" || !OPTION_EXCHANGES.includes(exchange)) return;

    const token = Number(instrument_token);

    if (transaction_type == "BUY") {

        actualBuyPriceByToken.set(token, u.average_price);
        guardSubscribeToken(token);
        startTradeCtx(token, { tradingsymbol, entry: u.average_price, qty: quantity });

        // freeze the breach level as of entry: min low of the candles
        // completed just before this fill. Not recomputed afterwards.
        await freezeBreachLevel(token, tradingsymbol);

        try {
            await placeFirstOrder({
                instrument_token: token,
                tradingsymbol,
                exchange,
                quantity,
                buyPrice: u.average_price
            });
        } catch (err) {
            console.log(err, `❌ Failed placing the first order for ${tradingsymbol}`);
        }
        return;
    }

    if (transaction_type == "SELL") {

        // position may be flat now -- cancel any leftover resting SELLs (but
        // leave them if quantity remains: freeze chunks still protecting the
        // remainder)
        try {

            const positions = await kiteRetry(() => kite.getPositions());
            const open = (positions.net || []).find(
                p => p.tradingsymbol == tradingsymbol && p.quantity > 0
            );
            /*
            Still open after a SELL = the partial at the resistance paid and
            the runner is live. Not a closed trade: no log, no lockout, and
            the leftover SL below stays exactly where it is -- it covers the
            remainder, because the split sized it that way at entry.
            */
            if (open) {
                const st = trailByToken.get(token);
                if (st && st.partial) st.partial.done = true;
                const gain = actualBuyPriceByToken.get(token)
                    ? +((u.average_price - actualBuyPriceByToken.get(token)) * quantity).toFixed(0) : null;
                console.log(`✂️ PARTIAL ${tradingsymbol}: sold ${quantity} @ ${u.average_price}`
                    + (gain != null ? ` (+₹${gain})` : '') + `, ${open.quantity} still running`);
                broadcast({ type: 'partial_exit', token, tradingsymbol, qty: quantity,
                    price: u.average_price, left: open.quantity, gain });
                return;
            }

            // record the closed trade BEFORE forgetting its entry price, its
            // tick history and the level it was being judged against
            const ctx = tradeCtxByToken.get(token);
            const level = breachLevelByToken.get(token);
            const reason = classifyExit(u, ctx);
            const rec = logClosedTrade({
                tradingsymbol,
                position: (positions.net || []).find(x => x.tradingsymbol == tradingsymbol),
                sellPrice: u.average_price,
                fallbackQty: quantity,
                token, reason, level, ctx
            });

            // a stop-style exit locks new entries: the click straight after a
            // stop-out is the one that doubles the damage
            if (STOP_REASONS.includes(reason)) {
                lockTrading(LOCKOUT_MIN, `${EXIT_LABELS[reason]} on ${tradingsymbol}`);
            }
            if (rec) {
                lastClosedTrade = rec;
                broadcast({ type: 'trade_closed', trade: rec, lock: lockInfo() });
            }

            tradeCtxByToken.delete(token);
            actualBuyPriceByToken.delete(token);
            breachLevelByToken.delete(token); // the next trade freezes its own level
            breachSymbolByToken.delete(token);
            trailByToken.delete(token);       // the next trade reads its own levels
            guardPositionByToken.delete(token);
            guardRestingByToken.delete(token);
            guardTokens.delete(token);
            writeGuardState();
            clearBreachOverride(token);

            const orders = await kiteRetry(() => kite.getOrders());
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
}

/*
Two guards on one account both place a target on the same buy -> duplicate
SELL -> margin rejection. The guard now lives here, so a leftover
simpleGuard/stopLossGuard/targetGuard pm2 process is a real hazard: say so
loudly at startup and keep saying it in /api/guard.
*/
const RIVAL_GUARDS = ['simpleGuard', 'stopLossGuard', 'targetGuard'];
let rivalGuardsOnline = [];
function checkRivalGuards() {
    require('child_process').exec('pm2 jlist', { timeout: 10000 }, (err, stdout) => {
        if (err) return;
        try {
            const list = JSON.parse(stdout.slice(stdout.indexOf('[')));
            rivalGuardsOnline = list
                .filter(p => RIVAL_GUARDS.includes(p.name) && p.pm2_env.status == 'online')
                .map(p => p.name);
            if (rivalGuardsOnline.length) {
                console.log(`🛑 DUPLICATE GUARD: ${rivalGuardsOnline.join(', ')} still running under pm2. ` +
                    `The guard is built into chartApp now -- run \`pm2 delete ${rivalGuardsOnline.join(' ')}\` ` +
                    `or both will place a SELL on the same fill (margin rejection).`);
            }
        } catch (e) { /* pm2 not available: nothing to warn about */ }
    });
}


async function main() {

    await connectToDatabase();
    const accessToken = await getTodaysAccessToken();
    console.log(accessToken, "accessToken");

    kite = await getKiteConnectInstance(accessToken);
    ticker = await getTickerInstance(accessToken);

    const all = await kite.getInstruments();
    for (const i of all) {
        lotSizeByToken.set(Number(i.instrument_token), i.lot_size);
        if ((i.exchange == "NFO" || i.exchange == "BFO") && (i.instrument_type == "CE" || i.instrument_type == "PE")) {
            optionInstruments.push(i);
            instByToken.set(Number(i.instrument_token), i);
        }
    }
    console.log(`Loaded ${optionInstruments.length} option instruments`);

    loadTriggers();

    initAlerts();
    setInterval(checkNakedPositions, 30000);

    ticker.connect();
    ticker.on("connect", () => {
        console.log("🟢 Ticker connected (chartApp)");
        subscribeCharted();
        subscribeTriggerTokens(); // restored triggers must fire even before anyone presses Load
        subscribeHeld();
        subscribeGuard();         // a subscribe sent while the socket was down is lost
    });
    ticker.on("ticks", ticks => {
        for (const t of ticks) {
            const tok = Number(t.instrument_token);
            lastLtpByToken.set(tok, t.last_price);
            pushSecTick(tok, t.last_price, t.volume_traded != null ? t.volume_traded : (t.volume || 0), t.oi || 0);
            checkSpotTriggers(tok, t.last_price);
            guardOnTick(tok, t.last_price);   // breach-level exit
            if (INDEX_SPOT_TOKENS.has(tok)) {
                pushSpotSample(tok, t.last_price);
                seedSpotSeries(tok).catch(() => { });   // once, then a no-op
            }
            checkOiSignal(tok, t.last_price, t.oi || 0).catch(e =>
                console.log('⚠️ OI signal check failed', e.message || e));
            checkSetups(tok, t.last_price).catch(e =>
                console.log('⚠️ setup scan failed', e.message || e));
        }
        if (wsClients.size == 0) return;
        const payload = JSON.stringify({
            type: "ticks",
            ticks: ticks.map(t => ({
                token: Number(t.instrument_token),
                ltp: t.last_price,
                ts: Date.now(),
                vol: t.volume_traded != null ? t.volume_traded : (t.volume || 0), // cumulative day volume
                oi: t.oi || 0
            }))
        });
        for (const c of wsClients) {
            if (c.readyState == 1) c.send(payload);
        }
    });
    ticker.on("order_update", u => {
        phoneAlertForOrder(u);
        const payload = JSON.stringify({ type: "order_update", status: u.status, tradingsymbol: u.tradingsymbol });
        for (const c of wsClients) if (c.readyState == 1) c.send(payload);
        guardOnOrderUpdate(u);   // a BUY fill arms the guard; a flattening SELL closes the trade
    });

    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'chartApp.html')));

    /*
    Relay for the page's own alerts (breakout/breakdown, short covering,
    OI crash, moving fast, dead chart, no resting SELL), so they reach the
    phone and not just the browser's beep. Text is capped; dedup is by key.
    */
    app.post('/api/phoneAlert', (req, res) => {
        const { title, body, key } = req.body || {};
        if (typeof title != 'string' || !title.trim()) return res.status(400).json({ error: 'title required' });
        alertPhone(title.slice(0, 120), String(body || '').slice(0, 300),
            { key: key ? String(key).slice(0, 120) : undefined });
        res.json({ ok: true });
    });

    // Fire a test alert at every registered phone: curl -X POST localhost:3456/api/testAlert
    app.post('/api/testAlert', async (req, res) => {
        await alertPhone('🔔 chartApp test', `Alerts reach this phone (${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })})`,
            { key: `test:${Date.now()}` });
        res.json({ ok: true });
    });

    /*
    Today's Zerodha login gate. The home app (server.js) owns the login
    flow; chartApp only reports whether a token for today is already in
    the DB, so the page can let you straight in or send you to /login.
    Date is recomputed per request -- do not reuse getTodaysAccessToken's
    module-level `today`, which goes stale once the process crosses midnight.
    */
    app.get('/api/authStatus', async (req, res) => {
        const date = new Date().toISOString().slice(0, 10);
        try {
            const doc = await AccessTokens.findOne({ date }, 'access_token user_id');
            res.json({ ok: !!(doc && doc.access_token), date, user_id: doc ? doc.user_id : null });
        } catch (e) {
            res.json({ ok: false, date, error: e.message });
        }
    });

    /*
    Everything the page needs to (re)build itself for one index+offset.
    Also points the tick stream at the three charted tokens.
    */
    app.get('/api/setup', async (req, res) => {
        try {
            const indexKey = (req.query.index || 'NIFTY').toUpperCase();
            const isAuto = (req.query.offset || '') == 'auto';
            const offset = isAuto ? 0 : (parseInt(req.query.offset || '0', 10) || 0);
            const idx = INDICES[indexKey];
            if (!idx) return res.status(400).json({ error: "index must be NIFTY or SENSEX" });

            const ltpData = await kite.getLTP([idx.spotKey]);
            const spot = ltpData[idx.spotKey].last_price;

            const yday = await yesterdayRange(idx.spotToken);
            let auto = null;
            let opts = resolveOptions(indexKey, spot, offset); // also gives nearest expiry for auto's D
            if (isAuto && opts) {
                auto = await autoStrikes(idx, spot, opts.expiry);
                opts = resolveOptions(indexKey, spot, 0, auto);
                console.log(`🎛 auto-strike ${indexKey}: spot ${spot}, IV ${auto.iv} (${auto.ivSource}), D ${auto.D}, dist ${auto.dist} → CE ${auto.ceStrike} / PE ${auto.peStrike}`);
            }
            if (!opts || !opts.ce || !opts.pe) {
                return res.status(500).json({ error: "could not resolve CE/PE instruments" });
            }

            /*
            How far out the auto pick actually landed, in strike steps from the
            ATM. Measured off the LOADED strike, not autoStrikes()'s ideal one:
            if that strike is not listed, resolveOptions snaps to the nearest
            one that is, and the honest answer is where the chart ended up.
            Positive = OTM (CE above the ATM, PE below it).
            */
            if (auto) {
                auto.atm = opts.atm;
                auto.step = idx.strikeStep;
                auto.ceSteps = Math.round((Number(opts.ce.strike) - opts.atm) / idx.strikeStep);
                auto.peSteps = Math.round((opts.atm - Number(opts.pe.strike)) / idx.strikeStep);
            }

            setChartedTokens([idx.spotToken, Number(opts.ce.instrument_token), Number(opts.pe.instrument_token)]);
            setRegimeToken(idx.spotToken);
            seedSpotSeries(regimeToken).catch(() => { });

            res.json({
                index: indexKey,
                spot: { token: idx.spotToken, ltp: spot, yday, inside: yday ? (spot <= yday.high && spot >= yday.low) : null },
                auto,
                atm: opts.atm,          // the ATM at Load; the chart recomputes it live from spot
                step: idx.strikeStep,   // so the chart can count strikes away without hardcoding it
                expiry: opts.expiry,
                ce: { token: Number(opts.ce.instrument_token), tradingsymbol: opts.ce.tradingsymbol, strike: Number(opts.ce.strike), exchange: opts.ce.exchange, lot_size: opts.ce.lot_size },
                pe: { token: Number(opts.pe.instrument_token), tradingsymbol: opts.pe.tradingsymbol, strike: Number(opts.pe.strike), exchange: opts.pe.exchange, lot_size: opts.pe.lot_size },
            });
        } catch (e) {
            console.log(e, "❌ /api/setup");
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    Re-register the tokens a page is charting, without re-running the strike
    pick. A server restart forgets chartedTokens, so an open browser would sit
    there with dead option charts until someone pressed Load; the page calls
    this on every websocket (re)connect instead.
    */
    app.post('/api/watch', (req, res) => {
        const tokens = (req.body && req.body.tokens || []).map(Number).filter(t => t > 0);
        if (tokens.length == 0) return res.status(400).json({ error: "tokens required" });
        setChartedTokens(tokens);
        console.log(`👀 re-watching ${tokens.join(', ')}`);
        res.json({ ok: true, tokens });
    });

    /*
    tf: 5s/15s/30s served from the live tick buffer (no Kite history below
    1min — sub-minute charts fill from when the token was first charted);
    1m/5m/15m from today via Kite; 1h last 10 days; day last 180 days.
    */
    app.get('/api/candles', async (req, res) => {
        try {
            const token = Number(req.query.token);
            const tf = req.query.tf || '1m';

            if (tf == '5s' || tf == '15s' || tf == '30s') {
                const n = parseInt(tf, 10);
                const base = secCandles.get(token) || [];
                if (n == SEC_BUCKET) return res.json(base);
                const out = [];
                for (const c of base) {
                    const t = Math.floor(c.time / n) * n;
                    const last = out[out.length - 1];
                    if (!last || t > last.time) {
                        out.push({ ...c, time: t });
                    } else {
                        last.high = Math.max(last.high, c.high);
                        last.low = Math.min(last.low, c.low);
                        last.close = c.close;
                        last.volume += c.volume || 0;
                        last.oi = c.oi || last.oi;
                    }
                }
                return res.json(out);
            }

            const KITE_TF = { '1m': 'minute', '5m': '5minute', '15m': '15minute', '1h': '60minute', 'day': 'day' };
            const interval = KITE_TF[tf] || 'minute';
            /*
            Intraday tfs show ONE session: today once the market has opened,
            otherwise the last trading day. Asking for "today from 09:00" only
            left the charts blank after midnight, before 09:15, on weekends and
            on holidays -- so look back a week and keep the latest date present.
            */
            const intraday = tf != 'day' && tf != '1h';
            const daysBack = tf == 'day' ? 180 : (tf == '1h' ? 10 : 7);
            const from = dayjs().subtract(daysBack, 'day').hour(9).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
            const to = dayjs().format('YYYY-MM-DD HH:mm:ss');
            let data;
            try {
                data = await kite.getHistoricalData(token, interval, from, to, false, true); // with OI (F&O)
            } catch (e) {
                data = await kite.getHistoricalData(token, interval, from, to); // index spot has no OI
            }
            if (intraday) data = lastSession(data);
            res.json(data.map(c => ({
                time: Math.floor(new Date(c.date).getTime() / 1000),
                open: c.open, high: c.high, low: c.low, close: c.close,
                volume: c.volume || 0, oi: c.oi || 0
            })));
        } catch (e) {
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    Positions + resting orders + P&L.
    - total: Kite's day P&L summed over all F&O positions (realised included)
    - per open long position: entry = last COMPLETE BUY fill of the day
      (NOT Kite's blended average_price), entryPnl = (ltp - entry) * qty
    */
    app.get('/api/position', async (req, res) => {
        try {
            const [positions, orders] = await kiteRetry(() =>
                Promise.all([kite.getPositions(), kite.getOrders()]));
            const fno = (positions.net || []).filter(p => p.exchange == "NFO" || p.exchange == "BFO");
            const totalPnl = fno.reduce((s, p) => s + (p.pnl || 0), 0);

            const open = fno.filter(p => p.quantity != 0);

            // keep every held instrument ticking, charted or not (live entry P&L)
            const before = heldTokens.size;
            heldTokens.clear();
            for (const p of open) heldTokens.add(Number(p.instrument_token));
            if (heldTokens.size && (heldTokens.size != before || [...heldTokens].some(t => !chartedTokens.includes(t)))) subscribeHeld();

            const out = [];
            for (const p of open) {
                const lastBuy = orders.filter(o =>
                    o.tradingsymbol == p.tradingsymbol && o.transaction_type == "BUY" &&
                    o.status == "COMPLETE" && o.average_price > 0
                ).pop();
                const entry = lastBuy ? lastBuy.average_price : p.average_price;
                const ltp = p.last_price;
                const resting = orders.filter(o =>
                    o.tradingsymbol == p.tradingsymbol && o.transaction_type == "SELL" &&
                    RESTING_ORDER_STATUSES.includes(o.status)
                ).map(o => ({
                    order_id: o.order_id, order_type: o.order_type, price: o.price,
                    trigger_price: o.trigger_price, quantity: o.quantity, status: o.status, tag: o.tag
                }));
                out.push({
                    tradingsymbol: p.tradingsymbol, exchange: p.exchange, token: Number(p.instrument_token),
                    quantity: p.quantity, entry, ltp,
                    // When that BUY filled -- the page anchors its OI-since-entry
                    // baseline here, so a reload does not re-baseline to "now".
                    // The SDK hands back a Date, so normalise to ISO rather than
                    // leaning on how JSON happens to serialise it.
                    entryAt: isoOrNull(lastBuy && lastBuy.order_timestamp),
                    entryPnl: (ltp - entry) * p.quantity,
                    dayPnl: p.pnl,
                    resting
                });
            }
            res.json({ totalPnl, positions: out });
        } catch (e) {
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    Emergency exit: dump long option positions NOW at a deep marketable
    LIMIT (ltp × 0.97 — Kite rejects plain MARKET). Resting SELLs are
    MODIFIED to that price (single-resting-order rule); any uncovered
    remainder gets fresh SELL chunks. Optional body.tradingsymbol exits
    just that one position; empty body exits everything.
    */
    app.post('/api/exit', async (req, res) => {
        try {
            const done = await exitAllLongs(req.body && req.body.tradingsymbol);
            if (done.length == 0) return res.json({ done: [], message: "no long positions to exit" });
            res.json({ done });
        } catch (e) {
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    Available cash, for the max-quantity-by-margin display. Long options
    are premium-paid: max qty = cash / premium, lot-aligned (client-side).
    */
    app.get('/api/margin', async (req, res) => {
        try {
            const m = await kite.getMargins();
            const cash = (m.equity && m.equity.available && m.equity.available.live_balance != null)
                ? m.equity.available.live_balance
                : (m.equity ? m.equity.net : 0);
            res.json({ cash });
        } catch (e) {
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    BUY entry from the chart: LIMIT at the clicked price. The built-in guard
    sees the fill via order_update and rests the target/SL automatically.
    */
    app.post('/api/buy', async (req, res) => {
        try {
            const { tradingsymbol, exchange, token, quantity, price, firstOrder } = req.body;
            const qty = parseInt(quantity, 10);
            const px = Number(price);
            if (!tradingsymbol || !exchange || !qty || qty <= 0 || !px || px <= 0) {
                return res.status(400).json({ error: "tradingsymbol, exchange, quantity, price required" });
            }
            if (entryBlocked(res, { premium: px, tradingsymbol })) return;   // the no-trade gate
            // before the BUY: the guard sees the fill the moment it lands
            if (['target', 'sl'].includes(firstOrder)) setFirstOrderOverride(token, firstOrder);
            const orderIds = await placeOrderInFreezeChunks(kite, {
                exchange,
                tradingsymbol,
                transaction_type: "BUY",
                quantity: qty,
                order_type: "LIMIT",
                price: roundToTick(px),
                product: "NRML",
                validity: "DAY",
                tag: "CHARTAPP"
            }, lotSizeByToken.get(Number(token)));
            const risk = await riskPreview({ price: roundToTick(px), quantity: qty, firstOrder, token });
            console.log(`🛒 chartApp BUY ${qty} ${tradingsymbol} LIMIT @ ${roundToTick(px)}: ${orderIds.join(',')}`
                + (risk.risk != null ? ` — risk ₹${risk.risk} (stop ${risk.stop})` : ` — NO stop: ₹${risk.premium} premium at risk`));
            res.json({ action: "placed", order_ids: orderIds, risk });
        } catch (e) {
            console.log(e, "❌ /api/buy");
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    Quick emergency buttons on each option chart: B100/B50 = BUY with that
    % of available margin at a marketable LIMIT (ltp×1.02). S100 = dump the
    whole position (same path as EXIT: resting SELL modified, never
    stacked). S50 = shrink THE resting SELL to half the position and make
    it marketable — the fill leaves the remainder briefly naked until
    the guard's safety net re-places its target (within 15s).
    */
    app.post('/api/quick', async (req, res) => {
        try {
            const { tradingsymbol, exchange, token, side, pct, firstOrder } = req.body;
            const p = Number(pct);
            if (!tradingsymbol || !exchange || !token || !['buy', 'sell'].includes(side) || ![50, 100].includes(p)) {
                return res.status(400).json({ error: "tradingsymbol, exchange, token, side buy|sell, pct 50|100 required" });
            }
            const lot = lotSizeByToken.get(Number(token)) || 1;
            let ltp = lastLtpByToken.get(Number(token));
            if (!ltp) {
                const key = `${exchange}:${tradingsymbol}`;
                const q = await kite.getLTP([key]);
                ltp = q[key] && q[key].last_price;
            }
            if (!(ltp > 0)) return res.status(400).json({ error: "no LTP for " + tradingsymbol });

            if (side == 'buy') {
                if (entryBlocked(res, { premium: ltp, tradingsymbol })) return;   // the no-trade gate
                const m = await kite.getMargins();
                const cash = (m.equity && m.equity.available && m.equity.available.live_balance != null)
                    ? m.equity.available.live_balance : (m.equity ? m.equity.net : 0);
                const price = roundToTick(ltp * 1.02);
                const qty = Math.floor((cash * p / 100) / price / lot) * lot;
                if (qty < lot) return res.status(400).json({ error: `margin too low for 1 lot (cash ${Math.round(cash)}, lot ~${Math.round(price * lot)})` });
                if (['target', 'sl'].includes(firstOrder)) setFirstOrderOverride(token, firstOrder);
                const ids = await placeOrderInFreezeChunks(kite, {
                    exchange, tradingsymbol, transaction_type: "BUY", quantity: qty,
                    order_type: "LIMIT", price, product: "NRML", validity: "DAY", tag: "QUICKB"
                }, lot);
                const risk = await riskPreview({ price, quantity: qty, firstOrder, token });
                console.log(`⚡ QUICK B${p}: BUY ${qty} ${tradingsymbol} @ ${price} → ${ids.join(',')}`
                    + (risk.risk != null ? ` — risk ₹${risk.risk} (stop ${risk.stop})` : ` — NO stop: ₹${risk.premium} premium at risk`));
                return res.json({ side, pct: p, qty, price, order_ids: ids, risk });
            }

            if (p == 100) {
                const done = await exitAllLongs(tradingsymbol, 'quick_sell');
                if (done.length == 0) return res.status(400).json({ error: `no long position in ${tradingsymbol}` });
                return res.json({ side, pct: p, qty: done[0].quantity, price: done[0].price, order_ids: done[0].order_ids });
            }

            // S50: sell half the position at a marketable LIMIT
            const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
            const pos = (positions.net || []).find(x => x.tradingsymbol == tradingsymbol && x.quantity > 0);
            if (!pos) return res.status(400).json({ error: `no long position in ${tradingsymbol}` });
            noteExitReason(Number(token), 'quick_sell', `S${p} on ${tradingsymbol}`);
            const price = roundToTick((pos.last_price || ltp) * 0.97);
            const resting = orders.filter(o =>
                o.tradingsymbol == tradingsymbol && o.transaction_type == "SELL" &&
                RESTING_ORDER_STATUSES.includes(o.status));
            let qty = Math.round(pos.quantity * p / 100 / lot) * lot;
            qty = Math.min(Math.max(qty, lot), pos.quantity);
            let ids = [];
            if (resting.length) {
                // total resting must never exceed the position (naked-short margin check)
                const othersQty = resting.slice(1).reduce((s, o) => s + (o.quantity - (o.filled_quantity || 0)), 0);
                qty = Math.min(qty, pos.quantity - othersQty);
                if (qty < lot) return res.status(400).json({ error: "position too small to split a sell from the resting chunks" });
                await kite.modifyOrder("regular", resting[0].order_id, { quantity: qty, order_type: "LIMIT", price, trigger_price: 0 });
                ids = [resting[0].order_id];
            } else {
                ids = await placeOrderInFreezeChunks(kite, {
                    exchange, tradingsymbol, transaction_type: "SELL", quantity: qty,
                    order_type: "LIMIT", price, product: pos.product || "NRML", validity: "DAY", tag: "QUICKS"
                }, lot);
            }
            console.log(`⚡ QUICK S${p}: SELL ${qty}/${pos.quantity} ${tradingsymbol} @ ${price} → ${ids.join(',')}`);
            res.json({ side, pct: p, qty, price, order_ids: ids });
        } catch (e) {
            console.log(e, "❌ /api/quick");
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    /*
    The built-in guard's on-fill behavior (guardSettings.json): which SELL
    it places first on a BUY fill — target LIMIT or SL — and the %s. The
    guard re-reads the file at every placement, so a change applies to the
    next fill with no restart.
    */
    app.get('/api/guardSettings', (req, res) => res.json(readGuardSettings()));
    app.post('/api/guardSettings', (req, res) => {
        const { firstOrder, targetPct, slPct } = req.body || {};
        const s = readGuardSettings();
        if (firstOrder != null) {
            if (!['target', 'sl'].includes(firstOrder)) return res.status(400).json({ error: "firstOrder must be 'target' or 'sl'" });
            s.firstOrder = firstOrder;
        }
        if (targetPct != null) {
            const v = Number(targetPct);
            if (!(v > 0 && v <= 50)) return res.status(400).json({ error: "targetPct must be 0–50" });
            s.targetPct = v;
        }
        if (slPct != null) {
            const v = Number(slPct);
            if (!(v > 0 && v <= 50)) return res.status(400).json({ error: "slPct must be 0–50" });
            s.slPct = v;
        }
        const { partialPct, trail, slMode, slMaxPct, levelGapPct, levelMaxPct } = req.body || {};
        if (partialPct != null) {
            const v = Number(partialPct);
            if (!(v >= 0 && v < 100)) return res.status(400).json({ error: "partialPct must be 0–99" });
            s.partialPct = v;
        }
        if (trail != null) s.trail = !!trail;
        if (req.body && req.body.partialMode != null) {
            if (!['app', 'exchange'].includes(req.body.partialMode)) return res.status(400).json({ error: "partialMode must be 'app' or 'exchange'" });
            s.partialMode = req.body.partialMode;
        }
        if (slMode != null) {
            if (!['level', 'pct'].includes(slMode)) return res.status(400).json({ error: "slMode must be 'level' or 'pct'" });
            s.slMode = slMode;
        }
        if (slMaxPct != null) {
            const v = Number(slMaxPct);
            if (!(v >= s.slPct && v <= 50)) return res.status(400).json({ error: `slMaxPct must be ${s.slPct}–50` });
            s.slMaxPct = v;
        }
        if (levelGapPct != null) {
            const v = Number(levelGapPct);
            if (!(v >= 0 && v <= 50)) return res.status(400).json({ error: "levelGapPct must be 0–50" });
            s.levelGapPct = v;
        }
        if (levelMaxPct != null) {
            const v = Number(levelMaxPct);
            if (!(v > 0 && v <= 300)) return res.status(400).json({ error: "levelMaxPct must be 0–300" });
            s.levelMaxPct = v;
        }
        try { fs.writeFileSync(GUARD_SETTINGS_FILE, JSON.stringify(s, null, 2)); }
        catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        console.log(`⚙️ guardSettings: on fill → ${s.firstOrder}, stop ${s.slMode == 'level' ? `at the support (${s.slPct}–${s.slMaxPct}%)` : `${s.slPct}% flat`}`
            + `, partial ${s.partialPct}% at the resistance (${s.partialMode == 'app' ? 'app-side, stop covers the full lot' : 'resting LIMIT, stop covers the remainder only'})`
            + `, trail ${s.trail ? 'on' : 'off'}`);
        res.json(s);
    });

    /*
    The guard's breach level ("proposed SL") per token, for the orange guard
    line on the chart. Served straight from the guard's live state — same
    process now — and a dragged line is applied to the guard IMMEDIATELY
    (it used to wait up to one 15s refresh). Still persisted to
    breachOverride.json so a restart mid-trade keeps the dragged level
    instead of re-freezing it.
    */
    app.get('/api/breach', (req, res) => {
        const levels = {};
        for (const [t, lvl] of breachLevelByToken) {
            levels[t] = { level: lvl, tradingsymbol: breachSymbolByToken.get(t) || '' };
        }
        res.json({ levels });
    });
    app.post('/api/breach', (req, res) => {
        const token = Number(req.body && req.body.token), level = Number(req.body && req.body.level);
        if (!(token > 0) || !(level > 0)) return res.status(400).json({ error: "token and level required" });
        const lvl = +roundToTick(level).toFixed(2);
        let ov = {};
        try { ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8')); } catch (e) { }
        ov[token] = lvl;
        try { fs.writeFileSync(BREACH_OVERRIDE_FILE, JSON.stringify(ov, null, 2)); }
        catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        // live effect, not on the next refresh: the next tick is checked against it
        breachLevelByToken.set(token, lvl);
        writeGuardState();
        console.log(`✏️ breach level for ${breachSymbolByToken.get(token) || token} → ${lvl} (live)`);
        res.json({ token, level: lvl, applied: true });
    });

    /*
    P&L history from tradeLog.json (the guard appends one record per closed
    trade): today's trades, per-symbol totals today, per-day totals.
    */
    app.get('/api/pnl', (req, res) => {
        let log = [];
        try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
        const today = dayjs().format('YYYY-MM-DD');
        const byDay = {};
        for (const t of log) {
            if (!byDay[t.date]) byDay[t.date] = { date: t.date, pnl: 0, trades: 0 };
            byDay[t.date].pnl += t.pnl || 0;
            byDay[t.date].trades++;
        }
        const todays = log.filter(t => t.date == today);
        const bySymbol = {};
        for (const t of todays) bySymbol[t.tradingsymbol] = (bySymbol[t.tradingsymbol] || 0) + (t.pnl || 0);
        res.json({
            today: todays,
            todayTotal: todays.reduce((s, t) => s + (t.pnl || 0), 0),
            bySymbol,
            days: Object.values(byDay).sort((a, b) => a.date < b.date ? 1 : -1),
            lock: lockInfo(),
            lastTrade: lastClosedTrade || (todays.length ? todays[todays.length - 1] : null)
        });
    });

    /*
    The full-page review the page throws up after every close: the trade
    itself (with its verdict) plus the day's trades and totals, so one
    request paints the whole thing. ?trade=last replays the last one.
    */
    app.get('/api/review', (req, res) => {
        let log = [];
        try { log = JSON.parse(fs.readFileSync(TRADE_LOG_FILE, 'utf8')); } catch (e) { }
        const today = dayjs().format('YYYY-MM-DD');
        const todays = log.filter(t => t.date == today);
        const trade = lastClosedTrade || (todays.length ? todays[todays.length - 1] : null);
        const bySymbol = {};
        for (const t of todays) bySymbol[t.tradingsymbol] = (bySymbol[t.tradingsymbol] || 0) + (t.pnl || 0);
        res.json({
            trade,
            today: todays,
            todayTotal: todays.reduce((s, t) => s + (t.pnl || 0), 0),
            bySymbol,
            wins: todays.filter(t => (t.pnl || 0) > 0).length,
            losses: todays.filter(t => (t.pnl || 0) < 0).length,
            lock: lockInfo()
        });
    });

    /*
    The lockout. GET to poll it; POST {action:'clear'} to override it by
    hand (logged, because overriding it is the mistake it exists to stop),
    POST {minutes:n} to lock yourself out deliberately.
    */
    /*
    The no-trade checklist, as the page paints it on load: every rule with
    pass/fail and the number behind it. Optional ?premium= &tradingsymbol=
    also evaluate the two instrument-specific rules for what you are about
    to buy.
    */
    app.get('/api/regime', (req, res) => res.json(spotRegime()));

    /*
    Setup alerts: today's fires newest first, plus the live settings. Alert
    only -- there is no buy route for these on purpose.
    */
    app.get('/api/setupAlerts', (req, res) => {
        const today = dayjs().format('YYYY-MM-DD');
        const rows = readSetupLog().filter(r => !req.query.today || r.date == today);
        res.json({ settings: readSetupCfg(), fires: rows.length, alerts: rows.slice(-40).reverse() });
    });

    app.post('/api/setupAlerts', (req, res) => {
        const cur = readSetupCfg(), next = { ...cur };
        const RANGE = { cooldownMin: [0, 240], minRR: [0, 10], minTouches: [1, 5],
                        breakClearPct: [0, 5], wickPct: [0, 5] };
        for (const k of Object.keys(SETUP_DEFAULTS)) {
            if (!(k in req.body)) continue;
            if (typeof SETUP_DEFAULTS[k] == 'boolean') { next[k] = !!req.body[k]; continue; }
            const v = Number(req.body[k]);
            if (!Number.isFinite(v)) return res.status(400).json({ error: `${k} must be a number` });
            const [lo, hi] = RANGE[k] || [-Infinity, Infinity];
            if (v < lo || v > hi) return res.status(400).json({ error: `${k} must be ${lo}-${hi}` });
            next[k] = v;
        }
        try { fs.writeFileSync(SETUP_FILE, JSON.stringify(next, null, 2)); }
        catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        console.log(`🔔 setup alerts: ${next.enabled ? 'on' : 'off'}, min ${next.minRR}R, `
            + `cooldown ${next.cooldownMin}m, ≥${next.minTouches} touches`);
        res.json(next);
    });

    app.get('/api/noTrade', (req, res) => {
        const premium = req.query.premium != null ? Number(req.query.premium) : undefined;
        res.json(noTradeChecks({ premium, tradingsymbol: req.query.tradingsymbol }));
    });

    /*
    Tune the thresholds (noTrade.json). Every key is optional; what you send
    is merged over the current file and applies to the very next check -- no
    restart. Deliberately permissive about values: they are your rules, the
    point is only that they exist and are enforced.
    */
    app.post('/api/noTrade', (req, res) => {
        const s = readNoTrade();
        const body = req.body || {};
        for (const k of Object.keys(NO_TRADE_DEFAULTS)) {
            if (body[k] == null) continue;
            if (typeof NO_TRADE_DEFAULTS[k] == 'boolean') s[k] = !!body[k];
            else if (typeof NO_TRADE_DEFAULTS[k] == 'number') {
                const v = Number(body[k]);
                if (!isFinite(v) || v < 0) return res.status(400).json({ error: `${k} must be a number ≥ 0` });
                s[k] = v;
            } else {
                if (hhmmToMin(body[k]) == null) return res.status(400).json({ error: `${k} must be HH:MM` });
                s[k] = String(body[k]).trim();
            }
        }
        writeNoTrade(s);
        console.log('⛔ no-trade rules updated:', JSON.stringify(s));
        res.json(noTradeChecks());
    });

    /*
    Date-wise trade analysis: one abstract per day saying what went wrong
    and why, the lessons ranked by what they cost, and the across-days view
    of which mistake repeats. Reads tradeLog.json only -- safe to hit any
    time, including while a position is open.
    */
    app.get('/api/analysis', (req, res) => {
        try { res.json(analyseAll()); }
        catch (e) { res.status(500).json({ error: String(e.message || e) }); }
    });

    app.get('/api/lock', (req, res) => res.json(lockInfo()));

    // OI short-covering signal: settings, the log, and whether it actually pays
    app.get('/api/oiSignals', (req, res) => res.json(readOiCfg()));
    app.post('/api/oiSignals', (req, res) => {
        const body = req.body || {};
        const s = readOiCfg();
        const num = { lookMin: [1, 60], oiDropPct: [0.1, 50], pxUpPct: [0.1, 50],
                      cooldownMin: [0, 240], minRR: [0, 10], quantity: [0, 10000] };
        for (const k of Object.keys(OI_DEFAULTS)) {
            if (!(k in body)) continue;
            if (k == 'enabled' || k == 'autoBuy') { s[k] = !!body[k]; continue; }
            const v = Number(body[k]);
            const [lo, hi] = num[k];
            if (!(v >= lo && v <= hi)) return res.status(400).json({ error: `${k} must be ${lo}-${hi}` });
            s[k] = v;
        }
        writeOiCfg(s);
        console.log(`📉 OI signal settings: ${s.enabled ? 'on' : 'off'}, autoBuy ${s.autoBuy ? 'ON — real orders' : 'off (alert only)'}, `
            + `OI ≤ -${s.oiDropPct}% with price ≥ +${s.pxUpPct}% over ${s.lookMin}m, cooldown ${s.cooldownMin}m, min ${s.minRR}R, qty ${s.quantity || 'one lot'}`);
        res.json(s);
    });
    /*
    The point of the log: answer "does OI-drop-and-price-up pay?" from this
    account's own fires rather than from one day of backtest. Grouped by
    horizon because a signal can be right at +10 minutes and wrong at +30.
    */
    app.get('/api/oiLog', (req, res) => {
        const rows = readOiLog();
        const date = req.query.date;
        const use = date ? rows.filter(r => r.date == date) : rows;
        const stats = {};
        for (const h of [5, 10, 15, 30]) {
            const v = use.map(r => r['fwd' + h + 'Pct']).filter(x => x != null);
            stats['h' + h] = v.length ? {
                n: v.length,
                avgPct: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2),
                winPct: +((v.filter(x => x > 0).length / v.length) * 100).toFixed(0)
            } : { n: 0, avgPct: null, winPct: null };
        }
        res.json({
            rows: use.slice(-200).reverse(),
            fires: use.length,
            taken: use.filter(r => r.bought).length,
            skipped: use.filter(r => r.skipped).length,
            avgRR: (() => { const v = use.map(r => r.rr).filter(x => x != null);
                return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : null; })(),
            stats, settings: readOiCfg()
        });
    });

    // "is anything open right now with no resting SELL?"
    app.get('/api/unprotected', (req, res) => res.json({ list: unprotectedList() }));

    /*
    The level ladder per open position: what is resting at the resistance,
    where the stop is now, and every step it has already taken. The chart
    draws these, so "the stop moved" is visible rather than inferred.
    */
    app.get('/api/levels', async (req, res) => {
        const token = Number(req.query.token);
        if (token > 0 && !trailByToken.has(token)) {
            // not in a trade on this token: show the levels as they stand now
            try {
                const lv = await computeLevels(token);
                const s = readGuardSettings();
                const px = Number(req.query.price) || null;
                const r = px ? pickResistance(lv, px, s, null) : null;
                const st = px ? plannedStop(px, lv, s) : null;
                return res.json({ token, live: false, levels: lv,
                    resistance: r, support: px ? pickSupport(lv, px) : null,
                    plannedStop: st,
                    rr: (r && st && st.stop < px) ? +((r.price - px) / (px - st.stop)).toFixed(2) : null });
            } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        }
        if (token > 0) return res.json({ token, live: true, ...trailInfo(token) });
        res.json({ live: true, positions: [...trailByToken.keys()].map(t => trailInfo(t)) });
    });

    // risk preview for a prospective entry: ?price=&quantity=[&firstOrder=]
    app.get('/api/risk', async (req, res) => {
        const price = Number(req.query.price), quantity = parseInt(req.query.quantity, 10);
        if (!(price > 0) || !(quantity > 0)) return res.status(400).json({ error: 'price and quantity required' });
        try {
            res.json(await riskPreview({ price, quantity, firstOrder: req.query.firstOrder, token: req.query.token }));
        } catch (e) { res.status(500).json({ error: String(e.message || e) }); }
    });
    app.post('/api/lock', (req, res) => {
        const { action, minutes, why } = req.body || {};
        if (action == 'clear') {
            unlockTrading('dashboard');
            return res.json(lockInfo());
        }
        const m = Number(minutes) || LOCKOUT_MIN;
        if (!(m > 0 && m <= 240)) return res.status(400).json({ error: "minutes must be 1-240" });
        lockTrading(m, why || 'locked by hand');
        res.json(lockInfo());
    });

    /*
    Guard status for the dashboard header. The guard is part of this process
    now, so it is online whenever the page can reach this endpoint at all --
    what is worth reporting is how many positions it is watching, and whether
    an old standalone guard is still running and would double up on the next
    fill.
    */
    app.get('/api/guard', (req, res) => {
        const watching = [...guardPositionByToken.keys()].map(t => ({
            token: t,
            tradingsymbol: breachSymbolByToken.get(t) || '',
            level: breachLevelByToken.get(t) != null ? breachLevelByToken.get(t) : null,
            resting: (guardRestingByToken.get(t) || []).length
        }));
        res.json({
            builtIn: true,
            simpleGuard: { status: 'online', builtIn: true, restarts: 0, since: guardStartedAt },
            watching,
            settings: readGuardSettings(),
            duplicates: rivalGuardsOnline   // non-empty = a rival guard process is still up
        });
    });

    /*
    Spot-level conditional BUY/SELL triggers.
    */
    app.get('/api/triggers', (req, res) => res.json({ triggers: spotTriggers }));

    app.post('/api/trigger', (req, res) => {
        const { direction, level, tradingsymbol, exchange, token, quantity, index, action, watch, firstOrder } = req.body;
        const act = action || 'buy';
        const wat = watch == 'option' ? 'option' : 'spot';   // default keeps the old spot behaviour
        // only a BUY produces a fill, so only a BUY can say what to rest on it
        const fo = act == 'buy' && ['target', 'sl'].includes(firstOrder) ? firstOrder : null;
        const lvl = Number(level), qty = parseInt(quantity, 10) || 0;
        const idx = INDICES[index];
        if (!['above', 'below'].includes(direction) || !['buy', 'sell', 'exitall'].includes(act) || !lvl || !idx) {
            return res.status(400).json({ error: "index, action, direction, level required" });
        }
        // 'exitall' needs no instrument — it dumps every long at fire time
        if (act != 'exitall' && (!tradingsymbol || !exchange || !token)) {
            return res.status(400).json({ error: "tradingsymbol, exchange, token required" });
        }
        if (act == 'buy' && qty <= 0) return res.status(400).json({ error: "quantity required for buy trigger" });
        // arming a BUY is an entry decision too -- gated now and again at fire time
        if (act == 'buy' && entryBlocked(res, { premium: wat == 'option' ? lvl : undefined, tradingsymbol })) return;
        // 'exitall' spans every long, so there is no single option price to watch
        if (wat == 'option' && act == 'exitall') {
            return res.status(400).json({ error: "exitall can only be watched on the spot" });
        }
        const trig = {
            id: trigSeq++, index, spotToken: idx.spotToken, action: act, direction, level: lvl,
            watch: wat,
            watchToken: wat == 'option' ? Number(token) : Number(idx.spotToken),
            tradingsymbol: act == 'exitall' ? 'ALL LONGS' : tradingsymbol,
            exchange: act == 'exitall' ? '' : exchange,
            token: act == 'exitall' ? 0 : Number(token),
            quantity: qty, // sell/exitall use live position qty at fire time
            firstOrder: fo, // null = whatever guardSettings.json says at fill time
            created: new Date().toISOString()
        };
        spotTriggers.push(trig);
        saveTriggers();
        subscribeTriggerTokens();
        const onWhat = wat == 'option' ? `${trig.tradingsymbol} price` : `${index} spot`;
        console.log(`🎯 trigger #${trig.id}: ${act.toUpperCase()} ${act == 'buy' ? qty + ' ' : ''}${trig.tradingsymbol} if ${onWhat} ${direction} ${lvl}` +
            (fo ? ` → ${fo.toUpperCase()} first on fill` : ''));
        res.json({ id: trig.id, trigger: trig });
    });

    app.delete('/api/trigger/:id', (req, res) => {
        const id = Number(req.params.id);
        const before = spotTriggers.length;
        spotTriggers = spotTriggers.filter(t => t.id != id);
        if (before != spotTriggers.length) { saveTriggers(); console.log(`🗑 trigger #${id} cancelled`); }
        res.json({ removed: before - spotTriggers.length });
    });

    /*
    Place or modify THE resting SELL order for a symbol.
    mode 'target' -> SELL LIMIT at price
    mode 'sl'     -> SELL SL with trigger_price (+ limit price, default 1% under trigger)
    If a resting SELL already exists it is MODIFIED (never a second order).
    */
    app.post('/api/order', async (req, res) => {
        try {
            const { tradingsymbol, exchange, mode, price, trigger_price } = req.body;
            if (!tradingsymbol || !mode) return res.status(400).json({ error: "tradingsymbol and mode required" });

            const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
            const pos = (positions.net || []).find(p => p.tradingsymbol == tradingsymbol && p.quantity > 0);
            if (!pos) return res.status(400).json({ error: `no open long position in ${tradingsymbol}` });

            const resting = orders.filter(o =>
                o.tradingsymbol == tradingsymbol && o.transaction_type == "SELL" &&
                RESTING_ORDER_STATUSES.includes(o.status)
            );

            let params;
            if (mode == 'target') {
                if (!price) return res.status(400).json({ error: "price required for target" });
                params = { order_type: "LIMIT", price: roundToTick(Number(price)), trigger_price: 0 };
            } else if (mode == 'sl') {
                if (!trigger_price) return res.status(400).json({ error: "trigger_price required for sl" });
                const trig = roundToTick(Number(trigger_price));
                const lim = roundToTick(price ? Number(price) : trig * 0.99);
                params = { order_type: "SL", trigger_price: trig, price: lim };
            } else {
                return res.status(400).json({ error: "mode must be target or sl" });
            }

            if (resting.length > 0) {
                const results = [];
                for (const o of resting) {
                    await kite.modifyOrder("regular", o.order_id, params);
                    results.push(o.order_id);
                }
                console.log(`✏️ chartApp modified ${results.join(',')} for ${tradingsymbol} -> ${mode} ${JSON.stringify(params)}`);
                return res.json({ action: "modified", order_ids: results, params });
            }

            const orderIds = await placeOrderInFreezeChunks(kite, {
                exchange: exchange || pos.exchange,
                tradingsymbol,
                transaction_type: "SELL",
                quantity: Math.abs(pos.quantity),
                product: "NRML",
                validity: "DAY",
                tag: "CHARTAPP",
                ...params
            }, lotSizeByToken.get(Number(pos.instrument_token)));

            console.log(`🆕 chartApp placed ${mode} for ${tradingsymbol}: ${orderIds.join(',')}`);
            res.json({ action: "placed", order_ids: orderIds, params });

        } catch (e) {
            console.log(e, "❌ /api/order");
            res.status(500).json({ error: String(e.message || e) });
        }
    });

    // the guard: warm immediately, then refresh positions/orders/levels on a timer
    checkRivalGuards();
    setInterval(() => {
        // ticks are the normal feed; seeding here too covers a restart with a
        // quiet socket, which would otherwise leave the readout blank all day
        const t = activeSpotToken();
        if (t) seedSpotSeries(t).catch(() => { });
        broadcast({ type: 'regime', regime: spotRegime() });
    }, 30000);

    setInterval(checkRivalGuards, 60000);
    loadLock();
    guardRefresh();
    setInterval(guardRefresh, GUARD_REFRESH_MS);
    console.log(`🛡 built-in guard armed (refresh ${GUARD_REFRESH_MS / 1000}s, breach = ${CANDLE_COUNT}-candle low, on fill → ${readGuardSettings().firstOrder})`);

    const server = app.listen(PORT, () => console.log(`🌐 chartApp on http://localhost:${PORT}`));

    const wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', ws => {
        wsClients.add(ws);
        ws.on('close', () => wsClients.delete(ws));
    });
}

main();
