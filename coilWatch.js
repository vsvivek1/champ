/*

coilWatch.js -- watch for the signs that came before the 05/11/2026 move,
raise the alarm while they stack up, and take the trade when the market
finally expands.

WHY THIS EXISTS

On 05/11/2026 SENSEX ran 79172 to 79465 between 13:36 and 13:48. The far
calls went 4x to 6x. The move was not a surprise: it was telegraphed for
about 40 minutes and two of the tells were in place for a full hour. The
measurements are in presigns-2026-11-05.md. Nothing in the app was looking
for any of them.

The eight signs, and what each one means:

  hilo     The 15-minute spot low keeps rising. Every dip is bought higher
           than the last one. On 05/11 it rose six times in a row from
           12:33 to 13:33 and never once made a lower low. The app has a
           higherHighs() helper but it only runs on the OPTION, over three
           bars. Nothing watched the spot.

  squeeze  The 15-minute spot range gets tight. 119 points at 12:37 down to
           64 at 12:58. Same buying, smaller swings: the sellers are
           running out. Then it expands -- 178 by 13:38, 296 by 13:48.

  coil     The 30-minute path shrinks while the direction holds. path was
           509 at 13:02, 441 at 13:19, 351 at 13:30, 280 at 13:35, and the
           bias read `up` at every single minute. Less distance travelled
           for the same gain. computeRegime() already works out `net` and
           `path` and then keeps only the ratio -- the coil is in the half
           it throws away.

  ratio    Per-minute volume in the calls against the puts. 1.4 to 2.9 all
           morning, then 4.36 at 13:02, 7.89 at 13:19, and never below 4
           again after 13:22. It sat between 8 and 11 for a full fifteen
           minutes before the move. This is the single best number of the
           eight. participation() folds CE and PE together on purpose --
           correct for "is this strike dead", but it deletes exactly this.

  quiet    The other side goes empty. Put volume ran 0.58 to 0.72 of its
           own median at 13:16-13:26. Calls were only 1.3 to 2.0x their
           median -- not extreme, a volume filter alone shrugs at it. The
           information was in the side that stopped trading, not the side
           that was busy.

  oppoi    The other side's open interest drains. 78200PE went 29.97 lakh
           at 12:30 to 21.01 at 13:19 to 16.12 at 13:40, down 46%. 78400PE
           dropped 19.5% in one three-minute print at 13:21. Falling OI
           with a falling price means the holders closed and took the loss.
           They had given up before the move started.

  ownoi    Our side's open interest builds while its price stands still.
           79800CE OI rose 43% between 12:00 and 13:35 and the price sat
           at 8.50-10.80 the whole time. Somebody was loading up and the
           price was not telling anyone, which only happens while a seller
           is still willing to absorb it -- until they are not.

  highs    New session highs keep getting taken and none are given back.
           Thirteen in 54 minutes on 05/11. The deepest pullback in the
           whole hour was 50 points and it held above the previous high. A
           failed breakout hands the level back within a few bars; not one
           of these did.

ARM, THEN FIRE. TWO SEPARATE THINGS.

The signs do not say WHEN. They say the market is loaded. So there are two
stages and they do different jobs:

  ARMED   enough signs are stacked (score >= armScore). This buzzes the
          phone and nothing else. It is the early warning, and on 05/11 it
          would have gone off around 13:30 -- six minutes before the move,
          with the option at 12.30.

  FIRED   the market actually expands: a completed spot minute whose range
          is expandMult x the median of the bars behind it, closing in the
          top closeTopPct of its own range, in the armed direction. THIS is
          what places the order.

Waiting for the expansion bar costs part of the move -- on 05/11 it means
paying about 19 instead of about 12 for the 79800CE, so 3.4x instead of
5.2x. It buys two things worth more than that:

  1. A coil that never breaks out never trades. Most coils do not break
     out. The signs alone would have had us buying every quiet patch.
  2. It walks around a real trap. blockChop refuses entries under 10%
     efficiency, and the tightest part of a coil reads as low efficiency
     because the range is small -- 3 to 9% between 12:51 and 12:57 on
     05/11, which is the chop gate blocking at the exact moment the coil
     was tightest. By the expansion bar the efficiency was 52%. Firing on
     the release means the existing gate passes on its own merits instead
     of having to be weakened.

WHAT THIS FILE DOES NOT DO

- It does not place the order itself. It builds the same row checkSetups()
  publishes and hands it to autoPilot.onSetup(), which re-runs the no-trade
  gate on the live price, sizes with riskCappedQty, and places the BUY. One
  copy of the gate, one copy of the sizer, one order path.
- It does not decide the stop, the target, the partial or the trail. The
  guard owns all of those from the moment the BUY fills, exactly as it does
  for a clicked entry.
- It never sells, never modifies and never cancels. There is no SELL call
  in this file. chartApp's guard is the only thing that exits a position.
- It does not need the browser. It runs off the tick stream inside the
  server process, so it works the same whether the chart page is open,
  closed, or never opened at all.

KNOWN LIMITS, STATED PLAINLY

- Headless mode charts exactly one CE and one PE, so `ratio`, `quiet`,
  `oppoi` and `ownoi` are read off one leg per side rather than the eight
  strikes the 05/11 study used. The signs still read the same way -- both
  legs are equidistant OTM by the IV rule -- but they are thinner.
- It buys the charted leg. On 05/11 the strikes four and five steps further
  out paid 4-6x against 2.4x for the near one. This file cannot reach them
  because they are not subscribed. That is a separate change.
- Every threshold below comes from ONE day on ONE index. The defaults are
  deliberately on the strict side for that reason. Re-measure before
  loosening anything.

*/

const fs = require('fs');
const path = require('path');

const CFG_FILE = path.join(__dirname, 'coilWatch.json');

const DEFAULTS = {
    enabled: true,
    trade: true,            // false = alarm only, never order. Flip this to watch it for a few days first.

    /* --- how many signs are enough --- */
    armScore: 6,            // of 12. At or above this the phone buzzes.
    fireScore: 6,           // must still hold on the expansion bar
    armWindowMin: 20,       // buzz the phone again if it is still coiled after this long

    /* --- sign 1: higher lows (weight 2) --- */
    lowWin: 15,             // the rolling low window, minutes
    lowStep: 5,             // compare the rolling low this many minutes apart
    lowSteps: 3,            // this many rises in a row, no fall allowed

    /* --- sign 2: squeeze (weight 1) --- */
    sqWin: 15,              // the range window
    sqLookMin: 45,          // widest range to compare against, minutes back
    sqPct: 65,              // now must be this % of the widest or less

    /* --- sign 3: coil (weight 1) --- */
    pathWin: 30,            // same window computeRegime uses
    pathLagMin: 15,         // compare against the window ending this far back
    pathPct: 80,            // now must be this % of then or less

    /* --- sign 4: volume ratio (weight 2) --- */
    minRatio: 3,            // own side / other side, per minute
    minRatioX: 2,           // and this many times its own earlier baseline
    ratioBars: 3,           // holding in at least this many of the last ratioLook bars
    ratioLook: 5,
    baseLagMin: 30,         // the baseline window ENDS this far back, so a signal
    baseWin: 30,            // that has already run for 30 min cannot raise its own bar

    /* --- sign 5: the other side goes quiet (weight 1) --- */
    quietX: 0.8,            // other-side volume at or under this x its own median
    quietMedWin: 20,

    /* --- sign 6: other-side OI draining (weight 2) --- */
    oiWin: 45,              // minutes
    oppOiDropPct: 8,        // other side OI down at least this much

    /* --- sign 7: own-side OI building on a flat price (weight 1) --- */
    ownOiRisePct: 15,
    ownOiFlatPct: 25,       // and its own price moved no more than this

    /* --- sign 8: new highs held (weight 2) --- */
    highWin: 60,            // minutes
    minNewHighs: 4,         // new highs inside the window
    giveBackPct: 0.15,      // price must still be within this % of the window high

    /* --- the release --- */
    expandMult: 2.0,        // completed bar range vs the median of expandMedWin behind it
    expandMedWin: 20,
    closeTopPct: 60,        // and it closed this far up its own range (or down, for a fall)

    /* --- housekeeping --- */
    cooldownMin: 15,        // between fires
    alarmCooldownMin: 10,   // between phone alarms
    minBars: 50,            // spot minutes needed before any of this means anything
    logMax: 200,
};

function readCfg() {
    try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')) }; }
    catch { return { ...DEFAULTS }; }
}

function writeCfg(s) {
    fs.writeFileSync(CFG_FILE, JSON.stringify(s, null, 2));
}

/* =====================================================================
THE MATH

Pure functions. No deps, no clock, no I/O -- every one takes plain arrays
and returns a verdict. That is so the whole thing can be replayed against
a cached day without a broker, a socket or a fake timer; see coilBack.js.

`bars`   spot 1-minute OHLC, OLDEST FIRST, the forming minute EXCLUDED
`vol`    [{min, vol}] per-minute INCREMENTAL volume, oldest first
`oi`     [{min, oi, px}] per-minute open interest and price, oldest first
`side`   'up' for a rally (buy CE) or 'down' for a fall (buy PE)
===================================================================== */

function median(a) {
    const v = a.filter(x => Number.isFinite(x)).sort((x, y) => x - y);
    if (!v.length) return 0;
    const i = Math.floor(v.length / 2);
    return v.length % 2 ? v[i] : (v[i - 1] + v[i]) / 2;
}

// lowest low / highest high of the `win` bars ending at index i (inclusive)
function rollLow(bars, i, win) {
    const s = bars.slice(Math.max(0, i - win + 1), i + 1);
    return s.length ? Math.min(...s.map(b => b.low)) : null;
}
function rollHigh(bars, i, win) {
    const s = bars.slice(Math.max(0, i - win + 1), i + 1);
    return s.length ? Math.max(...s.map(b => b.high)) : null;
}

// total absolute close-to-close distance over the `win` bars ending at i
function pathOf(bars, i, win) {
    const s = bars.slice(Math.max(0, i - win), i + 1);
    if (s.length < 2) return null;
    let p = 0;
    for (let k = 1; k < s.length; k++) p += Math.abs(s[k].close - s[k - 1].close);
    return p;
}

/*
Per-minute volume ratio of our side against the other side, newest last.
Both arrays are keyed by minute and only minutes present in BOTH are used
-- a minute the socket missed on one leg cannot be divided honestly.
*/
function ratioSeries(ownVol, oppVol) {
    const opp = new Map(oppVol.map(r => [r.min, r.vol]));
    const out = [];
    for (const r of ownVol) {
        const o = opp.get(r.min);
        if (o == null) continue;
        if (!(o > 0)) continue;                 // a zero divisor is not a ratio
        out.push({ min: r.min, ratio: r.vol / o, own: r.vol, opp: o });
    }
    return out;
}

// the OI/px sample at or just before `min - back` minutes
function oiAt(oi, nowMin, back) {
    let best = null;
    for (const s of oi) {
        if (nowMin - s.min >= back) best = s;   // oldest first, so the last match is the closest
    }
    return best;
}

/*
Read all eight signs. Returns the score, the maximum, and one row per sign
so the alarm and the log can say WHICH ones fired rather than just a number.
Every sign that cannot be read yet is reported `ok: false` and scores zero
-- missing data never counts as agreement.
*/
function readSigns({ bars, ownVol, oppVol, ownOi, oppOi, side }, cfg) {
    const signs = [];
    const up = side == 'up';
    const i = bars.length - 1;
    const nowMin = bars.length ? Math.floor(bars[i].time / 60) : null;

    const add = (key, weight, ok, pass, detail) =>
        signs.push({ key, weight, ok, pass: !!(ok && pass), detail });

    /* 1. higher lows, or lower highs on the way down */
    (() => {
        const need = cfg.lowSteps, step = cfg.lowStep, win = cfg.lowWin;
        if (bars.length < win + need * step) {
            return add('hilo', 2, false, false, `need ${win + need * step} bars, have ${bars.length}`);
        }
        const pts = [];
        for (let k = need; k >= 0; k--) {
            const j = i - k * step;
            pts.push(up ? rollLow(bars, j, win) : rollHigh(bars, j, win));
        }
        let rises = 0, broke = false;
        for (let k = 1; k < pts.length; k++) {
            if (up ? pts[k] > pts[k - 1] : pts[k] < pts[k - 1]) rises++;
            else if (up ? pts[k] < pts[k - 1] : pts[k] > pts[k - 1]) broke = true;
        }
        add('hilo', 2, true, rises >= need && !broke,
            `${win}m ${up ? 'lows' : 'highs'} ${pts.map(p => p.toFixed(0)).join(' → ')}`
            + ` (${rises}/${need} ${up ? 'up' : 'down'}${broke ? ', one went the wrong way' : ''})`);
    })();

    /* 2. the squeeze */
    (() => {
        if (bars.length < cfg.sqLookMin) {
            return add('squeeze', 1, false, false, `need ${cfg.sqLookMin} bars, have ${bars.length}`);
        }
        const now = rollHigh(bars, i, cfg.sqWin) - rollLow(bars, i, cfg.sqWin);
        let widest = 0;
        for (let j = Math.max(cfg.sqWin - 1, i - cfg.sqLookMin + 1); j <= i; j++) {
            const w = rollHigh(bars, j, cfg.sqWin) - rollLow(bars, j, cfg.sqWin);
            if (w > widest) widest = w;
        }
        const pct = widest > 0 ? now / widest * 100 : 100;
        add('squeeze', 1, true, pct <= cfg.sqPct,
            `${cfg.sqWin}m range ${now.toFixed(0)} vs widest ${widest.toFixed(0)}`
            + ` in ${cfg.sqLookMin}m = ${pct.toFixed(0)}% (want ≤${cfg.sqPct}%)`);
    })();

    /* 3. the coil: path shrinking, direction holding */
    (() => {
        const need = cfg.pathWin + cfg.pathLagMin + 1;
        if (bars.length < need) {
            return add('coil', 1, false, false, `need ${need} bars, have ${bars.length}`);
        }
        const now = pathOf(bars, i, cfg.pathWin);
        const then = pathOf(bars, i - cfg.pathLagMin, cfg.pathWin);
        const net = bars[i].close - bars[Math.max(0, i - cfg.pathWin)].close;
        const pct = then > 0 ? now / then * 100 : 100;
        const dirOk = up ? net > 0 : net < 0;
        add('coil', 1, true, pct <= cfg.pathPct && dirOk,
            `${cfg.pathWin}m path ${now.toFixed(0)} vs ${then.toFixed(0)} ${cfg.pathLagMin}m ago`
            + ` = ${pct.toFixed(0)}% (want ≤${cfg.pathPct}%), net ${net > 0 ? '+' : ''}${net.toFixed(0)}`);
    })();

    /* 4. the volume ratio, against a LAGGED baseline */
    (() => {
        const rs = ratioSeries(ownVol, oppVol);
        if (rs.length < cfg.baseLagMin + 5 || nowMin == null) {
            return add('ratio', 2, false, false, `only ${rs.length} min of both-sided tape`);
        }
        const recent = rs.filter(r => nowMin - r.min < cfg.ratioLook);
        const base = rs.filter(r => nowMin - r.min >= cfg.baseLagMin
            && nowMin - r.min < cfg.baseLagMin + cfg.baseWin);
        if (recent.length < 2 || base.length < 5) {
            return add('ratio', 2, false, false,
                `${recent.length} recent / ${base.length} baseline minutes, not enough`);
        }
        const baseMed = median(base.map(r => r.ratio));
        const hits = recent.filter(r => r.ratio >= cfg.minRatio
            && baseMed > 0 && r.ratio / baseMed >= cfg.minRatioX);
        const nowR = recent[recent.length - 1].ratio;
        add('ratio', 2, true, hits.length >= cfg.ratioBars,
            `${up ? 'CE/PE' : 'PE/CE'} ${nowR.toFixed(1)}:1 now`
            + `, baseline ${baseMed.toFixed(1)} (${cfg.baseLagMin}-${cfg.baseLagMin + cfg.baseWin}m ago)`
            + ` = ${(nowR / (baseMed || 1)).toFixed(1)}x`
            + `, held in ${hits.length}/${recent.length} of the last ${cfg.ratioLook}m`
            + ` (want ${cfg.ratioBars})`);
    })();

    /* 5. the other side goes quiet */
    (() => {
        if (oppVol.length < cfg.quietMedWin + 1) {
            return add('quiet', 1, false, false, `only ${oppVol.length} min of other-side tape`);
        }
        const now = oppVol[oppVol.length - 1].vol;
        const med = median(oppVol.slice(-(cfg.quietMedWin + 1), -1).map(r => r.vol));
        const x = med > 0 ? now / med : 1;
        add('quiet', 1, true, x <= cfg.quietX,
            `${up ? 'put' : 'call'} volume ${Math.round(now)} units`
            + ` = ${x.toFixed(2)}x its own ${cfg.quietMedWin}m median ${Math.round(med)}`
            + ` (want ≤${cfg.quietX})`);
    })();

    /* 6. the other side's OI draining */
    (() => {
        if (!oppOi.length || nowMin == null) return add('oppoi', 2, false, false, 'no other-side OI yet');
        const now = oppOi[oppOi.length - 1];
        const past = oiAt(oppOi, now.min, cfg.oiWin);
        if (!past || !(past.oi > 0)) {
            return add('oppoi', 2, false, false, `no other-side OI ${cfg.oiWin}m back`);
        }
        const d = (now.oi - past.oi) / past.oi * 100;
        add('oppoi', 2, true, d <= -cfg.oppOiDropPct,
            `${up ? 'put' : 'call'} OI ${(past.oi / 100000).toFixed(2)}L → ${(now.oi / 100000).toFixed(2)}L`
            + ` over ${cfg.oiWin}m = ${d.toFixed(1)}% (want ≤-${cfg.oppOiDropPct}%)`);
    })();

    /* 7. our side's OI building while its price stands still */
    (() => {
        if (!ownOi.length || nowMin == null) return add('ownoi', 1, false, false, 'no own-side OI yet');
        const now = ownOi[ownOi.length - 1];
        const past = oiAt(ownOi, now.min, cfg.oiWin);
        if (!past || !(past.oi > 0) || !(past.px > 0)) {
            return add('ownoi', 1, false, false, `no own-side OI ${cfg.oiWin}m back`);
        }
        const dOi = (now.oi - past.oi) / past.oi * 100;
        const dPx = Math.abs((now.px - past.px) / past.px * 100);
        add('ownoi', 1, true, dOi >= cfg.ownOiRisePct && dPx <= cfg.ownOiFlatPct,
            `own OI ${(past.oi / 100000).toFixed(2)}L → ${(now.oi / 100000).toFixed(2)}L = ${dOi > 0 ? '+' : ''}${dOi.toFixed(1)}%`
            + ` while its price moved ${dPx.toFixed(0)}%`
            + ` (want ≥+${cfg.ownOiRisePct}% on ≤${cfg.ownOiFlatPct}%)`);
    })();

    /* 8. new highs taken and held */
    (() => {
        if (bars.length < cfg.highWin + 1) {
            return add('highs', 2, false, false, `need ${cfg.highWin + 1} bars, have ${bars.length}`);
        }
        const from = Math.max(1, i - cfg.highWin + 1);
        let n = 0, ext = up ? -Infinity : Infinity;
        // the extreme going INTO the window, so the first bar can make a new one
        for (let j = 0; j < from; j++) ext = up ? Math.max(ext, bars[j].high) : Math.min(ext, bars[j].low);
        for (let j = from; j <= i; j++) {
            if (up ? bars[j].high > ext : bars[j].low < ext) { n++; ext = up ? bars[j].high : bars[j].low; }
        }
        const back = up ? (ext - bars[i].close) / ext * 100 : (bars[i].close - ext) / ext * 100;
        add('highs', 2, true, n >= cfg.minNewHighs && back <= cfg.giveBackPct,
            `${n} new ${cfg.highWin}m ${up ? 'highs' : 'lows'} (want ${cfg.minNewHighs})`
            + `, now ${back.toFixed(2)}% off ${ext.toFixed(0)} (want ≤${cfg.giveBackPct}%)`);
    })();

    const score = signs.reduce((a, s) => a + (s.pass ? s.weight : 0), 0);
    const max = signs.reduce((a, s) => a + s.weight, 0);
    return { score, max, side, signs, passed: signs.filter(s => s.pass).map(s => s.key) };
}

/*
The release. The last COMPLETED spot minute has to be genuinely wide
against the bars behind it, and it has to close near the end it is running
towards -- a wide bar that closes back in the middle is a rejection, not a
breakout, and that is the difference between 13:31 (closed 58% up its
range, no trade) and 13:37 (closed 88% up, trade) on 05/11.
*/
function readRelease({ bars, side }, cfg) {
    const up = side == 'up';
    const i = bars.length - 1;
    if (bars.length < cfg.expandMedWin + 2) {
        return { ok: false, why: `need ${cfg.expandMedWin + 2} bars, have ${bars.length}` };
    }
    const b = bars[i];
    const rng = b.high - b.low;
    const med = median(bars.slice(i - cfg.expandMedWin, i).map(x => x.high - x.low));
    const x = med > 0 ? rng / med : 0;
    const pos = rng > 0 ? (up ? (b.close - b.low) : (b.high - b.close)) / rng * 100 : 0;
    const dir = up ? b.close > b.open : b.close < b.open;
    const ok = x >= cfg.expandMult && pos >= cfg.closeTopPct && dir;
    return {
        ok, x: +x.toFixed(2), rng: +rng.toFixed(1), med: +med.toFixed(1), pos: +pos.toFixed(0),
        why: `range ${rng.toFixed(0)} = ${x.toFixed(1)}x the ${cfg.expandMedWin}m median ${med.toFixed(0)}`
            + ` (want ${cfg.expandMult}x), closed ${pos.toFixed(0)}% up its own range (want ${cfg.closeTopPct}%)`
            + (dir ? '' : `, but the bar closed ${up ? 'red' : 'green'}`)
    };
}

/* =====================================================================
THE WATCHER

Everything above is arithmetic. This part is the wiring: it pulls the four
data series out of chartApp's own state once a minute, scores them both
ways round, buzzes the phone when the score arms, and hands the expansion
bar to the autopilot.
===================================================================== */

function createCoilWatch(deps) {

    const {
        kite,
        dayjs,
        instByToken,            // Map token -> instrument
        chartedTokens,          // () => [token, ...]
        spotToken,              // () => the index spot token, or null
        minBarsFromSec,         // (token, n) => completed 1m OHLC, oldest first
        partSeriesOf,           // (token) => [{min, vol (cumulative), oi}]
        oiSeriesOf,             // (token) => [{min, ltp, oi}]
        ltpOf,
        breachFromSec,
        plannedStop,
        readGuardSettings,
        noTradeChecks,
        computeLevels,
        pickResistance,
        alertPhone,
        broadcast,
        autoPilot,              // may be null when the browser is driving
        openCount,              // () => open guard positions
        logFile,                // where to append fired/armed rows
    } = deps;

    /* --- spot minute bars, seeded once so a restart is not blind --- */
    const spotOhlc = new Map();     // minute key -> {time, open, high, low, close}
    let seeded = false, seeding = false;

    /*
    Before 09:15 there is nothing to seed: "from 09:00" is later than "now",
    and Kite answers "from date cannot be after to date". Without the two
    guards below that call went out on EVERY pre-open tick -- a history
    request per tick for over an hour, and the same line in the log a
    thousand times. Retry at most once every 30 seconds, and not at all
    until the first minute has actually closed.
    */
    let seedTriedAt = 0;

    async function seedSpot(tok) {
        if (seeded || seeding) return;
        const now = dayjs();
        if (now.hour() * 60 + now.minute() < 9 * 60 + 16) return;
        if (Date.now() - seedTriedAt < 30000) return;
        seedTriedAt = Date.now();
        seeding = true;
        try {
            const from = dayjs().hour(9).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
            const to = dayjs().format('YYYY-MM-DD HH:mm:ss');
            const rows = await kite.getHistoricalData(tok, 'minute', from, to);
            for (const b of rows) {
                const t = Math.floor(new Date(b.date).getTime() / 1000 / 60) * 60;
                spotOhlc.set(t, { time: t, open: b.open, high: b.high, low: b.low, close: b.close });
            }
            seeded = true;
            console.log(`🧭 coilWatch seeded ${spotOhlc.size} index minutes for token ${tok}`);
        } catch (e) {
            console.log('⚠️ coilWatch seed failed, will retry —', e.message || e);
        } finally { seeding = false; }
    }

    // live bars win over the seeded ones: they are ours and they are newer
    function refreshSpot(tok) {
        for (const b of minBarsFromSec(tok, 90)) spotOhlc.set(b.time, b);
    }

    function spotBars(n) {
        const keys = [...spotOhlc.keys()].sort((a, b) => a - b);
        return keys.slice(-n).map(k => spotOhlc.get(k));
    }

    /* --- option tape, split by side instead of folded together --- */
    function legsOf(type) {
        return chartedTokens().map(Number).filter(t => {
            const i = instByToken.get(t);
            return i && i.instrument_type == type;
        });
    }

    // per-minute INCREMENTAL volume, folded across the legs of one side,
    // forming minute excluded. partSeries stores the cumulative day volume,
    // so a missed minute is skipped rather than double-counted into the next.
    function sideVol(toks, nowMin, n) {
        const byMin = new Map();
        for (const tok of toks) {
            const a = partSeriesOf(tok) || [];
            for (let i = 1; i < a.length; i++) {
                const p = a[i - 1], c = a[i];
                if (c.min - p.min != 1) continue;
                if (c.min >= nowMin) continue;
                if (!(c.vol > 0 && p.vol > 0 && c.vol >= p.vol)) continue;
                byMin.set(c.min, (byMin.get(c.min) || 0) + (c.vol - p.vol));
            }
        }
        return [...byMin.keys()].sort((a, b) => a - b).slice(-n)
            .map(min => ({ min, vol: byMin.get(min) }));
    }

    // OI and price, folded across the legs of one side
    function sideOi(toks, n) {
        const byMin = new Map();
        for (const tok of toks) {
            for (const s of (oiSeriesOf(tok) || [])) {
                if (!(s.oi > 0)) continue;
                const r = byMin.get(s.min) || { min: s.min, oi: 0, pxSum: 0, pxN: 0 };
                r.oi += s.oi;
                if (s.ltp > 0) { r.pxSum += s.ltp; r.pxN++; }
                byMin.set(s.min, r);
            }
        }
        return [...byMin.keys()].sort((a, b) => a - b).slice(-n)
            .map(min => { const r = byMin.get(min); return { min, oi: r.oi, px: r.pxN ? r.pxSum / r.pxN : 0 }; });
    }

    /* --- state --- */
    let armed = null;               // {side, score, at, min, signs}
    let lastFireMin = 0, lastAlarmMin = 0, lastScanMin = 0;
    const history = [];             // the last few scores, for /api/coil

    function appendLog(row) {
        if (!logFile) return;
        try {
            let rows = [];
            try { rows = JSON.parse(fs.readFileSync(logFile, 'utf8')); } catch { }
            rows.push(row);
            fs.writeFileSync(logFile, JSON.stringify(rows.slice(-readCfg().logMax), null, 1));
        } catch (e) { console.log('⚠️ coilLog write failed', e.message || e); }
    }

    /*
    Score one side. Pulled out so both get read with identical code -- a
    down day must be the exact mirror of an up day, not a second
    implementation that drifts away from the first.
    */
    function scoreSide(side, bars, nowMin) {
        const ce = legsOf('CE'), pe = legsOf('PE');
        const own = side == 'up' ? ce : pe;
        const opp = side == 'up' ? pe : ce;
        return readSigns({
            bars,
            ownVol: sideVol(own, nowMin, 120),
            oppVol: sideVol(opp, nowMin, 120),
            /*
            ownOi is read off ONE leg -- the leg we would actually buy --
            and not folded like the others. The sign is "OI is building
            while this contract's price stands still", and an average price
            across legs cannot stand still: the near-ATM leg doubles while
            the far one sits at 3.20, so the folded price always shows a big
            move and the sign can never pass. Measured on 05/11, the folded
            version read 140-350% price movement at every minute and scored
            zero all day; per-leg is what the study actually measured.
            */
            ownOi: sideOi(own.slice(0, 1), 90),
            oppOi: sideOi(opp, 90),
            side,
        }, readCfg());
    }

    /*
    Build the row the autopilot already knows how to execute. Same shape as
    checkSetups() publishes, with `kind: 'coil'`. The stop comes from
    plannedStop() off the real 3-candle breach low, exactly as a clicked
    entry would -- this file does not invent a stop.
    */
    async function buildRow({ side, tok, inst, ltp, sc, rel, nowMin }) {
        const gset = readGuardSettings();
        const lv = await computeLevels(tok).catch(() => null);
        const ps = plannedStop(ltp, lv, gset, breachFromSec(tok, 3));
        const res = lv ? pickResistance(lv, ltp, gset, null) : null;
        const target = res ? res.price : null;
        const rr = (target && ps.stop < ltp) ? +((target - ltp) / (ltp - ps.stop)).toFixed(2) : null;
        const g = noTradeChecks({ premium: ltp, tradingsymbol: inst.tradingsymbol });

        return {
            at: dayjs().format('YYYY-MM-DD HH:mm:ss'), date: dayjs().format('YYYY-MM-DD'),
            min: nowMin, token: Number(tok), tradingsymbol: inst.tradingsymbol,
            exchange: inst.exchange,
            kind: 'coil', side,
            level: null, touches: null,          // a coil has no level and no touches -- see autoPilot
            what: `coil released: ${sc.score}/${sc.max} signs [${sc.passed.join(', ')}], ${rel.why}`,
            ltp: +Number(ltp).toFixed(2),
            stop: ps.stop, stopWhy: ps.why,
            riskPerUnit: +(ltp - ps.stop).toFixed(2),
            target, rr,
            verdict: g.blocked ? 'BLOCKED' : 'TAKE',
            blockers: g.blocked ? g.blockers.map(b => b.label) : [],
            score: sc.score, scoreMax: sc.max, signs: sc.passed,
            release: { x: rel.x, rng: rel.rng, med: rel.med, pos: rel.pos },
            regime: g.regime && g.regime.ok
                ? { eff: g.regime.eff, chop: g.regime.chop, bias: g.regime.bias } : null,
        };
    }

    /*
    Called off every tick. Does real work only on the first tick of a new
    minute -- the signs are all built from completed minute bars, so running
    this more often would only re-read the same numbers.
    */
    async function onTick(token, ltp) {
        const cfg = readCfg();
        if (!cfg.enabled) return;

        const spot = spotToken();
        if (!spot) return;
        if (Number(token) != spot) return;        // one scan per minute, driven off the index tick

        if (!seeded) { seedSpot(spot); return; }  // next minute, with history behind us

        const nowMin = Math.floor(Date.now() / 60000);
        if (lastScanMin == nowMin) return;
        lastScanMin = nowMin;

        refreshSpot(spot);
        const bars = spotBars(150);
        if (bars.length < cfg.minBars) return;

        /* score both ways and take the stronger; a tie is no signal at all */
        const u = scoreSide('up', bars, nowMin);
        const d = scoreSide('down', bars, nowMin);
        const sc = u.score == d.score ? null : (u.score > d.score ? u : d);

        history.push({ min: nowMin, up: u.score, down: d.score });
        if (history.length > 240) history.shift();

        if (!sc || sc.score < cfg.armScore) {
            if (armed) {
                console.log(`🧭 coil DISARMED (${armed.side}): score fell to `
                    + `${sc ? sc.score : Math.max(u.score, d.score)}/${u.max}`);
                armed = null;
            }
            return;
        }

        /* ---- ARM: the alarm, and nothing else ---- */
        const fresh = !armed || armed.side != sc.side;
        if (fresh) {
            armed = { side: sc.side, score: sc.score, at: Date.now(), min: nowMin, signs: sc.passed };
            const lines = sc.signs.filter(s => s.pass).map(s => `• ${s.key}: ${s.detail}`);
            console.log(`🧭 COIL ARMED ${sc.side.toUpperCase()} ${sc.score}/${sc.max}`
                + ` — [${sc.passed.join(', ')}]`);
            for (const s of sc.signs) console.log(`   ${s.pass ? '✓' : '·'} ${s.key}: ${s.detail}`);
            if (nowMin - lastAlarmMin >= cfg.alarmCooldownMin) {
                lastAlarmMin = nowMin;
                alertPhone(`🧭 Coil ${sc.side} ${sc.score}/${sc.max}`,
                    `${sc.passed.join(', ')} — waiting for the expansion bar`,
                    { key: `coil-${sc.side}-${nowMin}` });
            }
            appendLog({
                at: dayjs().format('YYYY-MM-DD HH:mm:ss'), min: nowMin, event: 'armed',
                side: sc.side, score: sc.score, max: sc.max, signs: sc.passed,
                detail: sc.signs.map(s => ({ key: s.key, pass: s.pass, detail: s.detail })),
            });
            broadcast({ type: 'coil', event: 'armed', side: sc.side, score: sc.score, max: sc.max, signs: sc.passed });
        } else {
            armed.score = sc.score;
            armed.signs = sc.passed;
        }

        /* ---- FIRE: only on the release bar ---- */
        /*
        A long coil re-announces itself so the phone alarm does not go
        quiet on a setup that is still standing. It does NOT block the
        entry.

        This was first written as "an expansion more than armWindowMin
        after arming is a different move, so re-arm and skip this minute".
        Replayed on 05/11 that threw the trade away: the signs armed at
        13:06 and stayed above armScore at every single minute until the
        release at 13:37, which is 31 minutes, so the first and best
        expansion bar was spent on a re-arm and the entry slipped to the
        next bar -- 79221 instead of 79289 on the index, and a bar of the
        option's move. The reasoning was wrong anyway: the signs are
        re-read from scratch every minute and must still score fireScore
        at the release, so a coil that is still scoring is still the same
        setup, however long it has been coiled. The age is now only a
        reason to buzz the phone again.
        */
        const ageMin = nowMin - armed.min;
        if (ageMin >= cfg.armWindowMin) {
            armed.min = nowMin;
            console.log(`🧭 coil ${armed.side} still armed ${sc.score}/${sc.max}`
                + ` after ${ageMin} min — no expansion yet`);
            if (nowMin - lastAlarmMin >= cfg.alarmCooldownMin) {
                lastAlarmMin = nowMin;
                alertPhone(`🧭 Coil ${sc.side} still on ${sc.score}/${sc.max}`,
                    `${ageMin} min coiled — ${sc.passed.join(', ')}`,
                    { key: `coil-again-${sc.side}-${nowMin}` });
            }
        }
        if (sc.score < cfg.fireScore) return;
        if (nowMin - lastFireMin < cfg.cooldownMin) return;

        const rel = readRelease({ bars, side: sc.side }, cfg);
        if (!rel.ok) return;

        const type = sc.side == 'up' ? 'CE' : 'PE';
        const tok = legsOf(type)[0];
        if (!tok) { console.log(`🧭 coil ${sc.side} released but no ${type} leg is charted`); return; }
        const inst = instByToken.get(Number(tok));
        const px = ltpOf(Number(tok));
        if (!inst || !(px > 0)) { console.log(`🧭 coil ${sc.side} released but ${type} has no live price`); return; }

        lastFireMin = nowMin;
        const row = await buildRow({ side: sc.side, tok, inst, ltp: px, sc, rel, nowMin });

        console.log(`🚀 COIL RELEASE ${sc.side.toUpperCase()} → ${inst.tradingsymbol} @ ${row.ltp}`
            + ` — ${sc.score}/${sc.max} [${sc.passed.join(', ')}]`
            + ` — ${rel.why}`
            + ` — stop ${row.stop}${row.rr != null ? `, ${row.rr}R` : ', no target above'}`
            + ` — ${row.verdict}${row.blockers.length ? ': ' + row.blockers.join(' | ') : ''}`);

        alertPhone(`🚀 Coil released ${sc.side}`,
            `${inst.tradingsymbol} @ ${row.ltp} — ${sc.score}/${sc.max} signs, stop ${row.stop}`
            + (row.verdict == 'TAKE' ? '' : ` — BLOCKED: ${row.blockers.join(', ')}`),
            { key: `coilfire-${nowMin}` });

        appendLog({ ...row, event: 'released' });
        broadcast({ type: 'coil', event: 'released', ...row });
        armed = null;

        /* the order. autoPilot re-runs the gate on the live price, sizes with
           riskCappedQty and places the BUY; the guard takes it from there. */
        if (!cfg.trade) { console.log('🧭 coilWatch trade:false — alarm only, no order sent'); return; }
        if (!autoPilot) { console.log('🧭 coilWatch has no autopilot — alarm only'); return; }
        if (openCount() > 0) { console.log('🧭 coil release ignored: already holding'); return; }

        const out = await autoPilot.onSetup(row);
        if (out && out.action != 'skip' && out.action != 'off') {
            appendLog({ at: row.at, min: nowMin, event: 'order', tradingsymbol: row.tradingsymbol, ...out });
            broadcast({ type: 'coil', event: 'order', tradingsymbol: row.tradingsymbol, ...out });
        }
    }

    function status() {
        const cfg = readCfg();
        const spot = spotToken();
        const bars = spotBars(150);
        const nowMin = Math.floor(Date.now() / 60000);
        let u = null, d = null;
        if (spot && bars.length >= cfg.minBars) {
            u = scoreSide('up', bars, nowMin);
            d = scoreSide('down', bars, nowMin);
        }
        return {
            cfg, seeded, spotToken: spot, bars: bars.length,
            armed, lastFireMin: lastFireMin || null,
            up: u, down: d,
            release: (u || d) ? readRelease({ bars, side: (u && d && u.score >= d.score) ? 'up' : 'down' }, cfg) : null,
            history: history.slice(-60),
        };
    }

    return { onTick, status, readCfg, writeCfg, DEFAULTS };
}

module.exports = {
    createCoilWatch, readCfg, writeCfg,
    COIL_DEFAULTS: DEFAULTS, CFG_FILE,
    // exported for the replay harness
    readSigns, readRelease, ratioSeries, median, rollLow, rollHigh, pathOf,
};
