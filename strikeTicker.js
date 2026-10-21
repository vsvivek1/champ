/*
strikeTicker.js -- logs live tick data for NIFTY and SENSEX options 5 strikes
away from ATM (CE = ATM + 5*step, PE = ATM - 5*step), matching the
ATM+/-depth*step convention already used in optionSell.js. Each index's
nearest weekly expiry is used.

Every 15 minutes during market hours the spot price is re-checked and the
target strikes recomputed. If the underlying has moved enough that the
target CE/PE strikes changed, the NEW strikes are added to the live Kite
Ticker subscription -- nothing already subscribed is ever unsubscribed, so
older strikes keep ticking too (the running set only ever grows through the
day).

Pure data logging: places no orders, changes no other script's state. Holds
the 3rd (and last) of the account's 3 Kite websocket connections --
stopLossGuard and entryGuard hold the other two, so this must never be run
alongside anything else that also opens a KiteTicker.
*/

console.log("🚀 strikeTicker starting", new Date().toISOString());

process.on('unhandledRejection', (reason) => {
    console.error('🔥 UNHANDLED PROMISE REJECTION');
    console.error('Reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION');
    console.error(err.stack || err);
});

const dayjs = require('dayjs');
const mongoose = require('mongoose');

const { connectToDatabase } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');

const STEPS_AWAY = 5;
const CHECK_EVERY_MS = 15 * 60 * 1000; // 15 min, market hours
const IDLE_CHECK_MS = 60 * 1000;       // outside market hours, just wait

const INDEXES = {
    NIFTY: { name: 'NIFTY', spotSymbol: 'NSE:NIFTY 50', step: 50 },
    SENSEX: { name: 'SENSEX', spotSymbol: 'BSE:SENSEX', step: 100 },
};

function isMarketHours(now = new Date()) {
    const ist = new Date(now.getTime() + 330 * 60000);
    const day = ist.getUTCDay();
    const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
    return day >= 1 && day <= 5 && mins >= 9 * 60 && mins <= 15 * 60 + 35;
}

// indexKey -> nearest-expiry option chain, strike ascending
const optionChainByIndex = new Map();
// instrument_token (number) -> already subscribed this run; never removed
const subscribed = new Set();
// instrument_token (number) -> what to write alongside each tick for it
const tokenMeta = new Map();

let StrikeTick;

async function loadOptionChains(kite) {
    const allInstruments = await kite.getInstruments();
    const today = dayjs().startOf('day');

    for (const key of Object.keys(INDEXES)) {
        const cfg = INDEXES[key];
        const byExpiry = new Map();

        for (const inst of allInstruments) {
            if (inst.name !== cfg.name) continue;
            if (inst.instrument_type !== 'CE' && inst.instrument_type !== 'PE') continue;
            if (!inst.expiry || dayjs(inst.expiry).isBefore(today)) continue;

            inst.instrument_token = Number(inst.instrument_token);

            const expiryKey = dayjs(inst.expiry).format('YYYY-MM-DD');
            if (!byExpiry.has(expiryKey)) byExpiry.set(expiryKey, []);
            byExpiry.get(expiryKey).push(inst);
        }

        const nearestKey = [...byExpiry.keys()].sort()[0];
        if (!nearestKey) {
            console.log(`⚠️ No option chain found for ${key}`);
            continue;
        }
        optionChainByIndex.set(key, byExpiry.get(nearestKey));
        console.log(`Loaded ${key} chain for expiry ${nearestKey} (${byExpiry.get(nearestKey).length} contracts)`);
    }
}

function findStrike(chain, strike, type) {
    return chain.find(i => i.strike === strike && i.instrument_type === type);
}

async function evaluateAndSubscribe(kite, ticker) {
    for (const key of Object.keys(INDEXES)) {
        const cfg = INDEXES[key];
        const chain = optionChainByIndex.get(key);
        if (!chain) continue;

        let ltp;
        try {
            const q = await kite.getLTP([cfg.spotSymbol]);
            ltp = q[cfg.spotSymbol] && q[cfg.spotSymbol].last_price;
        } catch (err) {
            console.log(`⚠️ LTP fetch failed for ${key}: ${err.message}`);
            continue;
        }
        if (!ltp) continue;

        const atm = Math.round(ltp / cfg.step) * cfg.step;
        const targets = [
            { strike: atm + STEPS_AWAY * cfg.step, type: 'CE', leg: 'ce' },
            { strike: atm - STEPS_AWAY * cfg.step, type: 'PE', leg: 'pe' },
        ];

        for (const target of targets) {
            const inst = findStrike(chain, target.strike, target.type);
            if (!inst) {
                console.log(`⚠️ ${key} ${target.type} strike ${target.strike} not found in loaded chain`);
                continue;
            }
            if (subscribed.has(inst.instrument_token)) continue;

            subscribed.add(inst.instrument_token);
            tokenMeta.set(inst.instrument_token, {
                tradingsymbol: inst.tradingsymbol,
                index: key,
                leg: `${key.toLowerCase()}_${target.leg}`,
                expiry: dayjs(inst.expiry).format('YYYY-MM-DD'),
                strike: inst.strike,
            });

            ticker.subscribe([inst.instrument_token]);
            ticker.setMode(ticker.modeFull, [inst.instrument_token]); // full mode for OI
            console.log(`📡 Now tracking ${inst.tradingsymbol} (${key} ${target.type}, strike ${inst.strike}, spot ${ltp})`);
        }
    }
}

async function main() {
    await connectToDatabase();

    StrikeTick = mongoose.model('StrikeTick', new mongoose.Schema({
        instrument_token: Number,
        tradingsymbol: String,
        index: String,   // 'NIFTY' | 'SENSEX'
        leg: String,     // 'nifty_ce' | 'nifty_pe' | 'sensex_ce' | 'sensex_pe'
        expiry: String,  // 'YYYY-MM-DD'
        strike: Number,
        ltp: Number,
        volume: Number,
        oi: Number,
        time: { type: Date, default: Date.now },
    }), 'strikeTicks');

    const accessToken = await getTodaysAccessToken();
    const kite = await getKiteConnectInstance(accessToken);
    const ticker = await getTickerInstance(accessToken);

    await loadOptionChains(kite);

    ticker.on('connect', () => {
        console.log('🟢 Kite Ticker connected (strikeTicker)');
        tick(); // first strike check only once the socket is actually up
    });
    ticker.on('ready', () => console.log('Ticker is ready (strikeTicker)'));
    ticker.on('error', err => console.log('❌ ticker error (strikeTicker):', err));
    ticker.on('close', () => console.log('🔌 ticker closed (strikeTicker)'));

    ticker.on('ticks', ticks => {
        const docs = [];
        for (const t of ticks) {
            const meta = tokenMeta.get(t.instrument_token);
            if (!meta) continue;
            docs.push({
                instrument_token: t.instrument_token,
                tradingsymbol: meta.tradingsymbol,
                index: meta.index,
                leg: meta.leg,
                expiry: meta.expiry,
                strike: meta.strike,
                ltp: t.last_price,
                volume: t.volume_traded,
                oi: t.oi,
                time: new Date(),
            });
        }
        if (docs.length) {
            StrikeTick.insertMany(docs).catch(err => console.log('❌ tick insert failed:', err.message));
        }
    });

    let started = false;
    async function tick() {
        if (started && !isMarketHours()) {
            setTimeout(tick, IDLE_CHECK_MS);
            return;
        }
        started = true;
        try {
            await evaluateAndSubscribe(kite, ticker);
        } catch (err) {
            console.log('❌ evaluateAndSubscribe failed:', err.message);
        }
        setTimeout(tick, isMarketHours() ? CHECK_EVERY_MS : IDLE_CHECK_MS);
    }

    ticker.connect();
}

main().catch(err => { console.error(err); process.exit(1); });
