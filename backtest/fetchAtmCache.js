/*
Builds results/candles_atm.json: 1-minute candles (with OI) for every strike
of the nearest listed expiry that came within STRIKES_AWAY strikes of
at-the-money on any day in the window, plus the underlying index's own minute
candles so ATM can be recomputed minute by minute. Read-only Kite calls.

Run:  node backtest/fetchAtmCache.js [days=59] [strikesAway=5]
*/
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const { KiteConnect } = require('kiteconnect');

const DAYS = Number(process.argv[2] || 59);
const STRIKES_AWAY = Number(process.argv[3] || 5);
const API_GAP_MS = 700; // shared 3 req/s historical limit with the live guards

const UNDERLYINGS = {
  NIFTY: { index: 'NSE:NIFTY 50', step: 50 },
  SENSEX: { index: 'BSE:SENSEX', step: 100 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ist = (d) => new Date(new Date(d).getTime() + 330 * 60000);
const istDay = (d) => ist(d).toISOString().slice(0, 10);
const minuteIndex = (d) => { const x = ist(d); return x.getUTCHours() * 60 + x.getUTCMinutes() - 555; };

function toBars(candles) {
  const days = {};
  for (const c of candles) {
    const day = istDay(c.date);
    (days[day] ||= []).push({ i: minuteIndex(c.date), o: c.open, h: c.high, l: c.low, c: c.close, v: c.volume, oi: c.oi || 0 });
  }
  return days;
}

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const n = new Date();
  const today = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  const tok = await mongoose.connection.db.collection('accesstockens').findOne({ date: today });
  const kite = new KiteConnect({ api_key: process.env.api_key, access_token: tok.access_token });

  const from = `${istDay(new Date(Date.now() - DAYS * 86400000))} 09:15:00`;
  const to = `${istDay(new Date())} 15:30:00`;
  const out = { strikesAway: STRIKES_AWAY, underlyings: {}, index: {}, meta: {}, contracts: {} };

  const instruments = [...(await kite.getInstruments('NFO')), ...(await kite.getInstruments('BFO'))];
  const ltp = await kite.getLTP(Object.values(UNDERLYINGS).map((u) => u.index));

  for (const [name, u] of Object.entries(UNDERLYINGS)) {
    const indexToken = ltp[u.index].instrument_token;
    const indexDays = toBars(await kite.getHistoricalData(indexToken, 'minute', from, to));
    await sleep(API_GAP_MS);
    out.index[name] = indexDays;

    // Strike range the ATM +/- STRIKES_AWAY window ever covered in the period.
    let lo = Infinity, hi = -Infinity;
    for (const bars of Object.values(indexDays)) for (const b of bars) { lo = Math.min(lo, b.l); hi = Math.max(hi, b.h); }
    const minStrike = Math.floor(lo / u.step) * u.step - STRIKES_AWAY * u.step;
    const maxStrike = Math.ceil(hi / u.step) * u.step + STRIKES_AWAY * u.step;

    const opts = instruments.filter((i) => i.name === name && (i.instrument_type === 'CE' || i.instrument_type === 'PE'));
    const expiries = [...new Set(opts.map((i) => istDay(i.expiry)))].sort();
    const expiry = expiries.find((e) => e >= istDay(new Date()));
    const chain = opts.filter((i) => istDay(i.expiry) === expiry && i.strike >= minStrike && i.strike <= maxStrike);
    out.underlyings[name] = { step: u.step, expiry, minStrike, maxStrike, contracts: chain.length };
    console.log(`${name}: index ${lo}-${hi}, expiry ${expiry}, strikes ${minStrike}-${maxStrike}, ${chain.length} contracts`);

    let k = 0;
    for (const inst of chain) {
      try {
        const candles = await kite.getHistoricalData(inst.instrument_token, 'minute', from, to, false, true);
        const days = toBars(candles);
        // Keep only the days this strike was actually within range of ATM.
        for (const [day, bars] of Object.entries(days)) {
          const idx = indexDays[day];
          if (!idx) continue;
          const near = idx.some((b) => Math.abs(inst.strike - Math.round(b.c / u.step) * u.step) <= STRIKES_AWAY * u.step);
          if (near) (out.contracts[inst.instrument_token] ||= {})[day] = bars;
        }
        out.meta[inst.instrument_token] = {
          symbol: inst.tradingsymbol, name, strike: inst.strike, type: inst.instrument_type,
          lot: inst.lot_size, exchange: inst.exchange, step: u.step,
        };
      } catch (e) {
        console.log(`  skip ${inst.tradingsymbol}: ${e.message}`);
        if (/Too many/i.test(e.message)) await sleep(2000);
      }
      await sleep(API_GAP_MS);
      if (++k % 25 === 0) console.log(`  ${name} ${k}/${chain.length}`);
    }
  }

  fs.writeFileSync(`${__dirname}/results/candles_atm.json`, JSON.stringify(out));
  console.log('saved results/candles_atm.json');
  process.exit(0);
}

main().catch((e) => { console.error('FAILED:', e); process.exit(1); });
