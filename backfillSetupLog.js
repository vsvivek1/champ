/*
Fill in what happened after every setup already on disk.

WHY

setupLog.json had 261 setups on it and not one result. scoreSetupLog now
stamps fwd5/fwd10/fwd15/fwd30 on each new row as it ages, but that only
helps from today onwards -- and today is 10 rows. The 251 older rows are
the only real memory this account has of 29/10, 02/11 and 05/11, and
without a result on them "this looks like a setup that worked before"
cannot be said honestly.

So fetch it. One minute-candle request per token per day (38 of them),
then read the close at setup minute + 5, +10, +15 and +30 off that day's
own bars. Same fields, same meaning, same arithmetic as the live scorer,
so a backfilled row and a live row are interchangeable afterwards.

RUN IT ONCE, after the market is closed:

    node backfillSetupLog.js            # fill what is missing
    node backfillSetupLog.js --dry      # say what it would do, write nothing
    node backfillSetupLog.js --force    # redo rows that already have results

Expired contracts are the known gap: the SENSEX 29/10 weeklies are gone
from Kite's history once they settle, and those rows stay unfilled. They
are reported, not hidden -- a memory with holes in it is fine as long as
you know where the holes are.
*/

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const { getKiteConnectInstance } = require('./getKiteConnectInstance.js');
const { ensureTodaysAccessToken } = require('./ensureAccessToken.js');
const { connectToDatabase, closeDatabaseConnection } = require('./connectToDatabase.js');

const FILE = path.join(__dirname, 'setupLog.json');
const HORIZONS = [5, 10, 15, 30];

// Kite allows 3 history calls a second; stay well under it
const GAP_MS = 400;

// how far past the wanted minute a bar may sit and still be used. An option
// with no trade in a minute has no bar at all, so a gap is normal; two
// minutes of slack keeps the sample and keeps the error small
const SLACK_MIN = 2;

const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function read() {
    try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
    catch (e) { console.log('❌ cannot read setupLog.json —', e.message); process.exit(1); }
}

function needsWork(r) {
    if (r.min == null || !r.token) return false;
    return FORCE || HORIZONS.some(h => r['fwd' + h] == null);
}

/*
The close of the bar at a given epoch minute, or the nearest bar after it
within the slack. Returns null rather than reaching further -- a price
from five minutes later is not the 5-minute forward price.
*/
function closeAt(byMin, wanted) {
    for (let m = wanted; m <= wanted + SLACK_MIN; m++) {
        if (byMin.has(m)) return byMin.get(m);
    }
    return null;
}

async function run() {
    /*
    The token lives in Mongo, so connect first. chartApp does this in its
    own startup; a one-off script has to do it for itself or
    getTodaysAccessToken sits there until mongoose gives up buffering.
    */
    const ok = await connectToDatabase();
    if (!ok) { console.log('❌ cannot reach MongoDB, so there is no session to read.'); process.exit(1); }

    const token = await ensureTodaysAccessToken();
    if (!token || token === -1) {
        console.log('❌ no Kite session, so no history. Run login.js first.');
        process.exit(1);
    }
    const kite = await getKiteConnectInstance(token);

    const rows = read();
    const todo = rows.filter(needsWork);
    if (!todo.length) {
        console.log('✅ every setup row already has its result. Nothing to do.');
        return;
    }

    // one history call per token per day, not per row
    const groups = new Map();
    for (const r of todo) {
        const key = r.date + '|' + r.token;
        if (!groups.has(key)) groups.set(key, { date: r.date, token: Number(r.token), symbol: r.tradingsymbol, rows: [] });
        groups.get(key).rows.push(r);
    }

    console.log(`📖 ${todo.length} setup rows without a result, across ${groups.size} token-days`
        + (DRY ? ' — DRY RUN, nothing will be written' : ''));

    let filled = 0, missed = 0;
    const gone = [];

    for (const g of groups.values()) {
        // the whole session, so one call covers every row of that day
        const from = `${g.date} 09:00:00`;
        const to = `${g.date} 15:45:00`;

        let bars = null;
        try {
            bars = await kite.getHistoricalData(g.token, 'minute', from, to);
        } catch (e) {
            gone.push(`${g.date} ${g.symbol} — ${e.message || e}`);
            await sleep(GAP_MS);
            continue;
        }
        await sleep(GAP_MS);

        if (!bars || !bars.length) {
            gone.push(`${g.date} ${g.symbol} — no bars came back`);
            continue;
        }

        const byMin = new Map();
        for (const b of bars) {
            byMin.set(Math.floor(new Date(b.date).getTime() / 60000), +Number(b.close).toFixed(2));
        }

        let gFilled = 0, gMissed = 0;
        for (const r of g.rows) {
            for (const h of HORIZONS) {
                const k = 'fwd' + h;
                if (!FORCE && r[k] != null) continue;
                const px = closeAt(byMin, Number(r.min) + h);
                if (px == null) { gMissed++; continue; }
                r[k] = px;
                r[k + 'Pct'] = +(((px - r.ltp) / r.ltp) * 100).toFixed(2);
                gFilled++;
            }
            // say where the number came from, so a backfilled row is never
            // mistaken for one the live scorer stamped at the time
            if (gFilled) r.fwdFrom = 'backfill';
        }
        filled += gFilled; missed += gMissed;
        console.log(`   ${g.date} ${g.symbol}: ${bars.length} bars → ${gFilled} filled, ${gMissed} with no bar`);
    }

    if (gone.length) {
        console.log(`\n⚠️  ${gone.length} token-days have no history left (expired contracts, most likely):`);
        for (const g of gone) console.log('   ' + g);
    }

    console.log(`\n${filled} forward prices filled, ${missed} minutes had no bar.`);

    if (DRY) { console.log('DRY RUN — setupLog.json untouched.'); return; }
    if (!filled) { console.log('Nothing filled, so setupLog.json is untouched.'); return; }

    const backup = FILE.replace(/\.json$/, `.before-backfill-${dayjs().format('YYYYMMDD-HHmmss')}.json`);
    fs.copyFileSync(FILE, backup);
    fs.writeFileSync(FILE, JSON.stringify(rows, null, 1));
    console.log(`✅ written. The old file is at ${path.basename(backup)} if this went wrong.`);
}

run()
    .catch(e => { console.log('❌ backfill failed —', e && e.message || e); process.exitCode = 1; })
    .finally(async () => {
        try { await closeDatabaseConnection(); } catch (e) { /* going away anyway */ }
        process.exit(process.exitCode || 0);
    });
