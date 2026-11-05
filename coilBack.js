/*

coilBack.js -- replay coilWatch's signs over a cached day.

Usage:
    node coilBack.js <dir> [fromHHMM] [toHHMM]

<dir> holds one <token>.json per instrument, each an array of
{time, open, high, low, close, volume, oi} 1-minute bars, as returned by
kite.getHistoricalData(). The spot token must be in there too. Option
volume is treated as PER-MINUTE, which is what Kite returns for options;
the spot's volume is ignored.

Why this exists: every threshold in coilWatch.json came off ONE day. The
only way to change one honestly is to re-run it and look. This file calls
the SAME readSigns() and readRelease() the live watcher calls -- it is not
a second implementation, so a pass here means a pass there.

It prints a score per minute, the signs behind the score, and every minute
the release test would have fired. It places no orders and touches no
config.

*/

const fs = require('fs');
const path = require('path');
const { readSigns, readRelease, readCfg } = require('./coilWatch.js');

const IST = 19800000;
const hm = t => {
    const d = new Date(t * 1000 + IST);
    return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
};

function load(dir) {
    const out = {};
    for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json')) continue;
        const tok = Number(path.basename(f, '.json'));
        if (!Number.isFinite(tok)) continue;
        out[tok] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    }
    return out;
}

/*
Which token is the index: the one whose bars carry no volume and no OI.
That is what a spot series looks like and it saves hard-coding 265.
*/
function findSpot(data) {
    for (const [tok, bars] of Object.entries(data)) {
        if (bars.every(b => !b.volume && !b.oi)) return Number(tok);
    }
    return null;
}

/*
CE or PE from the trading symbol if a master dump is to hand, else from
the strike: on an index chain the calls sit above the spot and the puts
below, and these files are named by token only. The safe rule here is the
one the study used -- pass the sides in explicitly.
*/
function sideOf(tok, ceToks, peToks) {
    if (ceToks.includes(Number(tok))) return 'CE';
    if (peToks.includes(Number(tok))) return 'PE';
    return null;
}

function foldVol(data, toks, upto) {
    const byMin = new Map();
    for (const tok of toks) {
        for (const b of (data[tok] || [])) {
            const min = Math.floor(b.time / 60);
            if (min >= upto) continue;
            byMin.set(min, (byMin.get(min) || 0) + (b.volume || 0));
        }
    }
    return [...byMin.keys()].sort((a, b) => a - b).map(min => ({ min, vol: byMin.get(min) }));
}

function foldOi(data, toks, upto) {
    const byMin = new Map();
    for (const tok of toks) {
        for (const b of (data[tok] || [])) {
            const min = Math.floor(b.time / 60);
            if (min >= upto) continue;
            if (!(b.oi > 0)) continue;
            const r = byMin.get(min) || { min, oi: 0, pxSum: 0, pxN: 0 };
            r.oi += b.oi;
            if (b.close > 0) { r.pxSum += b.close; r.pxN++; }
            byMin.set(min, r);
        }
    }
    return [...byMin.keys()].sort((a, b) => a - b)
        .map(min => { const r = byMin.get(min); return { min, oi: r.oi, px: r.pxN ? r.pxSum / r.pxN : 0 }; });
}

function run(dir, from, to, ceToks, peToks) {
    const cfg = readCfg();
    const data = load(dir);
    const spot = findSpot(data);
    if (!spot) { console.log('could not work out which token is the index'); return; }

    const all = data[spot].slice().sort((a, b) => a.time - b.time);
    console.log(`index token ${spot}, ${all.length} bars ${hm(all[0].time)}-${hm(all[all.length - 1].time)}`);
    console.log(`CE ${ceToks.join(',')}  PE ${peToks.join(',')}`);
    console.log(`\ntime   up  down  release  signs`);

    let armedAt = null, armedSide = null, fired = 0, lastFire = -1e9;

    for (let i = cfg.minBars; i < all.length; i++) {
        const t = hm(all[i].time);
        if (from && t < from) continue;
        if (to && t > to) break;

        // everything strictly BEFORE this bar's minute, plus this bar as the
        // last COMPLETED one -- exactly what minBarsFromSec hands the live watcher
        const bars = all.slice(0, i + 1);
        const nowMin = Math.floor(all[i].time / 60) + 1;

        const read = side => readSigns({
            bars,
            ownVol: foldVol(data, side == 'up' ? ceToks : peToks, nowMin),
            oppVol: foldVol(data, side == 'up' ? peToks : ceToks, nowMin),
            // own-side OI off ONE leg, the other side folded -- same split the
            // live watcher uses, and for the same reason (see coilWatch.js)
            ownOi: foldOi(data, (side == 'up' ? ceToks : peToks).slice(0, 1), nowMin),
            oppOi: foldOi(data, side == 'up' ? peToks : ceToks, nowMin),
            side,
        }, cfg);

        const u = read('up'), d = read('down');
        const sc = u.score == d.score ? null : (u.score > d.score ? u : d);
        const rel = sc ? readRelease({ bars, side: sc.side }, cfg) : { ok: false };

        /*
        The same state machine as coilWatch.onTick(), step for step: arm
        at armScore, disarm when the score falls, fire on a release that
        still scores fireScore, and apply cooldownMin. Without the
        cooldown this reports four fires on 05/11 when the live watcher
        would have taken one trade and ignored the next fifteen minutes.
        armWindowMin does not gate the entry -- see the note in
        coilWatch.js about why it used to and what that cost.
        */
        const armed = sc && sc.score >= cfg.armScore;
        if (!armed) { armedAt = null; armedSide = null; }
        else if (armedSide != sc.side || armedAt == null) { armedAt = i; armedSide = sc.side; }

        let flag = '';
        if (armed) {
            const canFire = rel.ok && sc.score >= cfg.fireScore
                && (i - lastFire) >= cfg.cooldownMin;
            flag = canFire ? ' FIRE' : (rel.ok ? ' cool' : ' ARMED');
            if (canFire) { fired++; lastFire = i; armedAt = null; armedSide = null; }
        }

        console.log(`${t}  ${String(u.score).padStart(2)}  ${String(d.score).padStart(4)}`
            + `  ${(rel.ok ? 'yes' : 'no').padStart(7)}${flag.padEnd(8)}`
            + `  ${sc ? sc.side + ': ' + sc.passed.join(',') : '-'}`);

        if (flag == ' FIRE') {
            console.log(`        ↳ ${rel.why}`);
            for (const s of sc.signs) console.log(`        ${s.pass ? '✓' : '·'} ${s.key}: ${s.detail}`);
        }
    }
    console.log(`\n${fired} minute(s) would have fired.`);
}

if (require.main === module) {
    const [dir, from, to, ce, pe] = process.argv.slice(2);
    if (!dir) { console.log('usage: node coilBack.js <dir> [fromHHMM] [toHHMM] [ceTokens,csv] [peTokens,csv]'); process.exit(1); }
    const data = load(dir);
    const spot = findSpot(data);
    const toks = Object.keys(data).map(Number).filter(t => t != spot);
    // without an explicit split, guess: in a Kite option dump the CE tokens of
    // one expiry run above the PE tokens is NOT reliable, so demand the lists
    const ceToks = ce ? ce.split(',').map(Number) : toks.filter(t => false);
    const peToks = pe ? pe.split(',').map(Number) : toks.filter(t => false);
    if (!ceToks.length || !peToks.length) {
        console.log('pass the CE and PE token lists explicitly:\n'
            + `  node coilBack.js ${dir} 12:30 14:00 ${toks.slice(0, 3).join(',')} ${toks.slice(3).join(',')}`);
        process.exit(1);
    }
    run(dir, from, to, ceToks, peToks);
}

module.exports = { load, findSpot, foldVol, foldOi, sideOf, run };
