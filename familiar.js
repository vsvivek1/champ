/*
"Have I done this before, and did it pay?"

WHY

The app could tell you a setup was standing. It could not tell you that
you had taken the same shape nine times already and lost money on six of
them. Those are different questions and only the second one stops a
click.

The numbers that started this file, from tradeLog.json as it stands on
06/11/2026, all 157 closed trades priced through charges.js:

    gross green   87 of 157   (55%)   total  -18,187
    net   green   81 of 157   (52%)   total  -27,795
    charges                            9,608

So the strike rate is a coin toss and the account is down, which means
the edge is not in picking more setups -- it is in not taking the ones
that have never worked. That is what this module is for.

TWO LAYERS, AND THEY ARE NOT EQUALLY GOOD

  trades  Real money. Every closed trade in tradeLog.json, with the
          charges taken out, grouped by the things a live setup also
          knows about itself: index, CE or PE, how expensive the option
          is, and the time of day. 157 rows, every one of them labelled
          by what actually happened. This is the layer that can speak
          today.

  shapes  The setup's own shape -- bounce or break, how far the stop
          sits, the R, the touches, the regime -- matched against past
          setups that now carry fwd5/fwd15/fwd30 prices. Much closer to
          "the same setup", and almost empty right now: scoreSetupLog
          only started stamping results on 06/11/2026 and Kite has no
          minute history left for the expired contracts the older rows
          were written on. It fills up by itself from here.

WHAT IT WILL NOT DO

Invent confidence. Under MIN_SAMPLE matches it says how few there were
and stops; it never turns three trades into a hit rate. A made-up
"this works 80% of the time" would cause exactly the impulse clicking
the rest of the guard rails exist to prevent.

It also never says "take it". Nothing in here places, sizes or clears
anything -- it is one more sentence next to a setup, and the no-trade
gate and the lockout still decide.
*/

const fs = require('fs');
const path = require('path');
const charges = require('./charges.js');

/*
Which files to read. chartApp prefixes its paperwork with mock- when it
runs in mock mode (dataFile), and a module that ignored that would quote
the real account's record at a paper trade -- and a harness could not be
pointed at a fixture at all. One env var covers both.
*/
const PREFIX = process.env.FAMILIAR_PREFIX || '';
const TRADE_LOG = path.join(__dirname, PREFIX + 'tradeLog.json');
const SETUP_LOG = path.join(__dirname, PREFIX + 'setupLog.json');

/*
Below this many matches, report the count and no rate. Five is not a
sample either, but it is the point where a run of losses stops being
bad luck and starts being worth saying out loud.
*/
const MIN_SAMPLE = 5;

/*
Premium bands. An option at 5 and an option at 60 are not the same
trade even on the same index: the spread is a different share of the
move, and a 10% stop is 50 paise on one and 6 rupees on the other. The
edges are roughly the quartiles of the 157 trades on file.
*/
const PREM_BANDS = [
    { max: 8, name: 'under 8' },
    { max: 15, name: '8-15' },
    { max: 25, name: '15-25' },
    { max: 40, name: '25-40' },
    { max: Infinity, name: 'over 40' },
];

/*
Time of day in hour-long blocks from the open. The 05/11 move came at
13:37 and the morning hour trades nothing like the last one, so the
block has to be part of what makes a setup "familiar".
*/
const TOD_BLOCKS = [
    { max: 60, name: '09:15-10:15' },
    { max: 120, name: '10:15-11:15' },
    { max: 180, name: '11:15-12:15' },
    { max: 240, name: '12:15-13:15' },
    { max: 300, name: '13:15-14:15' },
    { max: Infinity, name: 'after 14:15' },
];

const CACHE_MS = 30000;
let cache = null, cacheAt = 0;

function readJson(file) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return []; }
}

function indexOf(sym) {
    const s = String(sym || '').toUpperCase();
    if (s.startsWith('SENSEX')) return 'SENSEX';
    if (s.startsWith('BANKEX')) return 'BANKEX';
    if (s.startsWith('BANKNIFTY')) return 'BANKNIFTY';
    if (s.startsWith('NIFTY')) return 'NIFTY';
    return '?';
}

function sideOf(sym) {
    const s = String(sym || '').toUpperCase();
    if (s.endsWith('CE')) return 'CE';
    if (s.endsWith('PE')) return 'PE';
    return '?';
}

// BSE contracts settle on BFO and are charged at a different exchange rate
function exchangeOf(sym) {
    const i = indexOf(sym);
    return (i == 'SENSEX' || i == 'BANKEX') ? 'BFO' : 'NFO';
}

// minutes since the 09:15 open, from "HH:MM:SS" or "YYYY-MM-DD HH:MM:SS"
function minsFromOpen(when) {
    const m = String(when || '').match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]) - (9 * 60 + 15);
}

function bandOf(list, v) {
    if (v == null || !isFinite(v)) return null;
    return (list.find(b => v <= b.max) || list[list.length - 1]).name;
}

const premBand = v => bandOf(PREM_BANDS, v);
const todBlock = v => bandOf(TOD_BLOCKS, v);

/* ------------------------------------------------------------------ *
 * LAYER 1 -- what the closed trades say
 * ------------------------------------------------------------------ */

/*
One record per closed trade, priced net.

The older rows in tradeLog.json carry only date, time, symbol, quantity,
buy, sell and pnl -- no tag, no reason, no MFE. That is fine: buy, sell
and quantity are all charges.js needs, so every row from 21/10 onwards
can be judged on money even though only the newest ones can be judged on
intent. Rows missing a fill price are dropped rather than guessed at.
*/
function tradeMemory() {
    const out = [];
    for (const r of readJson(TRADE_LOG)) {
        const buy = Number(r.buy), sell = Number(r.sell), qty = Number(r.quantity);
        if (!(buy > 0) || !(sell > 0) || !(qty > 0)) continue;

        const sym = r.tradingsymbol;
        const rt = charges.roundTrip({ buy, sell, quantity: qty, exchange: exchangeOf(sym) });
        const tod = minsFromOpen(r.time);

        out.push({
            date: r.date, time: r.time, tradingsymbol: sym,
            index: indexOf(sym), side: sideOf(sym),
            buy, sell, quantity: qty,
            tod, todBlock: todBlock(tod), premBand: premBand(buy),
            gross: rt.gross, net: rt.net,
            // on the money put in, which is the only percentage that spends
            netPct: +(rt.net / (buy * qty) * 100).toFixed(2),
            exitPct: +((sell - buy) / buy * 100).toFixed(2),
            win: rt.net > 0,
            reason: r.reason || null, heldMin: r.heldMin != null ? r.heldMin : null,
            mfePct: r.mfePct != null ? r.mfePct : null,
            maePct: r.maePct != null ? r.maePct : null,
        });
    }
    return out;
}

/* ------------------------------------------------------------------ *
 * LAYER 2 -- what the setups that were NOT taken say
 * ------------------------------------------------------------------ */

/*
A setup row counts as labelled once it has a forward price. fwd15 is the
horizon used to judge it: long enough for a real move to show, short
enough that almost every trade in tradeLog was over by then.

`best` is the highest of the four horizons -- the move that was there to
be had, whether or not anybody took it. A setup whose fwd15 is flat but
whose fwd5 ran 12% is not the same animal as one that never moved, and
the difference is exactly what a trailing stop lives on.
*/
function shapeMemory() {
    const out = [];
    for (const r of readJson(SETUP_LOG)) {
        const fwd = [5, 10, 15, 30]
            .map(h => ({ h, pct: r['fwd' + h + 'Pct'] }))
            .filter(x => x.pct != null && isFinite(x.pct));
        if (!fwd.length) continue;

        const at15 = fwd.find(x => x.h == 15) || fwd[fwd.length - 1];
        const best = fwd.reduce((a, x) => x.pct > a.pct ? x : a, fwd[0]);
        const worst = fwd.reduce((a, x) => x.pct < a.pct ? x : a, fwd[0]);
        const tod = minsFromOpen(r.at);

        out.push({
            date: r.date, at: r.at, tradingsymbol: r.tradingsymbol,
            index: indexOf(r.tradingsymbol), side: sideOf(r.tradingsymbol),
            kind: r.kind, touches: r.touches, rr: r.rr, verdict: r.verdict,
            ltp: r.ltp, premBand: premBand(r.ltp),
            tod, todBlock: todBlock(tod),
            stopPct: r.ltp > 0 && r.riskPerUnit != null
                ? +(r.riskPerUnit / r.ltp * 100).toFixed(2) : null,
            levelGapPct: r.level > 0 && r.ltp != null
                ? +((r.ltp - r.level) / r.level * 100).toFixed(2) : null,
            chop: r.regime ? !!r.regime.chop : null,
            eff: r.regime ? r.regime.eff : null,
            bias: r.regime ? r.regime.bias : null,
            horizonPct: at15.pct, horizon: at15.h,
            bestPct: best.pct, bestAt: best.h,
            worstPct: worst.pct,
            // the paper result at the 15-minute mark, before any charge
            win: at15.pct > 0,
            from: r.fwdFrom || 'live',
        });
    }
    return out;
}

function memory() {
    if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
    cache = { trades: tradeMemory(), shapes: shapeMemory() };
    cacheAt = Date.now();
    return cache;
}

// after a trade closes or a setup gets its forward price, the memory moved
function forget() { cache = null; cacheAt = 0; }

/* ------------------------------------------------------------------ *
 * the arithmetic
 * ------------------------------------------------------------------ */

function sum(a) { return a.reduce((x, y) => x + y, 0); }
function median(a) {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
    return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(2);
}

/*
Roll a set of matches into one honest statement.

`rate` is left null under MIN_SAMPLE on purpose: callers that print it
blindly then print nothing instead of printing a number that cannot
carry its own weight.
*/
function tally(rows, pctKey) {
    const n = rows.length;
    if (!n) return { n: 0, wins: 0, losses: 0, rate: null, medPct: null, netSum: null, thin: true };
    const wins = rows.filter(r => r.win).length;
    const pcts = rows.map(r => r[pctKey]).filter(v => v != null && isFinite(v));
    const nets = rows.map(r => r.net).filter(v => v != null && isFinite(v));
    return {
        n, wins, losses: n - wins,
        rate: n >= MIN_SAMPLE ? Math.round(wins / n * 100) : null,
        medPct: median(pcts),
        netSum: nets.length ? +sum(nets).toFixed(0) : null,
        thin: n < MIN_SAMPLE,
    };
}

/*
How close two setups are, 0 being the same thing.

Hard filters first, because no amount of closeness on the other
features makes a bounce comparable to a break, or a CE comparable to a
PE. Everything after that is a weighted distance on features that are
scale-free, so a 12-rupee NIFTY option and a 40-rupee SENSEX option can
still be the same shape.
*/
const SHAPE_WEIGHTS = {
    stopPct: 1.0,       // how far the stop is: the single biggest driver of the result
    rr: 0.8,
    levelGapPct: 0.8,   // how far past the level price already is
    tod: 0.6,           // the hour of the day
    prem: 0.5,          // premium size, on a log scale
    touches: 0.4,
    eff: 0.4,           // how trending the index was
};

function shapeDistance(a, b) {
    if (a.kind && b.kind && a.kind != b.kind) return null;
    if (a.side && b.side && a.side != b.side) return null;

    let d = 0, w = 0;
    const put = (key, va, vb, scale) => {
        if (va == null || vb == null || !isFinite(va) || !isFinite(vb)) return;
        const weight = SHAPE_WEIGHTS[key];
        d += weight * Math.min(1, Math.abs(va - vb) / scale);
        w += weight;
    };

    put('stopPct', a.stopPct, b.stopPct, 6);          // 6 percentage points apart = unrelated
    put('rr', a.rr, b.rr, 2);
    put('levelGapPct', a.levelGapPct, b.levelGapPct, 4);
    put('tod', a.tod, b.tod, 120);                     // two hours apart = unrelated
    put('prem', Math.log(Math.max(1, a.ltp)), Math.log(Math.max(1, b.ltp)), Math.log(4));
    put('touches', a.touches, b.touches, 3);
    put('eff', a.eff, b.eff, 20);

    // chop is a different market, not a nearby one
    if (a.chop != null && b.chop != null && a.chop !== b.chop) { d += 1; w += 1; }

    if (w < 1) return null;                            // nothing comparable was known
    return +(d / w).toFixed(3);
}

// anything beyond this is not the same setup, however it is ranked
const NEAR = 0.45;

/* ------------------------------------------------------------------ *
 * the question callers ask
 * ------------------------------------------------------------------ */

/*
familiarFor(live)

  live  a setup row as checkSetups builds it, or anything carrying
        tradingsymbol, ltp and ideally kind / riskPerUnit / rr /
        touches / level / regime / at

Returns both layers plus a one-line summary for the screen. Never
throws: a missing field narrows the answer, it does not break it.
*/
function familiarFor(live) {
    const mem = memory();
    const sym = live && live.tradingsymbol;
    const ltp = Number(live && live.ltp);
    const index = indexOf(sym), side = sideOf(sym);
    const tod = minsFromOpen(live && (live.at || live.time)) ?? minsFromOpen(
        new Date().toTimeString().slice(0, 8));
    const pb = premBand(ltp), tb = todBlock(tod);

    /* ---- layer 1: the closed trades, widened until there is a sample ---- */
    const steps = [
        { why: `${index} ${side}, ${pb} premium, ${tb}`,
            f: t => t.index == index && t.side == side && t.premBand == pb && t.todBlock == tb },
        { why: `${index} ${side}, ${pb} premium`,
            f: t => t.index == index && t.side == side && t.premBand == pb },
        { why: `${index} ${side}`,
            f: t => t.index == index && t.side == side },
        { why: `every ${index} trade`,
            f: t => t.index == index },
        { why: 'every trade on file',
            f: () => true },
    ];

    let trades = null;
    for (const s of steps) {
        const rows = mem.trades.filter(s.f);
        trades = { ...tally(rows, 'netPct'), why: s.why, rows };
        // stop at the first cut that is actually a sample; the widest cut
        // is reported thin rather than skipped, so the answer is never blank
        if (!trades.thin) break;
    }

    /* ---- layer 2: the same shape, if any of it is labelled yet ---- */
    const liveShape = {
        kind: live && live.kind, side,
        ltp, touches: live && live.touches, rr: live && live.rr,
        stopPct: ltp > 0 && live && live.riskPerUnit != null
            ? +(Number(live.riskPerUnit) / ltp * 100).toFixed(2) : null,
        levelGapPct: live && live.level > 0 && ltp != null
            ? +((ltp - live.level) / live.level * 100).toFixed(2) : null,
        tod,
        chop: live && live.regime ? !!live.regime.chop : null,
        eff: live && live.regime ? live.regime.eff : null,
    };

    const scored = [];
    for (const m of mem.shapes) {
        const d = shapeDistance(liveShape, m);
        if (d == null || d > NEAR) continue;
        scored.push({ ...m, distance: d });
    }
    scored.sort((a, b) => a.distance - b.distance);

    const shapes = {
        ...tally(scored, 'horizonPct'),
        labelled: mem.shapes.length,
        nearest: scored.slice(0, 5).map(m => ({
            date: m.date, at: m.at, tradingsymbol: m.tradingsymbol, kind: m.kind,
            distance: m.distance, horizonPct: m.horizonPct, bestPct: m.bestPct,
            worstPct: m.worstPct, verdict: m.verdict,
        })),
    };

    return { index, side, premBand: pb, todBlock: tb, trades, shapes, line: lineFor(trades, shapes) };
}

/*
The sentence that goes next to the setup.

Order matters. The shape layer is the closer comparison so it speaks
first once it has a sample; the money layer speaks otherwise, because a
losing record on this index and side is worth saying even when the exact
shape has never been seen. A thin record says it is thin.
*/
function lineFor(trades, shapes) {
    if (shapes && !shapes.thin) {
        const w = `${shapes.wins}/${shapes.n} went up in 15 min`;
        const med = shapes.medPct != null ? `, median ${shapes.medPct > 0 ? '+' : ''}${shapes.medPct}%` : '';
        return `same shape ${shapes.n} times before — ${w}${med}`;
    }
    if (trades && !trades.thin) {
        const money = trades.netSum != null
            ? `, ₹${trades.netSum > 0 ? '+' : ''}${trades.netSum} net all together`
            : '';
        let line = `${trades.why}: ${trades.wins} of ${trades.n} ended green after charges${money}`;
        /*
        The trap this catches is real and it is in the file right now:
        NIFTY PE over 40 is 8 green out of 11 and still -1,871 net. Read
        as "73%" that is encouragement; it is the opposite. Say which way
        the sizes went, or the sentence argues for the click.
        */
        if (trades.netSum != null && trades.netSum < 0 && trades.wins > trades.losses) {
            line += ' — more winners than losers but still down, so the losers were the bigger ones';
        } else if (trades.netSum != null && trades.netSum > 0 && trades.wins < trades.losses) {
            line += ' — more losers than winners and still up, so the winners carried it';
        }
        return line;
    }
    const n = (shapes && shapes.n) || 0;
    const t = (trades && trades.n) || 0;
    if (!n && !t) return 'nothing like this on file yet';
    return `only ${n ? n + ' matching setups' : t + ' matching trades'} on file — too few to mean anything`;
}

/*
The standing record, for a panel that wants it without a live setup in
hand. Same arithmetic, no matching.
*/
function overall() {
    const mem = memory();
    const t = tally(mem.trades, 'netPct');
    const gross = mem.trades.filter(r => r.gross > 0).length;
    return {
        trades: {
            ...t, grossWins: gross,
            charged: +sum(mem.trades.map(r => r.gross - r.net)).toFixed(0),
            days: [...new Set(mem.trades.map(r => r.date))].length,
        },
        shapes: { labelled: mem.shapes.length, ...tally(mem.shapes, 'horizonPct') },
    };
}

module.exports = {
    familiarFor, overall, forget,
    // exported so the harness can check the parts separately
    tradeMemory, shapeMemory, shapeDistance, tally,
    indexOf, sideOf, premBand, todBlock, minsFromOpen,
    MIN_SAMPLE, NEAR, PREM_BANDS, TOD_BLOCKS,
    TRADE_LOG, SETUP_LOG,
};
