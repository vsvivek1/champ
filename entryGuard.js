
/*

Independent entry strategy -- separate process from stopLossGuard.js, sharing
no runtime state with it. The two only ever meet on the exchange: this script
places a BUY, and stopLossGuard.js's order_update handler picks up that fill
and places the protective SL on its own.

Strategy: short-covering on the option itself, matching how this was done
manually -- watch the specific option you'd actually buy, not the underlying
future. For each underlying listed in the `envprice` file, scan its
nearest-expiry CE+PE chain for strikes (either side) currently priced inside
the [low, high] band configured for that symbol, and check each matching
strike's OWN open interest and price: OI dropping while its premium rises is
short covering in that exact contract, bullish for it specifically --
applies the same way to a put as to a call, since it's a bet on that
contract's own premium, not a directional call on the underlying. The OI
drop is measured as the (highest - lowest) OI over a lookback window of
minute candles, not candle-to-candle, since the drop can happen anywhere in
that window (start, middle, or as one continuous slide) and a candle-to-
candle check would miss all but the single steepest minute. Volume on the
latest candle must also be running above its recent average, so the move
has real participation behind it and isn't a thin-book wiggle. When more
than one strike in the band qualifies (either type), the one with the
strongest OI drop is picked.

That candidate is then watched tick-by-tick (not just on the next REST poll)
so the entry fires against a live price, not a quote that may already be
stale by the time the order reaches the exchange.

Before placing money on it, an AI gate (Claude, via the Anthropic API) reviews
the numeric signal and can veto the entry. If ANTHROPIC_API_KEY isn't set, or
the call fails for any reason, the gate fails CLOSED -- no entry -- since
skipping a trade costs nothing but a bad one costs money.

ENTRY_DRY_RUN (env var, default true): when not explicitly set to "false",
every step above still runs (including the AI gate) but the actual
kite.placeOrder call is skipped and replaced with a log line, so the whole
pipeline can be watched against the real market before it risks money.

*/

console.log("🚀 entryGuard starting", new Date().toISOString());
console.log("CWD:", process.cwd());

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED PROMISE REJECTION');
    console.error('Reason:', reason);
    console.error('Promise:', promise);

    if (reason instanceof Error) {
        console.error(reason.stack);
    } else {
        console.error(JSON.stringify(reason, null, 2));
    }
});

process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION');
    console.error(err.stack || err);
});

const path = require('path');
const fs = require('fs').promises;
const dayjs = require('dayjs');
const Anthropic = require('@anthropic-ai/sdk');

const { connectToDatabase } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');
const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');

const ENV_PRICE_FILE = path.join(__dirname, 'envprice');
const TICK = 0.05;

const OPTION_EXCHANGES = ['NFO', 'BFO'];

// How many trailing 1-minute candles the OI-drop / price-up / volume signal
// looks across. The OI drop is the (highest - lowest) OI anywhere in this
// window, not candle-to-candle, so a drop that started several candles ago
// or one that's been sliding continuously is caught the same way.
const OI_LOOKBACK = 10;
const OI_DROP_THRESHOLD_PCT = 3;      // matches the "STRONG" tier used elsewhere in this codebase
const VOLUME_MULTIPLIER = 1.2;        // latest candle's volume must beat its own recent average by this much

const CHECK_INTERVAL_MS = 60 * 1000;  // aligned to 1-minute candles

const DRY_RUN = process.env.ENTRY_DRY_RUN !== 'false';

const anthropicClient = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function roundToTick(value, tick = TICK) {
    return Math.round(value / tick) * tick;
}

/*
Parses lines of the form "SYMBOL LOW,HIGH" or "SYMBOL LOW,HIGH,PCT" into a
Map(symbol -> {low, high, pct}). pct is null when omitted, meaning "size the
entry off the full available margin" -- see computeEntryQuantity. Blank
lines and lines starting with # are ignored.
*/
function parseEnvPriceBands(raw) {

    const bands = new Map();

    for (const line of raw.split('\n')) {

        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [symbolRaw, rangeRaw] = trimmed.split(/\s+/, 2);
        if (!symbolRaw || !rangeRaw) continue;

        const [lowRaw, highRaw, pctRaw] = rangeRaw.split(',');
        const low = parseFloat(lowRaw);
        const high = parseFloat(highRaw);
        if (Number.isNaN(low) || Number.isNaN(high)) continue;

        let pct = null;
        if (pctRaw !== undefined) {
            const parsedPct = parseFloat(pctRaw);
            if (!Number.isNaN(parsedPct) && parsedPct > 0) {
                pct = Math.min(parsedPct, 100);
            }
        }

        bands.set(symbolRaw.toUpperCase(), {
            low: Math.min(low, high),
            high: Math.max(low, high),
            pct
        });
    }

    return bands;
}

async function loadEnvPriceBands() {
    try {
        const raw = await fs.readFile(ENV_PRICE_FILE, 'utf8');
        return parseEnvPriceBands(raw);
    } catch (err) {
        console.log(err, `❌ Failed reading ${ENV_PRICE_FILE}`);
        return new Map();
    }
}

// symbol -> nearest-expiry CE+PE option chain (both types together), sorted
// by strike ascending
const optionChainByUnderlying = new Map();

/*
Loads the instrument master once at startup and keeps only what's needed for
the symbols configured in envprice: each symbol's nearest-expiry option
chain, both CE and PE -- a put's own OI dropping while its premium rises is
short covering in that put, same buy signal as a call, just on the other
side. instrument_token is normalized to a Number here -- the instrument
master returns it as a string, while ticks/positions/orders return it as a
number, and leaving that mismatch in place would make every Map lookup
against a live tick silently miss.
*/
async function loadInstruments(kite, symbols) {

    const allInstruments = await kite.getInstruments();
    const today = dayjs().startOf('day');

    const optionsBySymbolExpiry = new Map();

    for (const inst of allInstruments) {

        if (!symbols.includes(inst.name)) continue;
        if (!OPTION_EXCHANGES.includes(inst.exchange)) continue;
        if (inst.instrument_type !== 'CE' && inst.instrument_type !== 'PE') continue;
        if (!inst.expiry || dayjs(inst.expiry).isBefore(today)) continue;

        inst.instrument_token = Number(inst.instrument_token);

        if (!optionsBySymbolExpiry.has(inst.name)) optionsBySymbolExpiry.set(inst.name, new Map());
        const byExpiry = optionsBySymbolExpiry.get(inst.name);
        const expiryKey = dayjs(inst.expiry).format('YYYY-MM-DD');
        if (!byExpiry.has(expiryKey)) byExpiry.set(expiryKey, []);
        byExpiry.get(expiryKey).push(inst);
    }

    for (const symbol of symbols) {

        const byExpiry = optionsBySymbolExpiry.get(symbol);

        if (byExpiry && byExpiry.size > 0) {
            const nearestExpiryKey = [...byExpiry.keys()].sort()[0];
            const chain = byExpiry.get(nearestExpiryKey)
                .sort((a, b) => a.strike - b.strike);
            optionChainByUnderlying.set(symbol, chain);
        } else {
            console.log(`⚠️ No option chain found for ${symbol}`);
        }
    }

    console.log(`Loaded ${optionChainByUnderlying.size} option chain(s)`);
}

/*
Computes the OI-drop / price-up / volume signal for one specific option
contract, off its own minute candles -- not the underlying future's. Returns
null if there isn't enough candle history yet.
*/
async function computeOptionSignal(kite, inst) {

    let candles;
    try {
        const today = dayjs().format('YYYY-MM-DD');
        candles = await kite.getHistoricalData(
            inst.instrument_token,
            'minute',
            `${today} 09:15:00`,
            dayjs().format('YYYY-MM-DD HH:mm:ss'),
            false,
            true
        );
    } catch (err) {
        console.log(err, `⚠️ failed to fetch historical data for ${inst.tradingsymbol}`);
        return null;
    }

    if (!candles || candles.length < OI_LOOKBACK + 1) return null;

    const recent = candles.slice(-OI_LOOKBACK);
    const highestOI = Math.max(...recent.map(c => c.oi));
    const lowestOI = Math.min(...recent.map(c => c.oi));
    const oiDropPct = highestOI > 0 ? ((highestOI - lowestOI) / highestOI) * 100 : 0;

    const priceUp = recent[recent.length - 1].close > recent[0].close;

    const avgVol = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;
    const lastVol = recent[recent.length - 1].volume;
    const volumeConfirmed = avgVol > 0 && lastVol >= avgVol * VOLUME_MULTIPLIER;

    const bullish = oiDropPct >= OI_DROP_THRESHOLD_PCT && priceUp && volumeConfirmed;

    return { oiDropPct, priceUp, avgVol, lastVol, bullish };
}

/*
Batch-quotes a symbol's CE chain to find every strike currently priced
inside [band.low, band.high], evaluates each match's own OI-drop signal, and
returns whichever qualifying strike has the strongest OI drop -- or null if
none in the band are bullish right now.
*/
async function findBullishOptionInBand(kite, band, chain) {

    const keys = chain.map(inst => `${inst.exchange}:${inst.tradingsymbol}`);

    let quotes;
    try {
        quotes = await kite.getQuote(keys);
    } catch (err) {
        console.log(err, `⚠️ failed to fetch quotes for option chain`);
        return null;
    }

    const inBand = chain
        .map(inst => ({ inst, ltp: quotes[`${inst.exchange}:${inst.tradingsymbol}`]?.last_price }))
        .filter(({ ltp }) => ltp != null && ltp >= band.low && ltp <= band.high);

    let best = null;

    for (const { inst, ltp } of inBand) {

        const signal = await computeOptionSignal(kite, inst);
        if (!signal) continue;

        console.log(
            `📊 ${inst.tradingsymbol}: OI drop ${signal.oiDropPct.toFixed(2)}% (need ${OI_DROP_THRESHOLD_PCT}%), ` +
            `price ${signal.priceUp ? 'up' : 'down'}, volume ${signal.lastVol.toFixed(0)} vs avg ${signal.avgVol.toFixed(0)} ` +
            `-- ${signal.bullish ? 'BULLISH' : 'no signal'}`
        );

        if (!signal.bullish) continue;
        if (!best || signal.oiDropPct > best.signal.oiDropPct) {
            best = { inst, ltp, signal };
        }
    }

    if (!best) return null;

    return {
        instrument_token: best.inst.instrument_token,
        tradingsymbol: best.inst.tradingsymbol,
        exchange: best.inst.exchange,
        instrument_type: best.inst.instrument_type,
        lot_size: best.inst.lot_size,
        strike: best.inst.strike,
        ltp: best.ltp,
        oiDropPct: best.signal.oiDropPct,
        priceUp: best.signal.priceUp,
        avgVol: best.signal.avgVol,
        lastVol: best.signal.lastVol
    };
}

// symbols that have already been entered today -- one shot per underlying
// per process run (this script is expected to be restarted daily, same as
// the rest of this codebase's trading scripts, so no date-rollover handling).
const alreadyEnteredToday = new Set();

// symbol -> currently-watched candidate's instrument_token
const watchedTokenBySymbol = new Map();

// instrument_token -> candidate details, read per-tick by evaluateCandidateTickForEntry
const watchedCandidates = new Map();

function clearWatchedCandidate(ticker, symbol) {
    const token = watchedTokenBySymbol.get(symbol);
    if (token == null) return;
    ticker.unsubscribe([token]);
    watchedTokenBySymbol.delete(symbol);
    watchedCandidates.delete(token);
}

/*
Points the live-tick watch at a candidate strike for entry confirmation. This
subscribe/unsubscribe churn is fine here -- unlike stopLossGuard.js's
position-tracking subscriptions, a superseded entry candidate was never an
open position, so dropping its subscription risks nothing.
*/
function watchCandidate(ticker, symbol, details) {

    const existingToken = watchedTokenBySymbol.get(symbol);

    if (existingToken === details.instrument_token) {
        watchedCandidates.set(existingToken, details); // refresh the signal snapshot
        return;
    }

    if (existingToken != null) {
        ticker.unsubscribe([existingToken]);
        watchedCandidates.delete(existingToken);
    }

    ticker.subscribe([details.instrument_token]);
    ticker.setMode(ticker.modeLTP, [details.instrument_token]);
    watchedTokenBySymbol.set(symbol, details.instrument_token);
    watchedCandidates.set(details.instrument_token, details);

    console.log(`📡 Watching ${details.tradingsymbol} for entry (premium ${details.ltp} in band)`);
}

/*
Periodic (1-minute-aligned) REST-side signal check: for each symbol in
envprice, finds whichever CE strike(s) are currently priced inside the
configured band and evaluates each one's own OI-drop + price-up + volume
signal, then starts watching the strongest bullish match tick-by-tick.
*/
async function checkEntrySignals(kite, ticker, bands) {

    for (const [symbol, band] of bands) {

        if (alreadyEnteredToday.has(symbol)) continue;

        const chain = optionChainByUnderlying.get(symbol);
        if (!chain) continue;

        const candidate = await findBullishOptionInBand(kite, band, chain);

        if (!candidate) {
            clearWatchedCandidate(ticker, symbol);
            continue;
        }

        watchCandidate(ticker, symbol, { ...candidate, symbol, band });
    }
}

/*
Asks Claude to sanity-check the numeric signal before real money is
committed. Fails CLOSED (no entry) on a missing API key, a refusal, or any
error -- skipping a trade costs nothing, a bad one costs money.
*/
async function confirmEntryWithAI(context) {

    if (!anthropicClient) {
        console.log('🤖 ANTHROPIC_API_KEY not set -- AI gate fails closed, skipping entry');
        return false;
    }

    const prompt =
        `An automated options-buying strategy wants to enter a trade. You only have the ` +
        `numeric signal below -- judge whether it's internally consistent and worth acting ` +
        `on, not whether it's a good idea in some broader market sense you can't see.\n\n` +
        `Underlying: ${context.symbol}\n` +
        `Candidate option: ${context.tradingsymbol} (${context.instrument_type})\n` +
        `Current premium: ${context.ltp} (target band ${context.band.low}-${context.band.high})\n` +
        `Proposed quantity: ${context.quantity} (${context.quantity / context.lot_size} lot(s)), ` +
        `estimated capital ~${(context.quantity * context.ltp).toFixed(0)}\n` +
        `OI drop over last ${OI_LOOKBACK} minutes: ${context.oiDropPct.toFixed(2)}% (threshold ${OI_DROP_THRESHOLD_PCT}%)\n` +
        `Price trend over the same window: ${context.priceUp ? 'up' : 'down'}\n` +
        `Latest minute volume: ${context.lastVol.toFixed(0)} vs ${OI_LOOKBACK}-minute average ${context.avgVol.toFixed(0)}\n\n` +
        `Reply with ONLY a JSON object, no other text: {"approve": true or false, "reason": "<one short sentence>"}`;

    try {

        const response = await anthropicClient.messages.create({
            model: 'claude-opus-5',
            max_tokens: 1024, // adaptive thinking shares this budget with the JSON reply -- 200 was tight enough to truncate the reply mid-JSON on a real live attempt
            thinking: { type: 'adaptive' },
            output_config: { effort: 'low' },
            messages: [{ role: 'user', content: prompt }]
        });

        if (response.stop_reason === 'refusal') {
            console.log(`🤖 AI gate refused for ${context.tradingsymbol}, failing closed`);
            return false;
        }

        const textBlock = response.content.find(b => b.type === 'text');
        if (!textBlock) {
            console.log(`🤖 AI gate returned no text for ${context.tradingsymbol}, failing closed`);
            return false;
        }

        const jsonText = textBlock.text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(jsonText);

        console.log(
            `🤖 AI gate for ${context.tradingsymbol}: ${parsed.approve ? 'APPROVE' : 'REJECT'} -- ${parsed.reason}`
        );

        return parsed.approve === true;

    } catch (err) {
        console.log(err, `❌ AI gate call failed for ${context.tradingsymbol}, failing closed`);
        return false;
    }
}

/*
Sizes the entry off live account margin rather than a fixed lot count:
band.pct% of available equity-segment funds if envprice specified a
percentage for this symbol, otherwise every available rupee. costPerUnit
should be the worst-case per-unit fill price (the marketable limit price,
not the raw LTP) so this never sizes past what the order could actually
debit. Rounds down to a whole number of lots; returns 0 if even one lot
isn't affordable.
*/
async function computeEntryQuantity(kite, candidate, costPerUnit) {

    let margins;
    try {
        margins = await kite.getMargins('equity');
    } catch (err) {
        console.log(err, `⚠️ failed to fetch margins for sizing ${candidate.tradingsymbol}`);
        return 0;
    }

    const availableFunds = margins?.net;
    if (!availableFunds || availableFunds <= 0) return 0;

    const pct = candidate.band.pct; // null -> deploy all available funds
    const budget = pct != null ? availableFunds * (pct / 100) : availableFunds;

    const lotCost = costPerUnit * candidate.lot_size;
    const lots = Math.floor(budget / lotCost);

    return lots * candidate.lot_size;
}

async function enterPosition(kite, candidate, ltp) {

    const price = roundToTick(ltp * 1.05); // marketable limit; also the worst-case cost basis used to size the entry

    const quantity = await computeEntryQuantity(kite, candidate, price);

    if (quantity < candidate.lot_size) {
        console.log(`⚠️ Insufficient available margin to buy even 1 lot of ${candidate.tradingsymbol} @ ~${price}, skipping`);
        return;
    }

    const approved = await confirmEntryWithAI({ ...candidate, ltp, quantity });
    if (!approved) {
        return;
    }

    const sizingNote = candidate.band.pct != null ? `${candidate.band.pct}% of margin` : 'max available margin';

    if (DRY_RUN) {
        console.log(
            `🧪 DRY-RUN: would BUY ${candidate.tradingsymbol} qty ${quantity} (${quantity / candidate.lot_size} lot(s)) @ ~${ltp} -- ` +
            `OI drop ${candidate.oiDropPct.toFixed(2)}%, price up, volume confirmed, sized at ${sizingNote}`
        );
        alreadyEnteredToday.add(candidate.symbol);
        return;
    }

    try {

        const orderIds = await placeOrderInFreezeChunks(kite, {
            exchange: candidate.exchange,
            tradingsymbol: candidate.tradingsymbol,
            transaction_type: 'BUY',
            quantity,
            order_type: 'LIMIT',
            price,
            product: 'NRML',
            validity: 'DAY'
        }, candidate.lot_size);

        console.log(
            `🚀 Entered ${candidate.tradingsymbol} qty ${quantity} (${quantity / candidate.lot_size} lot(s)) @ ${price} -- sized at ${sizingNote}. Order ID(s): ${orderIds.join(', ')}`
        );

        alreadyEnteredToday.add(candidate.symbol);

    } catch (err) {

        console.log(err, `❌ Entry order failed for ${candidate.tradingsymbol}`);
    }
}

// Guards against a burst of ticks re-triggering the same entry (AI call +
// order placement) while a previous attempt for that token is still in flight.
const entryInProgress = new Set();

// Ticks can arrive several times a second, and a rejected candidate's premium
// can sit inside the band for many ticks in a row -- without a cooldown that
// would fire a fresh AI API call (and, if approved, a fresh order attempt) on
// every single one of them. One attempt per token per cooldown window is enough.
const lastEntryAttemptAt = new Map();
const ENTRY_ATTEMPT_COOLDOWN_MS = 5000;

async function evaluateCandidateTickForEntry(kite, ticker, tick) {

    const candidate = watchedCandidates.get(tick.instrument_token);
    if (!candidate) return;

    if (alreadyEnteredToday.has(candidate.symbol)) {
        clearWatchedCandidate(ticker, candidate.symbol);
        return;
    }

    if (entryInProgress.has(tick.instrument_token)) return;

    const ltp = tick.last_price;
    if (!ltp) return;

    // Premium has drifted out of band since the last scan -- keep watching;
    // the next cycle will pick a different strike if this one no longer fits.
    if (ltp < candidate.band.low || ltp > candidate.band.high) return;

    const now = Date.now();
    const lastAttempt = lastEntryAttemptAt.get(tick.instrument_token) || 0;
    if (now - lastAttempt < ENTRY_ATTEMPT_COOLDOWN_MS) return;
    lastEntryAttemptAt.set(tick.instrument_token, now);

    entryInProgress.add(tick.instrument_token);

    try {
        await enterPosition(kite, candidate, ltp);
    } finally {
        entryInProgress.delete(tick.instrument_token);
    }
}

main();
async function main() {

    await connectToDatabase();
    const accessToken = await getTodaysAccessToken();
    const kite = await getKiteConnectInstance(accessToken);
    const ticker = await getTickerInstance(accessToken);

    const initialBands = await loadEnvPriceBands();
    if (initialBands.size === 0) {
        console.log(`⚠️ No entries configured in ${ENV_PRICE_FILE} -- nothing to watch yet`);
    }

    await loadInstruments(kite, [...initialBands.keys()]);

    ticker.connect();
    ticker.on('connect', () => console.log('🟢 Kite Ticker connected (entryGuard)'));
    ticker.on('ready', () => console.log('Ticker is ready (entryGuard)'));

    ticker.on('ticks', ticks => {
        for (const tick of ticks) {
            evaluateCandidateTickForEntry(kite, ticker, tick).catch(err => {
                console.log(err, `❌ evaluateCandidateTickForEntry error for token ${tick.instrument_token}`);
            });
        }
    });

    console.log(
        DRY_RUN
            ? '🧪 Running in DRY-RUN mode -- no real orders will be placed (set ENTRY_DRY_RUN=false to go live)'
            : '🔴 Running LIVE -- real BUY orders will be placed'
    );

    async function runCycle() {
        const bands = await loadEnvPriceBands();
        if (bands.size === 0) return;
        await checkEntrySignals(kite, ticker, bands);
    }

    runCycle(); // warm start, don't wait for the first interval tick

    setInterval(runCycle, CHECK_INTERVAL_MS);
}
