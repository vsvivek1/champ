
/*

targetGuard.js -- locks in a 2% profit target the moment a buy fills.

Places a resting SELL LIMIT order at entry_price * (1 + TARGET_PCT/100)
right after each option BUY completes, so the target lives on the
exchange (not dependent on this process staying up or watching ticks).

Runs independently of stopLossGuard.js (which manages the trailing SL).
The two are OCO'd via order_update: whichever one fills first (SL or
target), the *other* resting SELL order for that symbol gets cancelled,
so a stale order can't later fire and open an unintended short. Our own
orders are tagged TARGET_ORDER_TAG so stopLossGuard.js's "position
already covered" check can tell them apart from an actual SL order.

*/

console.log("🚀 targetGuard starting", new Date().toISOString());
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

const { connectToDatabase } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { getKiteConnectInstance, getTickerInstance } = require('./getKiteConnectInstance.js');

const { placeOrderInFreezeChunks } = require('./placeOrderInFreezeChunks.js');

const TICK = 0.05;
const TARGET_PCT = 2; // EDIT ME: profit % locked in immediately after a buy fills

// Tags every order this script places, so:
//  - stopLossGuard.js's coverage check can exclude our target orders
//    when deciding whether a position still needs an SL placed.
//  - this script can find/cancel its own resting order without mistaking
//    some other SELL LIMIT order (e.g. stopLossGuard's marketable exit) for it.
const TARGET_ORDER_TAG = 'TGT2PCT';

// Kite parks a resting order as "TRIGGER PENDING" (SL) or "OPEN" (LIMIT)
// until it fills.
const RESTING_ORDER_STATUSES = ["TRIGGER PENDING", "OPEN"];

const OPTION_EXCHANGES = ['NFO', 'BFO'];

const instrumentLotSizeByToken = new Map();

function roundToTick(value, tick = TICK) {
    return Math.round(value / tick) * tick;
}

/*
Places the 2% target SELL LIMIT order for a freshly bought position.
Called once when the entry order completes, and again by the periodic
safety net if a position is ever found without a resting target order.
*/
async function placeTargetOrder(kite, { instrument_token, tradingsymbol, exchange, quantity, buyPrice }) {

    const targetPrice = roundToTick(buyPrice * (1 + TARGET_PCT / 100));

    let targetOrderIds = await placeOrderInFreezeChunks(kite, {
        exchange: exchange || "NFO",
        tradingsymbol: tradingsymbol,
        transaction_type: "SELL",
        quantity: quantity,
        order_type: "LIMIT",
        price: targetPrice,
        product: "NRML",
        validity: "DAY",
        tag: TARGET_ORDER_TAG
    }, instrumentLotSizeByToken.get(instrument_token));

    console.log(
        `🎯 Target order(s) placed for ${tradingsymbol} at ${targetPrice} (buy ${buyPrice} + ${TARGET_PCT}%). Order ID(s): ${targetOrderIds.join(', ')}`
    );

    return targetOrderIds;
}

/*
Cancels any resting order of ours (tagged TARGET_ORDER_TAG) for a symbol.
Called when some other SELL order (almost always stopLossGuard's SL)
completes first and closes the position out from under our target.
*/
async function cancelOwnTargetOrder(kite, tradingsymbol, orders) {

    const ownOrders = orders.filter(
        o => o.tradingsymbol == tradingsymbol &&
            o.tag == TARGET_ORDER_TAG &&
            RESTING_ORDER_STATUSES.includes(o.status)
    );

    for (const order of ownOrders) {
        try {
            await kite.cancelOrder("regular", order.order_id);
            console.log(`🧹 Cancelled leftover target order ${order.order_id} for ${tradingsymbol} (position closed by another order)`);
        } catch (err) {
            console.log(err, `⚠️ Failed cancelling leftover target order ${order.order_id} for ${tradingsymbol}`);
        }
    }
}

/*
Periodic safety net: any open long option position that doesn't have a
resting target order (tagged TARGET_ORDER_TAG) gets one placed, based on
its current average_price.
*/
async function ensureTargetForOpenPositions(kite) {

    try {

        let positions = await kite.getPositions();

        let netPositions = (positions.net || []).filter(
            p => p.quantity > 0 && OPTION_EXCHANGES.includes(p.exchange)
        );

        if (netPositions.length == 0) {
            return;
        }

        let orders = await kite.getOrders();

        let symbolsAlreadyCovered = new Set(
            orders
                .filter(o => o.tag == TARGET_ORDER_TAG && RESTING_ORDER_STATUSES.includes(o.status))
                .map(o => o.tradingsymbol)
        );

        for (let position of netPositions) {

            if (symbolsAlreadyCovered.has(position.tradingsymbol)) {
                continue;
            }

            console.log(`⚠️ No resting target order for ${position.tradingsymbol}, placing one`);

            try {

                await placeTargetOrder(kite, {
                    instrument_token: position.instrument_token,
                    tradingsymbol: position.tradingsymbol,
                    exchange: position.exchange,
                    quantity: Math.abs(position.quantity),
                    buyPrice: position.average_price
                });

            } catch (err) {

                console.log(err, `❌ Failed placing target order for ${position.tradingsymbol}`);
            }
        }

    } catch (err) {

        console.log(err, "❌ ensureTargetForOpenPositions error");
    }
}

main();
async function main() {

    await connectToDatabase();
    let accessToken = await getTodaysAccessToken();

    let kite = await getKiteConnectInstance(accessToken);
    let ticker = await getTickerInstance(accessToken);

    try {
        const allInstruments = await kite.getInstruments();
        for (const inst of allInstruments) {
            const token = Number(inst.instrument_token);
            instrumentLotSizeByToken.set(token, inst.lot_size);
        }
        console.log(`Loaded lot-size data for ${instrumentLotSizeByToken.size} instruments`);
    } catch (err) {
        console.log(err, "❌ Failed loading instrument lot-size data");
    }

    ticker.connect();
    ticker.on("connect", () => {
        console.log("🟢 Kite Ticker connected (targetGuard)");
    });
    ticker.on("ready", () => {
        console.log("Ticker is ready (targetGuard)");
    });

    ticker.on("order_update", async orderUpdate => {

        let { instrument_token, status, transaction_type, tradingsymbol, quantity, exchange } = orderUpdate;

        if (status != "COMPLETE") {
            return;
        }

        if (!OPTION_EXCHANGES.includes(exchange)) {
            return;
        }

        if (transaction_type == "BUY") {

            try {

                await placeTargetOrder(kite, {
                    instrument_token,
                    tradingsymbol,
                    exchange,
                    quantity,
                    buyPrice: orderUpdate.average_price
                });

            } catch (err) {

                console.log(err, `❌ Failed placing target order for ${tradingsymbol}`);
            }

            return;
        }

        if (transaction_type == "SELL") {

            // Position just closed (our own target filling, or stopLossGuard's
            // SL filling first) -- either way, cancel any target order of ours
            // still resting for this symbol so it can't fire later and open an
            // unintended short.
            try {

                let orders = await kite.getOrders();
                await cancelOwnTargetOrder(kite, tradingsymbol, orders);

            } catch (err) {

                console.log(err, `❌ Failed OCO cleanup for ${tradingsymbol}`);
            }
        }
    });

    setInterval(() => {
        ensureTargetForOpenPositions(kite);
    }, 10000);

    ensureTargetForOpenPositions(kite); // warm immediately, don't wait for the first interval tick

} // <- closes main()
