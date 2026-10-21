/*
Feed bridge -- turns the pm2 processes' console output into a short, readable
event feed in MongoDB (`feed` collection), which the phone app shows as a
timeline. Read-only with respect to trading: it only listens to pm2's log bus
and never touches Kite or the other scripts.

What gets posted: lines that start with an emoji (the scripts' own convention
for "this is an event"), minus known per-tick noise, plus pm2 process events
(crash / restart). The same message (numbers ignored) from the same process
is posted at most once per DEDUPE_MS so a 10 s loop can't flood the feed.
*/
require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const pm2 = require('/usr/local/lib/node_modules/pm2');
const mongoose = require('mongoose');
const { KiteConnect } = require('kiteconnect');

const SOURCES = ['server', 'stopLossGuard', 'entryGuard'];
const DEDUPE_MS = 10 * 60 * 1000;
const KEEP_DAYS = 7;

// Per-tick / per-scan chatter that would bury the real events.
const NOISE = [
  /no signal/i,
  /^📡 (Subscribed|Unsubscribed)/,
  /Current Name/,
  /pop option attaching/,
];

// Anything token-shaped (Kite access/request tokens are 32 alphanumerics)
// is masked before it leaves the server's logs.
const redact = (text) => text.replace(/\b[A-Za-z0-9]{32}\b/g, '••••');

const startsWithEmoji = (text) => /^\p{Extended_Pictographic}/u.test(text);

function levelOf(text) {
  if (/^(❌|💥|🔥)|error|failed|rejected/i.test(text)) return 'error';
  if (/^🧪 Running in/.test(text)) return 'info';
  if (/^(🚨|🧪|💰|🎯)|order id|placed|exit|buy|sell/i.test(text)) return 'trade';
  if (/^⚠️/.test(text)) return 'warn';
  return 'info';
}

const lastPosted = new Map();
function isDuplicate(source, text) {
  const key = source + '|' + text.replace(/\d+(\.\d+)?/g, '#');
  const now = Date.now();
  const prev = lastPosted.get(key);
  if (prev && now - prev < DEDUPE_MS) return true;
  lastPosted.set(key, now);
  if (lastPosted.size > 5000) lastPosted.clear();
  return false;
}

// ---------------------------------------------------------------------------
// Watchlist: what the bots are looking at right now, with LTP, for the strip
// at the top of the app's feed. Written to feed DB `watchlist`/_id "current".
//
// Prices come from REST getOHLC rather than a ticker: Kite allows 3 websocket
// connections per API key and stopLossGuard + entryGuard already hold two, so
// a third here could lock them out if server.js ever opens one too.
// ---------------------------------------------------------------------------
const WATCH = {
  pollMs: 3000,           // market hours
  idlePollMs: 60000,      // outside market hours
  scanTtlMs: 3 * 60000,   // drop a scanned strike not seen in the last 3 scans
  candidateTtlMs: 15 * 60000,
};
const INDEX_FOR = {
  NIFTY: 'NSE:NIFTY 50',
  BANKNIFTY: 'NSE:NIFTY BANK',
  FINNIFTY: 'NSE:NIFTY FIN SERVICE',
  MIDCPNIFTY: 'NSE:NIFTY MID SELECT',
  SENSEX: 'BSE:SENSEX',
};
const scanned = new Map();     // tradingsymbol -> { detail, signal, seen }
const candidates = new Map();  // tradingsymbol -> { detail, seen }
let positions = [];
let kite = null;
let kiteToken = null;

const optionExchange = (symbol) => /^(SENSEX|BANKEX)/.test(symbol) ? 'BFO' : 'NFO';

function isMarketHours(now = new Date()) {
  const ist = new Date(now.getTime() + 330 * 60000);
  const day = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 9 * 60 && mins <= 15 * 60 + 35;
}

// entryGuard's scan lines: "📊 NIFTY2692222950PE: OI drop 2.87% (need 3%), ... -- no signal"
function noteWatchLine(source, text) {
  if (source !== 'entryGuard') return;
  let m = text.match(/^📊 ([A-Z0-9]+): (.*)$/);
  if (m) {
    const detail = m[2].replace(/\s*--\s*no signal$/i, '');
    scanned.set(m[1], { detail, signal: !/no signal/i.test(m[2]), seen: Date.now() });
    return;
  }
  m = text.match(/^📡 Watching ([A-Z0-9]+) for entry/);
  if (m) candidates.set(m[1], { detail: 'entry candidate', seen: Date.now() });
}

async function refreshKite(db) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const doc = await db.collection('accesstockens').findOne({ date: today });
  if (!doc) { kite = null; return; }
  if (doc.access_token !== kiteToken) {
    kiteToken = doc.access_token;
    kite = new KiteConnect({ api_key: process.env.api_key, access_token: kiteToken });
  }
}

async function refreshPositions() {
  if (!kite) return;
  try {
    const { net } = await kite.getPositions();
    positions = net
      .filter((p) => p.quantity !== 0 && ['NFO', 'BFO'].includes(p.exchange))
      .map((p) => ({ exchange: p.exchange, symbol: p.tradingsymbol, qty: p.quantity, avg: p.average_price }));
  } catch (e) {
    console.error('positions refresh failed:', e.message);
  }
}

function underlyingsFromEnvprice() {
  try {
    return fs.readFileSync(__dirname + '/envprice', 'utf8')
      .split('\n')
      .map((l) => l.trim().split(/\s+/)[0])
      .filter((s) => s && !s.startsWith('#') && INDEX_FOR[s]);
  } catch (_) {
    return [];
  }
}

async function publishWatchlist(db) {
  const now = Date.now();
  for (const [k, v] of scanned) if (now - v.seen > WATCH.scanTtlMs) scanned.delete(k);
  for (const [k, v] of candidates) if (now - v.seen > WATCH.candidateTtlMs) candidates.delete(k);

  const items = [];
  const seen = new Set();
  const add = (item) => {
    if (seen.has(item.key)) return;
    seen.add(item.key);
    items.push(item);
  };
  for (const p of positions) {
    add({ key: `${p.exchange}:${p.symbol}`, symbol: p.symbol, role: 'position', source: 'stopLossGuard',
          detail: `qty ${p.qty} @ ${p.avg}`, qty: p.qty, avg: p.avg });
  }
  for (const [sym, c] of candidates) {
    add({ key: `${optionExchange(sym)}:${sym}`, symbol: sym, role: 'candidate', source: 'entryGuard', detail: c.detail });
  }
  for (const u of underlyingsFromEnvprice()) {
    add({ key: INDEX_FOR[u], symbol: u, role: 'index', source: 'market', detail: 'underlying' });
  }
  for (const [sym, s] of scanned) {
    add({ key: `${optionExchange(sym)}:${sym}`, symbol: sym, role: s.signal ? 'candidate' : 'scanning',
          source: 'entryGuard', detail: s.detail });
  }

  let error = null;
  if (kite && items.length) {
    try {
      const quotes = await kite.getOHLC(items.map((i) => i.key));
      for (const item of items) {
        const q = quotes[item.key];
        if (!q) continue;
        item.ltp = q.last_price;
        const prevClose = q.ohlc && q.ohlc.close;
        item.change_pct = prevClose ? ((q.last_price - prevClose) / prevClose) * 100 : null;
        if (item.role === 'position' && item.avg) item.pnl = (q.last_price - item.avg) * item.qty;
      }
    } catch (e) {
      error = e.message;
    }
  } else if (!kite) {
    error = "No access token for today yet";
  }

  await db.collection('watchlist').replaceOne(
    { _id: 'current' },
    { updated_at: new Date(), market_open: isMarketHours(), error, items },
    { upsert: true },
  );
}

function startWatchlist(db) {
  const tick = async () => {
    try {
      await refreshKite(db);
      // entryGuard's scan runs on minute boundaries and uses the same
      // per-API-key quote rate limit; stay out of its way for those seconds.
      if (new Date().getSeconds() >= 8) await publishWatchlist(db);
    } catch (e) {
      console.error('watchlist tick failed:', e.message);
    }
    setTimeout(tick, isMarketHours() ? WATCH.pollMs : WATCH.idlePollMs);
  };
  tick();
  refreshPositions();
  setInterval(refreshPositions, 15000);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
  const feed = mongoose.connection.db.collection('feed');
  await feed.createIndex({ time: -1 });
  await feed.createIndex({ time: 1 }, { expireAfterSeconds: KEEP_DAYS * 86400 });

  const post = (source, text, level) =>
    feed.insertOne({ time: new Date(), source, text, level })
      .catch((e) => console.error('feed insert failed:', e.message));

  startWatchlist(mongoose.connection.db);

  pm2.connect((err) => {
    if (err) { console.error('pm2 connect failed', err); process.exit(1); }
    pm2.launchBus((busErr, bus) => {
      if (busErr) { console.error('pm2 bus failed', busErr); process.exit(1); }

      const onLog = (packet) => {
        const source = packet.process && packet.process.name;
        if (!SOURCES.includes(source)) return;
        for (const raw of String(packet.data).split('\n')) {
          // pm2 --time prefixes "YYYY-MM-DDTHH:MM:SS: "
          const text = raw.replace(/^\d{4}-\d\d-\d\dT[\d:]+:\s*/, '').trim();
          if (!text || !startsWithEmoji(text)) continue;
          noteWatchLine(source, text);
          if (NOISE.some((re) => re.test(text))) continue;
          if (isDuplicate(source, text)) continue;
          post(source, redact(text).slice(0, 500), levelOf(text));
        }
      };
      bus.on('log:out', onLog);
      bus.on('log:err', onLog);

      bus.on('process:event', (packet) => {
        const source = packet.process && packet.process.name;
        if (!SOURCES.includes(source)) return;
        const messages = {
          exit: `💥 ${source} stopped`,
          restart: `🔁 ${source} restarted`,
          'restart overlimit': `🛑 ${source} keeps crashing -- pm2 gave up`,
        };
        const text = messages[packet.event];
        if (text && !isDuplicate(source, text)) {
          post(source, text, packet.event === 'restart' ? 'info' : 'error');
        }
      });

      console.log('📰 feedBridge listening to', SOURCES.join(', '));
      post('feedBridge', '📰 Feed started', 'info');
    });
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
