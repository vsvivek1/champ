/*
Finds every case in the cached backtest candles (results/candles.json) where
an option's price at least doubled within 10 minutes: from the close of
minute t, the high over minutes t+1..t+10 reaches >= 2x. Overlapping hits on
the same contract collapse into one event (the earliest start). Also records
what the 10 minutes BEFORE the start looked like, to look for a precursor.

Only covers contract-days in the cache, i.e. days on which the contract
traded inside the envprice band at some point. Starts below Rs 5 are skipped
(a 0.60 -> 1.20 "double" is just a couple of ticks).

Both the start and the peak minute must have traded volume (> 0), so a stale
last-traded price followed by one print doesn't count as a move.

--atm: scan results/candles_atm.json (strikes within N of at-the-money, both
sides) instead, and only count starts while the strike is within that range.

Run:  node backtest/findDoublers.js [multiple=2] [window=10] [--atm]
*/
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const { KiteConnect } = require('kiteconnect');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ATM = process.argv.includes('--atm');
const MULTIPLE = Number(args[0] || 2);
const WINDOW = Number(args[1] || 10);
const MIN_START = 5;

const hhmm = (i) => { const m = i + 555; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const pct = (a, b) => (b ? (a - b) / b * 100 : 0);

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const n = new Date();
  const today = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  const tok = await mongoose.connection.db.collection('accesstockens').findOne({ date: today });
  const kite = new KiteConnect({ api_key: process.env.api_key, access_token: tok.access_token });
  const names = new Map();
  for (const ex of ['NFO', 'BFO']) for (const i of await kite.getInstruments(ex)) names.set(String(i.instrument_token), i);

  const atmData = ATM ? JSON.parse(fs.readFileSync(`${__dirname}/results/candles_atm.json`, 'utf8')) : null;
  const cache = ATM ? atmData.contracts : JSON.parse(fs.readFileSync(`${__dirname}/results/candles.json`, 'utf8'));
  const atmOk = (token, day, i) => {
    if (!ATM) return true;
    const m = atmData.meta[token];
    const idx = atmData.index[m.name][day];
    const b = idx && idx.find((x) => x.i === i);
    if (!b) return false;
    return Math.abs(m.strike - Math.round(b.c / m.step) * m.step) <= atmData.strikesAway * m.step;
  };
  const events = [];
  let contractDays = 0;

  for (const [token, days] of Object.entries(cache)) {
    const inst = names.get(token) || (ATM && { tradingsymbol: atmData.meta[token].symbol, instrument_type: atmData.meta[token].type });
    for (const [day, bars] of Object.entries(days)) {
      contractDays++;
      let t = 0;
      while (t < bars.length - 1) {
        const start = bars[t];
        if (start.c < MIN_START || start.v <= 0 || !atmOk(token, day, start.i)) { t++; continue; }
        // Window is by clock minute, not bar count (illiquid strikes skip minutes).
        let peak = null;
        for (let k = t + 1; k < bars.length && bars[k].i - start.i <= WINDOW; k++) {
          if (bars[k].v > 0 && (!peak || bars[k].h > peak.h)) peak = { ...bars[k], k };
        }
        if (!peak || peak.h < start.c * MULTIPLE) { t++; continue; }

        const before = bars.filter((b) => b.i < start.i && b.i >= start.i - WINDOW);
        const b0 = before[0];
        const avgVolBefore = before.length ? before.reduce((a, b) => a + b.v, 0) / before.length : 0;
        const upTo = bars.slice(t, peak.k + 1);
        // Where did it close 30 minutes after the peak -- did the double hold?
        const after = bars.find((b) => b.i >= peak.i + 30) || bars[bars.length - 1];
        events.push({
          day,
          symbol: inst ? inst.tradingsymbol : token,
          type: inst ? inst.instrument_type : '?',
          start: hhmm(start.i),
          peakAt: hhmm(peak.i),
          mins: peak.i - start.i,
          from: start.c,
          to: peak.h,
          x: +(peak.h / start.c).toFixed(2),
          dayOpen: bars[0].o,
          vsOpen: +pct(start.c, bars[0].o).toFixed(1),
          prior10mPrice: b0 ? +pct(start.c, b0.c).toFixed(1) : null,
          prior10mOI: b0 ? +pct(start.oi, b0.oi).toFixed(1) : null,
          startVolX: avgVolBefore ? +(start.v / avgVolBefore).toFixed(1) : null,
          duringOI: +pct(peak.oi, start.oi).toFixed(1),
          duringVol: upTo.reduce((a, b) => a + b.v, 0),
          close30mAfterPeak: after.c,
          keptPct: +pct(after.c, start.c).toFixed(0),
        });
        t = peak.k + 1; // skip past this move
      }
    }
  }

  events.sort((a, b) => (a.day + a.start).localeCompare(b.day + b.start));
  fs.writeFileSync(`${__dirname}/results/doublers${ATM ? '_atm' : ''}.json`, JSON.stringify(events, null, 1));

  console.log(`${events.length} events where price went >= ${MULTIPLE}x within ${WINDOW} min (start >= Rs ${MIN_START}), across ${contractDays} contract-days\n`);
  console.log('day        start->peak  symbol               from ->   to   x    vsOpen prior10m(price/OI) volX  duringOI  30m-after-peak');
  for (const e of events) {
    console.log(
      `${e.day} ${e.start}->${e.peakAt} ${e.symbol.padEnd(20)} ${String(e.from).padStart(6)} -> ${String(e.to).padStart(6)} ${String(e.x).padEnd(4)} ` +
      `${String(e.vsOpen).padStart(6)}% ${String(e.prior10mPrice).padStart(7)}% / ${String(e.prior10mOI).padStart(6)}% ${String(e.startVolX).padStart(5)} ` +
      `${String(e.duringOI).padStart(7)}%   ${e.close30mAfterPeak} (${e.keptPct >= 0 ? '+' : ''}${e.keptPct}% vs start)`,
    );
  }

  // Precursor summary
  const med = (arr) => { const v = arr.filter((x) => x != null).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
  if (events.length) {
    console.log('\nMedian of the 10 minutes BEFORE the start:');
    console.log(`  price change ${med(events.map((e) => e.prior10mPrice))}% | OI change ${med(events.map((e) => e.prior10mOI))}% | start-minute volume ${med(events.map((e) => e.startVolX))}x avg`);
    console.log(`  start vs day open ${med(events.map((e) => e.vsOpen))}% | OI during the move ${med(events.map((e) => e.duringOI))}%`);
    const byDay = {};
    for (const e of events) byDay[e.day] = (byDay[e.day] || 0) + 1;
    console.log(`  days with events: ${Object.keys(byDay).length} -> ${Object.entries(byDay).map(([d, c]) => `${d.slice(5)}:${c}`).join(' ')}`);
    const types = { CE: 0, PE: 0 };
    for (const e of events) types[e.type] = (types[e.type] || 0) + 1;
    console.log(`  CE ${types.CE} | PE ${types.PE}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error('FAILED:', e); process.exit(1); });
