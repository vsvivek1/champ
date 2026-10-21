/*
Backtest of entryGuard.js (entries) + stopLossGuard.js (exits) on Kite's
1-minute history (with OI) for the nearest listed expiry of each envprice
underlying. Read-only: only instrument/historical/margin reads, no orders.

Replays, per minute:
  entry  -- strikes whose close is inside the envprice band; signal over the
            last OI_LOOKBACK candles of the day: (maxOI-minOI)/maxOI >= 3%,
            close[last] > close[first], lastVol >= 1.2 x avgVol. Strongest OI
            drop wins; bought at the next minute's open if still in band.
            One open position per underlying; capital shared, all-in sizing
            (whole lots at open*1.05, like computeEntryQuantity).
  exit   -- initial SL = min low of last 3 candles (clamped a tick below
            entry); target lock at +10% (SL trails to entry + 65% of peak
            gain); give-back exit at 35% of peak gain; in-profit exit on a
            break of the prior 3-candle low; 2-minute stall tightens SL to the
            3-candle low. Unclosed positions exit at the 15:29 close.

Limits (minute bars, not ticks): within a bar the high is assumed to come
before the low, which is pessimistic for the give-back rule and roughly how
tick noise behaves; the AI gate is not replayed (every signal is taken).

Variant A = rules exactly as deployed (give-back from any peak gain).
Variant B = give-back only once the peak gain is >= MIN_GAIN_FOR_GIVEBACK.
Variant C = no give-back exit at all (stop-loss, target lock, 3-candle low only).

Each variant is also run at a fixed 1 lot per trade with no compounding, so a
shrinking account doesn't cut the sample short.

Entry signals: orig = as deployed; strict3/strict5 = OI must actually fall
(peak OI before trough, latest OI in the bottom quarter of the range, >= 3%),
price up >= 3% / 5% over the window, last candle closing in the upper half of
its range, same volume rule. Each trade also records the raw price change 5,
15 and 30 minutes after entry, independent of the exit rules.

Fetched candles are cached in results/candles.json; pass --cached to reuse.

--atm: instead of the envprice premium band, trade strikes within N strikes of
at-the-money (both sides, CE and PE), from results/candles_atm.json built by
fetchAtmCache.js.

Run:  node backtest/backtestEntryGuard.js [days=59] [capital=1492.7]
*/
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const { KiteConnect } = require('kiteconnect');

const DAYS = Number(process.argv[2] || 59);
const START_CAPITAL = Number(process.argv[3] || 1492.7);

const OI_LOOKBACK = 10;
const OI_DROP_THRESHOLD_PCT = 3;
const VOLUME_MULTIPLIER = 1.2;
const TICK = 0.05;
const GIVE_BACK_FRACTION = 0.35;
const TARGET_PCT = 10;
const STALL_BARS = 2;
const MIN_GAIN_FOR_GIVEBACK = 0.05; // variant B: 5% of entry
const API_GAP_MS = 700;             // historical API is 3 req/s per key, shared with the live guards

let LOW_FIRST = false;
// --slip=X: X% worse fill on each side (bid-ask spread + stop slippage).
let SLIP = 0;
const round = (v) => Math.round(v / TICK) * TICK;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// All calendar maths in IST regardless of the server's own timezone.
const ist = (d) => new Date(new Date(d).getTime() + 330 * 60000);
const istDay = (d) => ist(d).toISOString().slice(0, 10);
const minuteIndex = (d) => { const x = ist(d); return x.getUTCHours() * 60 + x.getUTCMinutes() - (9 * 60 + 15); };

function readBands() {
  const bands = new Map();
  for (const line of fs.readFileSync(__dirname + '/../envprice', 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [sym, range] = t.split(/\s+/);
    const [low, high] = range.split(',').map(Number);
    bands.set(sym, { low, high });
  }
  return bands;
}

// Zerodha F&O option charges for one round trip (buy + sell).
function charges(buyPx, sellPx, qty, exchange) {
  const buyT = buyPx * qty;
  const sellT = sellPx * qty;
  const brokerage = 40; // flat Rs 20 per executed option order
  const stt = 0.001 * sellT;
  const txnRate = exchange === 'BFO' ? 0.000325 : 0.0003503;
  const txn = txnRate * (buyT + sellT);
  const sebi = (buyT + sellT) * 10 / 1e7;
  const gst = 0.18 * (brokerage + txn + sebi);
  const stamp = 0.00003 * buyT;
  return brokerage + stt + txn + sebi + gst + stamp;
}

// "<mode>+open" = same signal, but only while the option trades above its own
// opening price for the day.
// Deterministic RNG so the random baseline is repeatable run to run.
let rngState = 42;
const rng = () => ((rngState = (rngState * 1103515245 + 12345) % 2147483648) / 2147483648);

function signalFor(mode, recent, dayOpen, t) {
  // Baseline: a random in-band strike every 20 minutes -- what an option
  // buyer gets from time decay and noise alone, with no signal at all.
  if (mode === 'random') return { ok: t % 20 === 5, oiDrop: rng() };
  // Contrarian: option has sold off (below its open, down >= 3%/5% over the
  // window) while OI builds in order, and the last candle closes in its upper
  // half -- buy the bounce instead of the breakout.
  if (mode === 'dip3' || mode === 'dip5') {
    const oi = recent.map((b) => b.oi);
    const hi = Math.max(...oi);
    const lo = Math.min(...oi);
    const oiRise = lo > 0 ? (hi - lo) / lo * 100 : 0;
    const risesInOrder = oi.indexOf(lo) < oi.lastIndexOf(hi);
    const last = recent[recent.length - 1];
    const dropPct = (recent[0].c - last.c) / recent[0].c * 100;
    const avgVol = recent.reduce((a, b) => a + b.v, 0) / recent.length;
    const volOk = avgVol > 0 && last.v >= avgVol * VOLUME_MULTIPLIER;
    const bounce = last.h === last.l || last.c >= last.l + (last.h - last.l) * 0.5;
    return {
      ok: dropPct >= (mode === 'dip5' ? 5 : 3) && last.c < dayOpen && oiRise >= OI_DROP_THRESHOLD_PCT
        && risesInOrder && last.oi >= hi - (hi - lo) * 0.25 && bounce && volOk,
      oiDrop: dropPct,
    };
  }
  if (mode.endsWith('+open')) {
    const sig = signalFor(mode.slice(0, -5), recent, dayOpen, t);
    return { ...sig, ok: sig.ok && recent[recent.length - 1].c > dayOpen };
  }
  const oi = recent.map((b) => b.oi);
  const hi = Math.max(...oi);
  const lo = Math.min(...oi);
  const oiDrop = hi > 0 ? (hi - lo) / hi * 100 : 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const avgVol = recent.reduce((a, b) => a + b.v, 0) / recent.length;
  const volOk = avgVol > 0 && last.v >= avgVol * VOLUME_MULTIPLIER;
  if (mode === 'orig') {
    return { ok: oiDrop >= OI_DROP_THRESHOLD_PCT && last.c > first.c && volOk, oiDrop };
  }
  const minPriceUp = mode === 'strict5' ? 5 : 3;
  const fallsInOrder = oi.indexOf(hi) < oi.lastIndexOf(lo);
  const nearLow = last.oi <= lo + (hi - lo) * 0.25;
  const priceUpPct = (last.c - first.c) / first.c * 100;
  const strongClose = last.h === last.l || last.c >= last.l + (last.h - last.l) * 0.5;
  return {
    ok: oiDrop >= OI_DROP_THRESHOLD_PCT && fallsInOrder && nearLow && priceUpPct >= minPriceUp && strongClose && volOk,
    oiDrop,
  };
}

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const n = new Date();
  const today = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  const tok = await mongoose.connection.db.collection('accesstockens').findOne({ date: today });
  if (!tok) throw new Error('no access token for today');
  const kite = new KiteConnect({ api_key: process.env.api_key, access_token: tok.access_token });

  const ATM = process.argv.includes('--atm');
  LOW_FIRST = process.argv.includes('--low-first');
  SLIP = Number((process.argv.find((a) => a.startsWith('--slip=')) || '--slip=0').slice(7)) / 100;
  const bands = ATM ? new Map() : readBands();
  const instruments = [
    ...(await kite.getInstruments('NFO')),
    ...(await kite.getInstruments('BFO')),
  ];

  const from = new Date(Date.now() - DAYS * 86400000);
  const fmt = istDay;

  // symbol -> { expiry, prevExpiry, contracts, byDay: Map(day -> [{inst, candles}]) }
  const universe = new Map();
  for (const [symbol, band] of bands) {
    const opts = instruments.filter(
      (i) => i.name === symbol && (i.instrument_type === 'CE' || i.instrument_type === 'PE'),
    );
    const expiries = [...new Set(opts.map((i) => fmt(new Date(i.expiry))))].sort();
    const expiry = expiries.find((e) => e >= fmt(new Date())) || expiries[0];
    const contracts = opts.filter((i) => fmt(new Date(i.expiry)) === expiry);
    universe.set(symbol, { band, expiry, contracts, byDay: new Map() });
    console.log(`${symbol}: nearest expiry ${expiry}, ${contracts.length} contracts, band ${band.low}-${band.high}`);
  }

  // Pass 1: fetch each contract's minute history; keep only the days on
  // which its close was ever inside the band (everything else can never be
  // a candidate, and keeping it would blow up memory).
  if (ATM) {
    const a = JSON.parse(fs.readFileSync(`${__dirname}/results/candles_atm.json`, 'utf8'));
    for (const [name, info] of Object.entries(a.underlyings)) {
      const idx = new Map(Object.entries(a.index[name]).map(([day, bars]) => [day, new Map(bars.map((b) => [b.i, b.c]))]));
      universe.set(name, { atm: { step: info.step, away: a.strikesAway, idx }, expiry: info.expiry, contracts: [], byDay: new Map() });
    }
    for (const [token, days] of Object.entries(a.contracts)) {
      const m = a.meta[token];
      const inst = { instrument_token: Number(token), tradingsymbol: m.symbol, strike: m.strike, lot_size: m.lot, exchange: m.exchange };
      const u = universe.get(m.name);
      for (const [day, bars] of Object.entries(days)) {
        if (!u.byDay.has(day)) u.byDay.set(day, []);
        u.byDay.get(day).push({ inst, bars, byIndex: new Map(bars.map((b, k) => [b.i, k])) });
      }
    }
    for (const [name, u] of universe) console.log(`${name}: ATM +/-${u.atm.away} strikes, expiry ${u.expiry}, ${u.byDay.size} days`);
  }
  const cacheFile = `${__dirname}/results/candles.json`;
  const useCache = process.argv.includes('--cached') && fs.existsSync(cacheFile);
  const cache = useCache ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
  let fetched = 0;
  const total = [...universe.values()].reduce((s, u) => s + u.contracts.length, 0);
  for (const [symbol, u] of universe) {
    if (u.atm) continue;
    for (const inst of u.contracts) {
      if (useCache) {
        for (const [day, bars] of Object.entries(cache[inst.instrument_token] || {})) {
          if (!u.byDay.has(day)) u.byDay.set(day, []);
          u.byDay.get(day).push({ inst, bars, byIndex: new Map(bars.map((b, k) => [b.i, k])) });
        }
        continue;
      }
      let candles = [];
      try {
        candles = await kite.getHistoricalData(
          inst.instrument_token, 'minute', `${fmt(from)} 09:15:00`, `${fmt(new Date())} 15:30:00`, false, true,
        );
      } catch (e) {
        if (/Too many/i.test(e.message)) { await sleep(2000); }
        console.log(`  skip ${inst.tradingsymbol}: ${e.message}`);
      }
      await sleep(API_GAP_MS);
      fetched++;
      if (fetched % 50 === 0) console.log(`  fetched ${fetched}/${total}`);

      const days = new Map();
      for (const c of candles) {
        const d = new Date(c.date);
        const key = istDay(d);
        if (!days.has(key)) days.set(key, []);
        days.get(key).push({ i: minuteIndex(d), o: c.open, h: c.high, l: c.low, c: c.close, v: c.volume, oi: c.oi });
      }
      for (const [day, bars] of days) {
        if (!bars.some((b) => b.c >= u.band.low && b.c <= u.band.high)) continue;
        if (!u.byDay.has(day)) u.byDay.set(day, []);
        u.byDay.get(day).push({ inst, bars, byIndex: new Map(bars.map((b, k) => [b.i, k])) });
        (cache[inst.instrument_token] ||= {})[day] = bars;
      }
    }
  }
  if (!useCache && !ATM) fs.writeFileSync(cacheFile, JSON.stringify(cache));

  // Is this strike tradeable at minute t? Band mode: premium inside the
  // envprice band. ATM mode: within `away` strikes of at-the-money.
  const eligible = (u, s, t, price, day) => {
    if (!u.atm) return price >= u.band.low && price <= u.band.high;
    const idx = u.atm.idx.get(day);
    const spot = idx && idx.get(t);
    if (spot == null) return false;
    const atmStrike = Math.round(spot / u.atm.step) * u.atm.step;
    return Math.abs(s.inst.strike - atmStrike) <= u.atm.away * u.atm.step;
  };

  const allDays = [...new Set([...universe.values()].flatMap((u) => [...u.byDay.keys()]))].sort();
  const results = {};

  const runs = [];
  const ENTRY_MODES = (process.argv.find((a) => a.startsWith('--entries=')) || '--entries=orig,strict3,strict5').slice(10).split(',');
  const EXIT_MODES = (process.argv.find((a) => a.startsWith('--exits=')) || '--exits=B,C').slice(8).split(',');
  for (const entryMode of ENTRY_MODES) for (const variant of EXIT_MODES) runs.push([variant, '1lot', entryMode]);
  for (const [variant, sizing, entryMode] of runs) {
    let capital = sizing === '1lot' ? 1e9 : START_CAPITAL;
    let peakCapital = capital;
    let maxDrawdown = 0;
    const trades = [];

    function closeTrade(p, rawExitPx, reason, t) {
      const exitPx = rawExitPx * (1 - SLIP);
      const gross = (exitPx - p.entry) * p.qty;
      const cost = charges(p.entry, exitPx, p.qty, p.inst.exchange);
      const net = gross - cost;
      capital += net;
      peakCapital = Math.max(peakCapital, capital);
      maxDrawdown = Math.max(maxDrawdown, peakCapital - capital);
      const hhmm = (i) => { const m = i + 555; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
      const fwd = (m) => {
        const k = p.series.byIndex.get(p.entryBar + m);
        return k == null ? null : +((p.series.bars[k].c - p.entry) / p.entry * 100).toFixed(2);
      };
      trades.push({
        f5: fwd(5), f15: fwd(15), f30: fwd(30),
        day: p.day, symbol: p.inst.tradingsymbol, qty: p.qty, entry: p.entry, exit: +exitPx.toFixed(2),
        in: hhmm(p.entryBar), out: hhmm(t), mins: t - p.entryBar, reason,
        pctMove: +((exitPx - p.entry) / p.entry * 100).toFixed(2),
        gross: +gross.toFixed(2), charges: +cost.toFixed(2), net: +net.toFixed(2), capital: +capital.toFixed(2),
      });
    }

    for (const day of allDays) {
      const open = new Map(); // symbol -> position
      for (let t = 0; t < 375; t++) {
        // ---- manage open positions on bar t ----
        for (const [symbol, p] of open) {
          const k = p.series.byIndex.get(t);
          if (k == null) continue;
          const bar = p.series.bars[k];
          const prev3 = p.series.bars.slice(Math.max(0, k - 3), k);
          const min3 = prev3.length ? Math.min(...prev3.map((b) => b.l)) : null;

          // --low-first: within a bar the low happens before the high, so exits
          // are checked against the stop as it stood BEFORE this bar's high
          // (no same-bar profit locking). Default is high-first.
          const updatePeak = () => {
            if (bar.h > p.peak) { p.peak = bar.h; p.peakBar = t; }
            if (!p.locked && (p.peak - p.entry) / p.entry * 100 >= TARGET_PCT) p.locked = true;
          };
          if (!LOW_FIRST) updatePeak();

          const levels = [];
          if (p.locked) {
            p.sl = Math.max(p.sl, round(p.entry + (p.peak - p.entry) * (1 - GIVE_BACK_FRACTION)));
            levels.push(['target-lock SL', p.sl]);
          } else {
            const maxGain = p.peak - p.entry;
            const gbArmed = variant === 'A' ? maxGain > 0
              : variant === 'B' ? maxGain >= p.entry * MIN_GAIN_FOR_GIVEBACK
              : false;
            if (gbArmed) levels.push(['give-back', p.peak - maxGain * GIVE_BACK_FRACTION]);
            levels.push(['stop-loss', p.sl]);
            if (min3 != null && min3 > p.entry && p.peak > p.entry) levels.push(['3-candle low', min3]);
          }
          // First level crossed on the way down from the high.
          const hit = levels.filter(([, lvl]) => bar.l <= lvl).sort((a, b) => b[1] - a[1])[0];
          if (hit) {
            const px = Math.min(hit[1], bar.o >= hit[1] ? hit[1] : bar.o);
            closeTrade(p, px, hit[0], t);
            open.delete(symbol);
            continue;
          }
          if (LOW_FIRST) {
            updatePeak();
            if (p.locked) p.sl = Math.max(p.sl, round(p.entry + (p.peak - p.entry) * (1 - GIVE_BACK_FRACTION)));
          }
          // Stall: no new high for STALL_BARS while in profit -> tighten SL.
          if (!p.locked && bar.c > p.entry && t - p.peakBar >= STALL_BARS && min3 != null) {
            p.sl = Math.max(p.sl, Math.min(min3, round(bar.c - TICK)));
          }
          if (t === 374 || k === p.series.bars.length - 1) {
            closeTrade(p, bar.c, 'end of day', t);
            open.delete(symbol);
          }
        }

        // ---- scan for entries at the close of bar t ----
        for (const [symbol, u] of universe) {
          if (open.has(symbol)) continue;
          const chain = u.byDay.get(day) || [];
          let best = null;
          for (const s of chain) {
            const k = s.byIndex.get(t);
            if (k == null || k < OI_LOOKBACK) continue; // live needs >= 11 candles
            const bar = s.bars[k];
            if (!eligible(u, s, t, bar.c, day)) continue;
            const recent = s.bars.slice(k - OI_LOOKBACK + 1, k + 1);
            const sig = signalFor(entryMode, recent, s.bars[0].o, t);
            if (sig.ok && (!best || sig.oiDrop > best.oiDrop)) best = { s, k, oiDrop: sig.oiDrop };
          }
          if (!best) continue;
          const next = best.s.bars[best.k + 1];
          if (!next || next.i !== t + 1) continue;
          if (!u.atm && !eligible(u, best.s, t + 1, next.o, day)) continue;
          const committed = [...open.values()].reduce((a, p) => a + p.entry * p.qty, 0);
          const lot = best.s.inst.lot_size;
          const lots = sizing === '1lot' ? 1 : Math.floor((capital - committed) / (round(next.o * 1.05) * lot));
          if (lots < 1) continue;
          const entry = next.o * (1 + SLIP);
          const prev = best.s.bars.slice(Math.max(0, best.k - 1), best.k + 1).map((b) => b.l);
          let sl = round(Math.min(...prev, entry));
          if (sl >= entry) sl = round(entry - TICK);
          open.set(symbol, {
            symbol, day, series: best.s, inst: best.s.inst, qty: lots * lot, entry, sl,
            peak: entry, peakBar: t + 1, locked: false, entryBar: t + 1, oiDrop: best.oiDrop,
          });
        }
      }
      for (const p of open.values()) {
        const last = p.series.bars[p.series.bars.length - 1];
        closeTrade(p, last.c, 'end of day', last.i);
      }
    }

    results[`${entryMode}-${variant}-${sizing}`] = { variant, sizing, entryMode, trades, capital, maxDrawdown };
  }

  // ---- report ----
  const lines = [];
  const u0 = [...universe.entries()].map(([s, u]) => `${s} ${u.expiry}${u.atm ? ` ATM+/-${u.atm.away}` : ''}`).join(', ');
  lines.push(`Backtest ${allDays[0]} .. ${allDays[allDays.length - 1]} (${allDays.length} trading days with in-band strikes)`);
  lines.push(`Chains: ${u0}. Start capital ${START_CAPITAL}. AI gate not replayed. Intrabar order: ${LOW_FIRST ? 'low first (conservative)' : 'high first'}. Slippage ${(SLIP * 100).toFixed(2)}% per side.`);
  const names = { A: 'rules as deployed', B: 'give-back only after +5%', C: 'no give-back' };
  for (const [key, r] of Object.entries(results)) {
    const variant = r.variant;
    const t = r.trades;
    const wins = t.filter((x) => x.net > 0);
    const grossWins = t.filter((x) => x.gross > 0);
    const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
    const byReason = {};
    for (const x of t) byReason[x.reason] = (byReason[x.reason] || 0) + 1;
    lines.push('');
    lines.push(`=== entry ${r.entryMode} + exit ${variant} (${names[variant]}) -- ${r.sizing === '1lot' ? '1 lot per trade, no compounding' : `account sizing from ${START_CAPITAL}`} ===`);
    const avgF = (f) => { const v = t.map((x) => x[f]).filter((x) => x != null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) + '%' : 'n/a'; };
    lines.push(`raw move after entry (ignoring exits): +5m ${avgF('f5')} | +15m ${avgF('f15')} | +30m ${avgF('f30')}`);
    lines.push(`trading days with a trade: ${new Set(t.map((x) => x.day)).size}`);
    lines.push(`trades ${t.length} | net winners ${wins.length} (${t.length ? (wins.length / t.length * 100).toFixed(0) : 0}%) | price winners ${grossWins.length}`);
    lines.push(`gross ${sum(t, (x) => x.gross).toFixed(0)} | charges ${sum(t, (x) => x.charges).toFixed(0)} | NET ${sum(t, (x) => x.net).toFixed(0)}`);
    lines.push(`avg move per trade ${(sum(t, (x) => x.pctMove) / (t.length || 1)).toFixed(2)}% | avg hold ${(sum(t, (x) => x.mins) / (t.length || 1)).toFixed(1)} min`);
    const avgWin = grossWins.length ? sum(grossWins, (x) => x.pctMove) / grossWins.length : 0;
    const losers = t.filter((x) => x.gross <= 0);
    const avgLoss = losers.length ? sum(losers, (x) => x.pctMove) / losers.length : 0;
    lines.push(`avg winner ${avgWin.toFixed(2)}% | avg loser ${avgLoss.toFixed(2)}% | avg charges/trade ${(sum(t, (x) => x.charges) / (t.length || 1)).toFixed(0)}`);
    if (r.sizing === 'account') lines.push(`capital ${START_CAPITAL} -> ${r.capital.toFixed(0)} | max drawdown ${r.maxDrawdown.toFixed(0)}`);
    else lines.push(`max drawdown ${r.maxDrawdown.toFixed(0)}`);
    lines.push(`exits: ${Object.entries(byReason).map(([k, v]) => `${k} ${v}`).join(', ')}`);
    fs.writeFileSync(`${__dirname}/results/trades_${key}.json`, JSON.stringify(t, null, 1));
  }
  const report = lines.join('\n');
  fs.writeFileSync(`${__dirname}/results/summary.txt`, report + '\n');
  console.log('\n' + report);
  process.exit(0);
}

fs.mkdirSync(__dirname + '/results', { recursive: true });
main().catch((e) => { console.error('BACKTEST FAILED:', e); process.exit(1); });
