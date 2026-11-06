/*

mockAutoRun.js -- replay a day's setup fires through the autopilot, in
mock, and mark every trade it would have taken with its confidence score
and the money it would actually have made.

WHY

Two questions could not be answered before this file:

  1. Does the confidence score pick the fires that paid? A score that
     looks sensible and ranks badly is worse than no score at all.
  2. What did a blocked fire cost? "Max 8 trades a day" on 06/11/2026
     refused the 25450CE at 15:02, and the only way to find the price of
     that refusal is to take the trade on paper and see.

So this is not a backtest of a strategy. It is the SAME decision the
autopilot makes, on rows the app itself wrote, with the confidence score
allowed (or not allowed) to cross the soft rules -- and then the real
minute candles of that day decide the result, not a guess.

WHAT IS REAL AND WHAT IS ASSUMED

Real: the fires (setupLog.json, written live at the time), the stop (the
3-candle low the guard would have used), the partial target, the no-trade
blockers as they stood at that minute, the autopilot's own caps from
autoTrade.json, and every price after entry (Kite minute candles).

Assumed, and each one is on the conservative side:

  fill        at the row's own LTP. The autopilot sends a marketable
              limit at ltp x (1 + slipPct/100), so a real fill is this
              or a little worse.
  same bar    if a bar touches the stop AND the target, the stop is
              taken first. The candle does not say which came first.
  trail       after the partial, the stop moves to the entry price, and
              no further. The live guard trails to the highest cleared
              resistance, which is better than this -- so a winner here
              is understated, never overstated.
  square off  whatever is left is sold at the 15:20 close.
  size        maxLots x lot size, so charges are a real rupee number.
              riskCappedQty would often ask for less; charges per lot
              barely move with size, so the % is close either way.

RUN IT

    node mockAutoRun.js                     # today, score may break soft rules
    node mockAutoRun.js --date 2026-11-05
    node mockAutoRun.js --strict            # obey every rule, score only watches
    node mockAutoRun.js --lots 2

Writes mockAutoRun-<date>.md and .json next to this file. Nothing is
sent to any broker -- there is no order path in this file at all.

*/

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const conf = require('./confidence.js');
const charges = require('./charges.js');
const { getKiteConnectInstance } = require('./getKiteConnectInstance.js');
const { ensureTodaysAccessToken } = require('./ensureAccessToken.js');
const { connectToDatabase, closeDatabaseConnection } = require('./connectToDatabase.js');

const SETUP_FILE = path.join(__dirname, 'setupLog.json');
const AUTO_FILE = path.join(__dirname, 'autoTrade.json');
const CACHE_DIR = path.join(__dirname, 'backtest', 'mockbars');

const arg = (name, def = null) => {
    const i = process.argv.indexOf(name);
    return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const DATE = arg('--date', dayjs().format('YYYY-MM-DD'));
const STRICT = process.argv.includes('--strict');
/*
--all drops the one-at-a-time rules (maxOpen, the gap, the day cap) and
prices EVERY fire that clears the hard gate. Not a tradeable plan -- you
cannot hold eight positions on one account -- but it is the only way to
get a sample big enough to ask whether the score ranks the fires. The
default run keeps the rules and answers the other question: what the day
would actually have made.
*/
const ALL = process.argv.includes('--all');
const LOTS = Number(arg('--lots', null)) || null;
/*
HOW THE STOP IS CARRIED, because this one choice decides most of the
result and guessing it would be the easiest way to lie to ourselves.

  low3   (default) after every bar the stop moves up to one tick under
         the lowest low of the last 3 bars, never down. That is the same
         rule the live guard uses to place the stop in the first place,
         so carrying it forward is the closest honest model of a trail
         without the resistance ladder the live app keeps in memory.
  entry  after the partial fills the stop goes to the entry price and
         stays there. The old, far too tight model: it turns every
         runner into a +2% scratch, which is exactly what it did to the
         25450CE on 06/11/2026.
  none   the first stop never moves.

The live guard trails to the highest CLEARED resistance level, which sits
somewhere between low3 and none. So low3 is a floor on a winner, not a
ceiling.
*/
const TRAIL = arg('--trail', 'low3');
const TICK = 0.05;
const SQUARE_OFF = 15 * 60 + 20;        // 15:20, the same minute the guard squares off
const GAP_MS = 400;                     // Kite allows 3 history calls a second

const sleep = ms => new Promise(r => setTimeout(r, ms));
const mins = t => { const m = String(t).match(/(\d{2}):(\d{2})/); return m ? +m[1] * 60 + +m[2] : null; };

/*
The blockers were written as sentences for a human to read, so they have
to be read back into codes. One pattern per gate; anything unrecognised
is treated as HARD, because a blocker nobody can name is not one to
cross.
*/
const CODE_OF = [
    [/^Max \d+ trades a day/, 'cap'],
    [/^Max \d+ position/, 'open_count'],
    [/efficiency/, 'chop'],
    [/needs the index biased/, 'wrongway'],
    [/No entry 12:00|No entry \d\d:\d\d.\d\d:\d\d/, 'lunch'],
    [/No entry after \d\d:\d\d/, 'late'],
    [/No entry before \d\d:\d\d/, 'open'],
    [/exit lockout|after a stop-out/, 'lock'],
    [/median body/, 'steep'],
    [/candle not red/, 'redcandle'],
    [/Size still in the tape/, 'dead'],
    [/1m volume/, 'thin'],
    [/since the last entry/, 'impulse'],
    [/rest a real stop/, 'guarded'],
    [/already holding this symbol/, 'same_symbol'],
    [/^Premium ₹/, 'premium'],
    [/^Option price/, 'minprice'],
    [/^Day loss/, 'dayloss'],
    [/losses in a row/, 'streak'],
];
const codeOf = text => (CODE_OF.find(([re]) => re.test(text)) || [null, 'unknown'])[1];

function readJson(f, fallback) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; }
}

/*
WHERE THE PRICES COME FROM, in order, because on a day when Kite cannot
be reached the replay still has to be able to price a trade honestly:

  1. backtest/mockbars cache -- a replay gets run again and again while
     the rules are being argued about, and Kite's history limit is not
     the thing that should decide how often.
  2. the running chartApp's own 5-second candles (/api/candles?tf=5s).
     Those are built from the live tick feed, not from history, so they
     work with the network down -- but only for strikes still charted
     and only as far back as the process has been up. Rolled up to
     minutes here so the simulation reads one kind of bar.
  3. Kite minute history, when there is a session.
  4. the fwd5/10/15/30 closes already on the setup row. Closes only, no
     highs and no lows, so a stop between two of them cannot be seen.
     Rows priced this way are marked `approx` in the report and must
     never be quoted as a result.
*/
const PORT = Number(process.env.CHART_PORT) || 3456;

function rollUpToMinutes(secBars) {
    const by = new Map();
    for (const c of secBars) {
        const m = Math.floor(c.time / 60);
        const b = by.get(m);
        if (!b) by.set(m, { min: m, hhmm: dayjs(m * 60000).format('HH:mm'), o: c.open, h: c.high, l: c.low, c: c.close, v: c.volume || 0 });
        else { b.h = Math.max(b.h, c.high); b.l = Math.min(b.l, c.low); b.c = c.close; b.v += c.volume || 0; }
    }
    return [...by.values()].sort((a, b) => a.min - b.min);
}

async function fromLiveApp(token) {
    try {
        const r = await fetch(`http://127.0.0.1:${PORT}/api/candles?token=${token}&tf=5s`, { signal: AbortSignal.timeout(8000) });
        if (!r.ok) return [];
        const a = await r.json();
        return Array.isArray(a) && a.length ? rollUpToMinutes(a) : [];
    } catch { return []; }
}

async function barsFor(kite, token, date) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    /*
    Two caches, kept apart on purpose. Kite history covers the whole
    session; the live feed covers only the part of the day that strike was
    charted. One file for both would let a half-day of feed bars stand in
    for history that is only a network outage away.
    */
    const kiteCache = path.join(CACHE_DIR, `${date}-${token}-kite.json`);
    const liveCache = path.join(CACHE_DIR, `${date}-${token}-live.json`);
    const hit = f => { const c = fs.existsSync(f) ? readJson(f, []) : []; return c.length ? c : null; };

    const fromKiteCache = hit(kiteCache);
    if (fromKiteCache) return { bars: fromKiteCache, src: 'kite minute (cached)' };

    if (date == dayjs().format('YYYY-MM-DD')) {
        const cached = hit(liveCache);
        const live = cached || (await fromLiveApp(token)).filter(b => b.hhmm >= '09:15' && b.hhmm <= '15:30');
        if (live.length) {
            if (!cached) fs.writeFileSync(liveCache, JSON.stringify(live));
            return { bars: live, src: cached ? 'live 5s feed (cached)' : 'live 5s feed' };
        }
    }

    if (kite) {
        try {
            const raw = await kite.getHistoricalData(Number(token), 'minute', `${date} 09:00:00`, `${date} 15:45:00`);
            await sleep(GAP_MS);
            const slim = (raw || []).map(b => ({
                min: Math.floor(new Date(b.date).getTime() / 60000),
                hhmm: dayjs(b.date).format('HH:mm'),
                o: +b.open, h: +b.high, l: +b.low, c: +b.close, v: b.volume || 0
            }));
            if (slim.length) { fs.writeFileSync(kiteCache, JSON.stringify(slim)); return { bars: slim, src: 'kite minute' }; }
        } catch (e) {
            console.log(`   ⚠️  no Kite history for ${token} — ${e.message || e}`);
        }
    }
    return { bars: [], src: null };
}

/*
Last resort: the forward closes the scorer already stamped. Four prices,
no highs, no lows.
*/
function barsFromFwd(r) {
    return [5, 10, 15, 30]
        .filter(h => r['fwd' + h] != null)
        .map(h => ({ min: Number(r.min) + h, hhmm: dayjs((Number(r.min) + h) * 60000).format('HH:mm'),
                     o: r['fwd' + h], h: r['fwd' + h], l: r['fwd' + h], c: r['fwd' + h], v: 0 }));
}

/*
Walk the day forward from the entry minute and let the candles decide.
Returns the exit legs, so the partial and the remainder are priced
separately the way they really are.
*/
function simulate({ bars, entryMin, entry, stop, target }) {
    const legs = [];
    let stopAt = stop, partialDone = false, held = 1;   // held as a share of the lot
    const seen = [];                                    // bars since entry, for the 3-candle low
    for (const b of bars) {
        if (b.min <= entryMin) continue;
        if (mins(b.hhmm) > SQUARE_OFF) break;

        if (b.l <= stopAt) {                            // stop first, always
            legs.push({ why: partialDone ? 'stop after partial' : 'stop', px: stopAt, share: held, at: b.hhmm, level: stopAt });
            held = 0;
            break;
        }
        if (!partialDone && target != null && b.h >= target) {
            legs.push({ why: 'partial at target', px: target, share: 0.5, at: b.hhmm });
            partialDone = true; held = 0.5;
            if (TRAIL == 'entry') stopAt = Math.max(stopAt, entry);
        }

        seen.push(b);
        if (TRAIL == 'low3' && seen.length >= 3) {
            const low3 = Math.min(...seen.slice(-3).map(x => x.l));
            stopAt = Math.max(stopAt, +(low3 - TICK).toFixed(2));
        }
    }
    if (held > 0) {
        const last = bars.filter(b => b.min > entryMin && mins(b.hhmm) <= SQUARE_OFF).pop();
        if (last) legs.push({ why: mins(last.hhmm) >= SQUARE_OFF - 1 ? 'squared off 15:20' : `sold at the last price on the feed (${last.hhmm})`, px: last.c, share: held, at: last.hhmm });
        else legs.push({ why: 'no bars after entry', px: entry, share: held, at: null });
    }
    const exit = legs.reduce((a, l) => a + l.px * l.share, 0) / legs.reduce((a, l) => a + l.share, 0);
    const high = Math.max(...bars.filter(b => b.min > entryMin && mins(b.hhmm) <= SQUARE_OFF).map(b => b.h), entry);
    return { legs, exit: +exit.toFixed(2), bestPct: +(((high - entry) / entry) * 100).toFixed(1) };
}

async function run() {
    const auto = readJson(AUTO_FILE, {});
    const kinds = auto.kinds || ['bounce', 'break', 'coil', 'speedgreen', 'holdlow'];
    const levelKinds = auto.levelKinds || ['bounce', 'break'];
    const minRR = auto.minRR ?? 1.5, minTouches = auto.minTouches ?? 2;
    const maxPerDay = auto.maxTradesPerDay ?? 6, maxOpen = auto.maxOpen ?? 1;
    const gapMin = auto.minGapMin ?? 3, lots = LOTS || auto.maxLots || 4;

    const rows = readJson(SETUP_FILE, []).filter(r => r.date == DATE)
        .sort((a, b) => String(a.at).localeCompare(String(b.at)));
    if (!rows.length) { console.log(`no setup rows for ${DATE}`); return; }

    /*
    Kite is WANTED, not required. The replay's job is to price trades, and
    the live app's own feed or the stamped forward closes can do that with
    the network down -- which is exactly the state this machine was in on
    the evening of 06/11/2026. So try for a session, say so if there is
    none, and carry on with whatever prices are to hand.
    */
    let kite = null;
    try {
        if (await connectToDatabase()) {
            const tok = await ensureTodaysAccessToken();
            if (tok && tok !== -1) kite = await getKiteConnectInstance(tok);
        }
    } catch (e) { /* reported below */ }
    if (!kite) console.log('⚠️  no Kite session — pricing from the live app feed and the stamped forward closes');

    console.log(`🤖 MOCK AUTO RUN ${DATE} — ${rows.length} fires, ${STRICT ? 'STRICT (no rule broken)' : 'confidence may cross the soft rules'}${ALL ? ', ALL (one-at-a-time rules off)' : ''}`);

    const taken = [], skipped = [];
    let openUntil = null, lastEntry = null;             // the one-position-at-a-time state

    for (const r of rows) {
        const at = mins(r.at);
        const c = conf.score(r);
        const row = { at: r.at, hhmm: r.at.slice(11, 16), symbol: r.tradingsymbol, kind: r.kind,
                      score: c.score, grade: c.grade, why: c.why, ltp: r.ltp, stop: r.stop, target: r.target };

        const say = reason => { skipped.push({ ...row, reason }); };

        if (!kinds.includes(r.kind)) { say(`kind ${r.kind} not armed`); continue; }
        if (at > SQUARE_OFF) { say('after 15:20 — nothing left to hold'); continue; }
        if (levelKinds.includes(r.kind)) {
            if (!(r.rr >= minRR)) { say(`R ${r.rr} under ${minRR}`); continue; }
            if (!(r.touches >= minTouches)) { say(`${r.touches} touches, needs ${minTouches}`); continue; }
        }
        if (!ALL && openUntil != null && at < openUntil) { say(`a position was still open (maxOpen ${maxOpen})`); continue; }
        if (!ALL && lastEntry != null && at - lastEntry < gapMin) { say(`${at - lastEntry} min since the last entry, needs ${gapMin}`); continue; }

        // the gate, as it stood at that minute, read back into codes
        const waived = new Set(r.waive || []);
        const live = (r.blockers || []).map(b => ({ text: b, code: codeOf(b) })).filter(b => !waived.has(b.code));
        const hard = live.filter(b => conf.UNBREAKABLE.includes(b.code) || !(b.code in conf.BREAKABLE));
        if (hard.length) { say('hard: ' + hard.map(b => b.text).join('; ')); continue; }
        const soft = live.filter(b => b.code in conf.BREAKABLE);
        const tooLow = soft.filter(b => STRICT || c.score < conf.BREAKABLE[b.code]);
        if (tooLow.length) {
            say(tooLow.map(b => `${b.code} needs ${conf.BREAKABLE[b.code]}, scored ${c.score}`).join('; '));
            continue;
        }
        // the autopilot's own day cap, crossed on the same terms as the gate's
        if (!ALL && taken.length >= maxPerDay && (STRICT || c.score < conf.BREAKABLE.cap)) {
            say(`autopilot cap ${maxPerDay} reached, scored ${c.score}`); continue;
        }

        let { bars, src } = await barsFor(kite, r.token, DATE);
        let approx = false;
        /*
        A bar is only usable if it comes AFTER the fire and before the
        square-off. A feed that starts at 15:25 says nothing about a 10:52
        entry, and a first usable bar more than 5 minutes late means the
        strike was not being charted then -- fall back to the stamped
        forward closes rather than price the trade off a hole.
        */
        const usable = bars.filter(b => b.min > Number(r.min) && mins(b.hhmm) <= SQUARE_OFF);
        if (!usable.length || usable[0].min > Number(r.min) + 5) {
            bars = barsFromFwd(r); src = 'fwd closes'; approx = true;
        }
        if (!bars.some(b => b.min > Number(r.min) && mins(b.hhmm) <= SQUARE_OFF)) {
            say('no prices after the fire to value it with'); continue;
        }
        const sim = simulate({ bars, entryMin: Number(r.min), entry: r.ltp, stop: r.stop, target: r.target });

        const lot = 75;                                  // NIFTY
        const qty = lot * lots;
        const rt = charges.roundTrip({ buy: r.ltp, sell: sim.exit, quantity: qty,
                                       exchange: r.exchange || 'NFO', buyOrders: 1,
                                       sellOrders: sim.legs.length });
        const grossPct = +(((sim.exit - r.ltp) / r.ltp) * 100).toFixed(2);
        const netPct = +((rt.net / (r.ltp * qty)) * 100).toFixed(2);

        taken.push({ ...row, crossed: soft.map(b => b.code), src, approx, exit: sim.exit,
                     legs: sim.legs, bestPct: sim.bestPct, qty,
                     grossPct, netRs: Math.round(rt.net), costRs: Math.round(rt.total), netPct,
                     exitAt: sim.legs[sim.legs.length - 1].at,
                     exitWhy: sim.legs.map(l => approx ? l.why.replace(/sold at the last price on the feed/, 'valued at the last stamped forward close') : l.why).join(' + ') });

        const lastAt = mins(sim.legs[sim.legs.length - 1].at || r.at) || at;
        openUntil = lastAt; lastEntry = at;
        const lastLeg = taken[taken.length - 1].exitWhy.split(' + ').pop();
        console.log(`   ✅ ${row.hhmm} ${r.tradingsymbol} ${r.kind} score ${c.score}`
            + (soft.length ? ` (crossed ${soft.map(b => b.code).join(',')})` : '')
            + ` → ${grossPct > 0 ? '+' : ''}${grossPct}% gross, ${netPct > 0 ? '+' : ''}${netPct}% net, out ${lastLeg} at ${sim.legs[sim.legs.length - 1].at}${approx ? ' (approx)' : ''}`);
    }

    report({ taken, skipped, rows, auto: { kinds, maxPerDay, maxOpen, gapMin, lots, minRR, minTouches } });
}

function report({ taken, skipped, rows, auto }) {
    const n = taken.length;
    const green = taken.filter(t => t.netPct > 0).length;
    const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
    const sumRs = taken.reduce((a, t) => a + t.netRs, 0);

    let md = `# Mock auto run — ${DATE}\n\n`;
    md += `${rows.length} fires on the log. ${STRICT ? 'STRICT: every rule obeyed.' : 'Confidence allowed to cross the soft rules.'}`;
    if (ALL) md += ` ALL: maxOpen, the entry gap and the day cap are off, so this is a ranking sample and not a tradeable day.`;
    md += ` Stop carried by ${TRAIL}.`;
    md += ` Armed kinds ${auto.kinds.join(', ')}; cap ${auto.maxPerDay}/day, maxOpen ${auto.maxOpen}, gap ${auto.gapMin} min, ${auto.lots} lots.\n\n`;
    md += `**${n} trades taken, ${green} green on net, median net ${med(taken.map(t => t.netPct)) ?? '-'}%, ₹${sumRs} all together on ${auto.lots} lots.**\n\n`;

    md += `## Trades\n\n|time|symbol|kind|score|grade|crossed|entry|stop|target|exit|out|best seen|gross %|net %|net ₹|prices|\n`;
    md += `|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const t of taken) {
        md += `|${t.hhmm}|${t.symbol}|${t.kind}|${t.score}|${t.grade}|${t.crossed.join(' ') || '-'}|${t.ltp}|${t.stop}|${t.target ?? '-'}|${t.exit}|${t.exitWhy} ${t.exitAt || ''}|+${t.bestPct}%|${t.grossPct > 0 ? '+' : ''}${t.grossPct}|${t.netPct > 0 ? '+' : ''}${t.netPct}|${t.netRs}|${t.src}${t.approx ? ' ⚠️ approx' : ''}|\n`;
    }

    md += `\n## Score against result\n\n|score band|trades|median net %|green %|\n|---|---|---|---|\n`;
    for (const [lo, hi, lab] of [[80, 101, '80+'], [65, 80, '65-79'], [50, 65, '50-64'], [0, 50, '<50']]) {
        const g = taken.filter(t => t.score >= lo && t.score < hi);
        md += `|${lab}|${g.length}|${g.length ? med(g.map(t => t.netPct)).toFixed(1) : '-'}|${g.length ? Math.round(100 * g.filter(t => t.netPct > 0).length / g.length) : '-'}|\n`;
    }

    md += `\n## Every fire it refused\n\n|time|symbol|kind|score|why not|\n|---|---|---|---|---|\n`;
    for (const s of skipped) md += `|${s.hhmm}|${s.symbol}|${s.kind}|${s.score}|${s.reason}|\n`;

    const base = path.join(__dirname, `mockAutoRun-${DATE}${STRICT ? '-strict' : ''}${ALL ? '-all' : ''}${TRAIL != 'low3' ? '-' + TRAIL : ''}`);
    fs.writeFileSync(base + '.md', md);
    fs.writeFileSync(base + '.json', JSON.stringify({ date: DATE, strict: STRICT, auto, taken, skipped }, null, 1));
    console.log(`\n${n} trades, ${green} green on net, median net ${med(taken.map(t => t.netPct)) ?? '-'}%, ₹${sumRs} total.`);
    console.log(`📄 ${path.basename(base)}.md`);
}

run()
    .catch(e => { console.log('❌ mock run failed —', e && e.message || e); process.exitCode = 1; })
    .finally(async () => {
        try { await closeDatabaseConnection(); } catch (e) { /* going away anyway */ }
        process.exit(process.exitCode || 0);
    });
