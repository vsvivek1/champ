/*

confidence.js -- one number for "how good is this fire?"

WHY

The no-trade gate answers yes or no. It has no way to say "this one is
much better than the last six". So the day cap, the lockout and the clock
treat the best fire of the day and the worst one exactly the same, and on
06/11/2026 the eighth trade closed at 14:30 and the 25450CE fires at
15:00-15:06 -- which ran +21% and +90% inside 30 minutes -- were refused
with the single line "Max 8 trades a day".

A score lets a rule be broken for a reason instead of by feel: a soft rule
(the day cap, the 15:10 clock) may be crossed only by a fire scoring above
a bar, and the hard money rules are never crossed at all.

WHAT IT IS MADE OF

Every factor below is something the app already knows at the moment of the
fire. Nothing here looks at fwd5/fwd15/fwd30 -- those are the marks, not
the inputs, and feeding them in would only produce a score that is right
about yesterday.

The weights started from the 88 scored fires of 06/11/2026 (setupLog.json,
fwd15Pct stamped by scoreSetupLog) and are kept small on purpose. One day
is one day. What that day said:

    kind        holdlow +24% median, speedgreen +23%, bounce +2%, break 0%
    stop width  10%+ wide stops +21% median, under 5% wide 0%
    touches     3+ touches +29% median, 1-2 touches ~0%
    rr          rr over 5 won 1 time in 7 -- a target that far is a wish
    chop        chopping index 45% green, trending 57%
    shapes      the 25700CE shape was 1 of 6 green before, and went 0%

So the score is deliberately dull: base 50, each factor worth a few
points, and a fire has to be good on SEVERAL counts to reach the bar. No
single factor can carry a trade on its own.

HOW TO READ IT

    80-100  rare. Several independent things agree.
    65-79   good. May cross a soft rule.
    50-64   ordinary. Take it only inside the normal rules.
    under 50 weak. The gate was right.

The score never places an order, never sizes one and never clears the
hard caps -- the day loss cap, the loss streak, an open position with no
resting SELL, the open-position limit, holding the same symbol, the price
and premium floors. Those stay the gate's business.

*/

/*
The soft rules a high score is allowed to cross, and the bar for each.
Separate numbers because they are not the same risk: taking a 9th trade
costs one more entry, while entering at 15:25 cannot be held overnight.
*/
const BREAKABLE = {
    cap: 72,        // "Max N trades a day"
    late: 68,       // "No entry after 15:10"
    lunch: 65,      // the lunch/low-volume window
    open: 70,       // "No entry before 09:20"
    lock: 85,       // the post-exit impulse lockout -- highest bar of the lot
};

/*
CONF_BARS lets a replay try different bars without editing this file --
e.g. CONF_BARS="cap=50,late=50" node mockAutoRun.js. It exists so a
proposed change can be measured before it is deployed, not so the bars
can drift in production: nothing in the live app sets it.
*/
if (process.env.CONF_BARS) {
    for (const part of process.env.CONF_BARS.split(',')) {
        const [k, v] = part.split('=').map(x => String(x).trim());
        if (k in BREAKABLE && Number(v) >= 0) BREAKABLE[k] = Number(v);
    }
}

// never, whatever the score says
const UNBREAKABLE = ['dayloss', 'streak', 'guarded', 'open_count',
    'same_symbol', 'premium', 'minprice'];

/*
score(f) -- f is the setup row plus whatever live extras are on hand.

    kind, ltp, riskPerUnit, touches, rr, tradingsymbol   (setup row)
    regime: { eff, chop, bias }                          (setup row)
    familiar: { trades: {n,wins,netSum}, shapes: {n,wins,medPct} }
    speed            optional, calcSpeed() ratio
    volMult          optional, this minute's volume / its own median
    at               'YYYY-MM-DD HH:mm:ss' or a Date, for the clock factor

Anything missing is simply not scored -- a missing input must never read
as a bad one, or a fresh restart would score every fire low.
*/
function score(f = {}) {
    const why = [];
    let s = 50;
    const add = (pts, text) => { if (pts) { s += pts; why.push((pts > 0 ? '+' : '') + pts + ' ' + text); } };

    // 1. which setup. The two that are defined by movement did best.
    const byKind = { holdlow: 12, speedgreen: 12, bounce: 4, break: 0, coil: 2 };
    if (f.kind in byKind) add(byKind[f.kind], f.kind);

    // 2. how far the 3-candle-low stop sits. A wide stop is not loose, it
    //    is the mark of an option that is actually travelling; a 2% stop is
    //    inside the noise and gets taken out by the next tick.
    const dist = f.ltp > 0 && f.riskPerUnit > 0 ? 100 * f.riskPerUnit / f.ltp : null;
    if (dist != null) {
        if (dist >= 10) add(8, `stop ${dist.toFixed(0)}% away — the option is moving`);
        else if (dist >= 5) add(3, `stop ${dist.toFixed(0)}% away`);
        else add(-4, `stop only ${dist.toFixed(1)}% away — inside the noise`);
    }

    // 3. touches. One touch is a line somebody drew, not a level.
    if (f.touches != null) {
        if (f.touches >= 3) add(6, `${f.touches} touches`);
        else if (f.touches <= 1) add(-3, 'one touch — that is a line, not a level');
    }

    // 4. the R. Useful in the middle. Over 5 means the target is so far
    //    that the number is arithmetic, not a plan.
    if (f.rr != null) {
        if (f.rr >= 1 && f.rr <= 3) add(4, `R ${f.rr}`);
        else if (f.rr > 5) add(-6, `R ${f.rr} — target too far to be real`);
    }

    // 5. speed, when the page has it
    if (f.speed != null) {
        if (f.speed >= 2) add(10, `${f.speed}x its own pace`);
        else if (f.speed >= 1.5) add(6, `${f.speed}x its own pace`);
        else if (f.speed < 0.8) add(-5, `${f.speed}x — dead bars`);
    }

    // 6. the index. Chop is where premium goes to die.
    const reg = f.regime || {};
    if (reg.chop === true) add(-6, 'index chopping');
    if (reg.eff != null && reg.eff >= 20 && reg.eff < 50) add(4, `index efficiency ${reg.eff}%`);

    // 7. does the side agree with the index bias
    const side = /PE$/.test(f.tradingsymbol || '') ? 'PE' : /CE$/.test(f.tradingsymbol || '') ? 'CE' : null;
    if (side && reg.bias) {
        const agree = (side == 'CE' && reg.bias == 'up') || (side == 'PE' && reg.bias == 'down');
        const against = (side == 'CE' && reg.bias == 'down') || (side == 'PE' && reg.bias == 'up');
        if (agree) add(5, `${side} with the ${reg.bias} bias`);
        else if (against) add(-5, `${side} against the ${reg.bias} bias`);
    }

    // 8. the record. Two layers, and the shape layer is the better one --
    //    it is the same setup, not just the same kind of option.
    const fam = f.familiar || {};
    const tr = fam.trades || {}, sh = fam.shapes || {};
    if (tr.n >= 5) add(tr.netSum > 0 ? 6 : -6,
        `${tr.n} past trades, net ₹${tr.netSum}`);
    if (sh.n >= 5) {
        const w = 100 * sh.wins / sh.n;
        if (w >= 50) add(8, `same shape ${sh.wins}/${sh.n} green`);
        else if (w < 25) add(-10, `same shape only ${sh.wins}/${sh.n} green`);
    }

    // 9. premium band. 15-25 is the only band with a positive median net
    //    over the 157 closed trades -- the reason is over premiumStrikes().
    if (f.ltp != null) {
        if (f.ltp >= 15 && f.ltp <= 25) add(3, `₹${f.ltp} in the measured band`);
        else if (f.ltp > 40) add(-3, `₹${f.ltp} — above the band`);
    }

    // 10. the clock. Not a block, a tilt: the first minutes are a spread
    //     coin flip and after 15:20 there is no room left to be right.
    const mins = clockMins(f.at);
    if (mins != null) {
        if (mins < 9 * 60 + 20) add(-5, 'first minutes of the day');
        else if (mins >= 12 * 60 && mins < 13 * 60 + 15) add(-4, 'lunch hours');
        else if (mins >= 15 * 60 + 20) add(-6, 'too late to let it run');
    }

    // 11. this minute's volume, when the page has it
    if (f.volMult != null) {
        if (f.volMult >= 1.5) add(5, `volume ${f.volMult.toFixed(1)}x its median`);
        else if (f.volMult < 0.5) add(-6, `volume ${f.volMult.toFixed(1)}x its median`);
    }

    s = Math.max(0, Math.min(100, Math.round(s)));
    return { score: s, grade: grade(s), why, breaks: canBreak(s) };
}

function clockMins(at) {
    if (!at) return null;
    if (at instanceof Date) return at.getHours() * 60 + at.getMinutes();
    const m = String(at).match(/(\d{2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function grade(s) {
    return s >= 80 ? 'rare' : s >= 65 ? 'good' : s >= 50 ? 'ordinary' : 'weak';
}

// which soft blockers this score is allowed to cross
function canBreak(s) {
    return Object.keys(BREAKABLE).filter(k => s >= BREAKABLE[k]);
}

/*
THE SAME RULES, AS DATA.

score() above is the truth. This table is what the RULES tab on the chart
page prints, so a rule can be read without opening this file. If a weight
changes up there, change it here in the same edit -- a table that disagrees
with the code is worse than no table.
*/
const FACTORS = [
    { n: 1, factor: 'which setup', test: 'holdlow or speedgreen', pts: 12, why: 'the two kinds defined by movement: +24% and +23% median on 06/11' },
    { n: 1, factor: 'which setup', test: 'bounce', pts: 4 },
    { n: 1, factor: 'which setup', test: 'coil', pts: 2 },
    { n: 1, factor: 'which setup', test: 'break', pts: 0 },
    { n: 2, factor: 'stop distance', test: '10% or more under entry', pts: 8, why: 'a wide 3-candle low is the mark of an option that is actually travelling' },
    { n: 2, factor: 'stop distance', test: '5-10% under entry', pts: 3 },
    { n: 2, factor: 'stop distance', test: 'under 5%', pts: -4, why: 'inside the noise — the next tick takes it out' },
    { n: 3, factor: 'touches', test: '3 or more', pts: 6, why: '3+ touches gave +29% median' },
    { n: 3, factor: 'touches', test: 'one touch', pts: -3, why: 'that is a line somebody drew, not a level' },
    { n: 4, factor: 'reward to risk', test: 'R between 1 and 3', pts: 4 },
    { n: 4, factor: 'reward to risk', test: 'R over 5', pts: -6, why: 'won 1 time in 7 — a target that far is a wish' },
    { n: 5, factor: 'speed', test: '2x its own pace or more', pts: 10 },
    { n: 5, factor: 'speed', test: '1.5x to 2x', pts: 6 },
    { n: 5, factor: 'speed', test: 'under 0.8x', pts: -5, why: 'dead bars' },
    { n: 6, factor: 'index regime', test: 'index chopping', pts: -6, why: 'chop 45% green vs trending 57%' },
    { n: 6, factor: 'index regime', test: 'efficiency 20-50%', pts: 4 },
    { n: 7, factor: 'side vs index bias', test: 'CE with an up bias, PE with a down bias', pts: 5 },
    { n: 7, factor: 'side vs index bias', test: 'against the bias', pts: -5 },
    { n: 8, factor: 'past record', test: '5+ past trades on this symbol, net positive', pts: 6 },
    { n: 8, factor: 'past record', test: '5+ past trades, net negative', pts: -6 },
    { n: 8, factor: 'past record', test: 'same shape 5+ times, half or more green', pts: 8, why: 'the better layer: same setup, not just the same kind of option' },
    { n: 8, factor: 'past record', test: 'same shape 5+ times, under 25% green', pts: -10 },
    { n: 9, factor: 'premium', test: '₹15-25', pts: 3, why: 'the only band with a positive median net over 157 closed trades' },
    { n: 9, factor: 'premium', test: 'over ₹40', pts: -3 },
    { n: 10, factor: 'clock', test: 'before 09:20', pts: -5, why: 'a spread coin flip' },
    { n: 10, factor: 'clock', test: '12:00-13:15', pts: -4 },
    { n: 10, factor: 'clock', test: '15:20 or later', pts: -6, why: 'no room left to be right' },
    { n: 11, factor: 'this minute volume', test: '1.5x its own median or more', pts: 5 },
    { n: 11, factor: 'this minute volume', test: 'under 0.5x its median', pts: -6 },
];

const GRADES = [
    { from: 80, to: 100, name: 'rare', what: 'several independent things agree' },
    { from: 65, to: 79, name: 'good', what: 'may cross a soft rule' },
    { from: 50, to: 64, name: 'ordinary', what: 'take it only inside the normal rules' },
    { from: 0, to: 49, name: 'weak', what: 'the gate was right' },
];

const BASE = 50;

module.exports = { score, grade, canBreak, BREAKABLE, UNBREAKABLE, FACTORS, GRADES, BASE };
