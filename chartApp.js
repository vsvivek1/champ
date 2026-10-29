
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

Runs standalone on PORT below. Does not touch server.js / simpleGuard.js.

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

function roundToTick(v) { return Math.round(v / TICK) * TICK; }

let kite, ticker;
let optionInstruments = [];          // NFO + BFO option master
const lotSizeByToken = new Map();

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
async function exitAllLongs(only) {
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
        console.log(`🚨 EXIT ${p.tradingsymbol}: ${p.quantity} qty @ ${price} → ${ids.join(',')}`);
        done.push({ tradingsymbol: p.tradingsymbol, quantity: p.quantity, price, order_ids: ids });
    }
    return done;
}

/*
Per-entry "what to place on this fill" override, keyed by instrument token.
simpleGuard normally reads guardSettings.json, which is one global choice for
every fill. This file lets a single entry say "SL first" without flipping that
global and having to remember to flip it back. Written just BEFORE the BUY
goes out, so it is already on disk when simpleGuard sees the fill; simpleGuard
consumes and deletes the entry, so it applies to exactly one fill.

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
            const done = await exitAllLongs(null);
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
            const price = roundToTick(optLtp * 1.02); // marketable LIMIT
            // must be on disk before the BUY, or simpleGuard may reach the fill first
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
    });
    ticker.on("ticks", ticks => {
        for (const t of ticks) {
            const tok = Number(t.instrument_token);
            lastLtpByToken.set(tok, t.last_price);
            pushSecTick(tok, t.last_price, t.volume_traded != null ? t.volume_traded : (t.volume || 0), t.oi || 0);
            checkSpotTriggers(tok, t.last_price);
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
    });

    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'chartApp.html')));

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
            const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
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
    BUY entry from the chart: LIMIT at the clicked price. simpleGuard sees
    the fill via order_update and places the 2% target automatically.
    */
    app.post('/api/buy', async (req, res) => {
        try {
            const { tradingsymbol, exchange, token, quantity, price, firstOrder } = req.body;
            const qty = parseInt(quantity, 10);
            const px = Number(price);
            if (!tradingsymbol || !exchange || !qty || qty <= 0 || !px || px <= 0) {
                return res.status(400).json({ error: "tradingsymbol, exchange, quantity, price required" });
            }
            // before the BUY: simpleGuard may reach the fill the moment it lands
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
            console.log(`🛒 chartApp BUY ${qty} ${tradingsymbol} LIMIT @ ${roundToTick(px)}: ${orderIds.join(',')}`);
            res.json({ action: "placed", order_ids: orderIds });
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
    simpleGuard's safety net re-places its target (within 15s).
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
                console.log(`⚡ QUICK B${p}: BUY ${qty} ${tradingsymbol} @ ${price} → ${ids.join(',')}`);
                return res.json({ side, pct: p, qty, price, order_ids: ids });
            }

            if (p == 100) {
                const done = await exitAllLongs(tradingsymbol);
                if (done.length == 0) return res.status(400).json({ error: `no long position in ${tradingsymbol}` });
                return res.json({ side, pct: p, qty: done[0].quantity, price: done[0].price, order_ids: done[0].order_ids });
            }

            // S50: sell half the position at a marketable LIMIT
            const [positions, orders] = await Promise.all([kite.getPositions(), kite.getOrders()]);
            const pos = (positions.net || []).find(x => x.tradingsymbol == tradingsymbol && x.quantity > 0);
            if (!pos) return res.status(400).json({ error: `no long position in ${tradingsymbol}` });
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
    simpleGuard's on-fill behavior (guardSettings.json): which SELL it
    places first on a BUY fill — target LIMIT or SL — and the %s.
    simpleGuard re-reads the file at every placement, no restart needed.
    */
    const GUARD_SETTINGS_FILE = path.join(__dirname, 'guardSettings.json');
    const GUARD_DEFAULTS = { firstOrder: 'target', targetPct: 2, slPct: 2 };
    function readGuardSettings() {
        try { return { ...GUARD_DEFAULTS, ...JSON.parse(fs.readFileSync(GUARD_SETTINGS_FILE, 'utf8')) }; }
        catch (e) { return { ...GUARD_DEFAULTS }; }
    }
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
        try { fs.writeFileSync(GUARD_SETTINGS_FILE, JSON.stringify(s, null, 2)); }
        catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        console.log(`⚙️ guardSettings: on fill → ${s.firstOrder} (tgt ${s.targetPct}%, sl ${s.slPct}%)`);
        res.json(s);
    });

    /*
    simpleGuard's breach level ("proposed SL") per token, for the orange
    guard line on the chart. guardState.json is written by simpleGuard;
    breachOverride.json is written here when the line is dragged and
    picked up by simpleGuard within one 15s refresh. GET overlays the
    pending override so the dragged line sticks immediately.
    */
    const GUARD_STATE_FILE = path.join(__dirname, 'guardState.json');
    const BREACH_OVERRIDE_FILE = path.join(__dirname, 'breachOverride.json');
    app.get('/api/breach', (req, res) => {
        let levels = {};
        try { levels = JSON.parse(fs.readFileSync(GUARD_STATE_FILE, 'utf8')).levels || {}; } catch (e) { }
        try {
            const ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8'));
            for (const [t, lvl] of Object.entries(ov)) {
                if (levels[t] && Number(lvl) > 0) {
                    levels[t] = { ...levels[t], level: Number(lvl), pending: levels[t].level != Number(lvl) };
                }
            }
        } catch (e) { }
        res.json({ levels });
    });
    app.post('/api/breach', (req, res) => {
        const token = Number(req.body && req.body.token), level = Number(req.body && req.body.level);
        if (!(token > 0) || !(level > 0)) return res.status(400).json({ error: "token and level required" });
        let ov = {};
        try { ov = JSON.parse(fs.readFileSync(BREACH_OVERRIDE_FILE, 'utf8')); } catch (e) { }
        ov[token] = +roundToTick(level).toFixed(2);
        try { fs.writeFileSync(BREACH_OVERRIDE_FILE, JSON.stringify(ov, null, 2)); }
        catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
        console.log(`✏️ breach override for token ${token} → ${ov[token]} (simpleGuard applies within 15s)`);
        res.json({ token, level: ov[token] });
    });

    /*
    P&L history from tradeLog.json (simpleGuard appends one record per
    closed trade): today's trades, per-symbol totals today, per-day totals.
    */
    const TRADE_LOG_FILE = path.join(__dirname, 'tradeLog.json');
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
            days: Object.values(byDay).sort((a, b) => a.date < b.date ? 1 : -1)
        });
    });

    // pm2 status of the guard processes, for the dashboard header
    app.get('/api/guard', (req, res) => {
        require('child_process').exec('pm2 jlist', { timeout: 10000 }, (err, stdout) => {
            if (err) return res.json({ error: String(err.message || err) });
            try {
                const list = JSON.parse(stdout.slice(stdout.indexOf('[')));
                const pick = n => {
                    const p = list.find(x => x.name == n);
                    return p ? { status: p.pm2_env.status, restarts: p.pm2_env.restart_time, since: p.pm2_env.pm_uptime } : { status: 'missing' };
                };
                res.json({ simpleGuard: pick('simpleGuard'), stopLossGuard: pick('stopLossGuard'), targetGuard: pick('targetGuard') });
            } catch (e) { res.json({ error: String(e.message || e) }); }
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

    const server = app.listen(PORT, () => console.log(`🌐 chartApp on http://localhost:${PORT}`));

    const wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', ws => {
        wsClients.add(ws);
        ws.on('close', () => wsClients.delete(ws));
    });
}

main();
