import { detectBuySignal } from './candleStickSignals.js';
import updateOpenOrderPrice from "./updateOrder.js";

export function onTicks(ticks) {
    ticks.forEach(tick => {
        processTicks(tick);
    });
}

export function processTicks(tick) {
    const cis = instruAll.find(i => i.instrument_token == tick.instrument_token);
    if (!cis) return;

    cis.tick = tick;

    if (cis.hasLivePosition) {
        handlePosition(cis);
    } else {
        handleNoPosition(cis);
    }
}

function handlePosition(cis) {
    if (cis.tick.ohlc.open > cis.tick.last_price && !cis.updated) {
        const order = orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');
        if (order) {
            updateOpenOrderPrice(kite, order.order_id, cis.instrument_token, cis.tick.last_price + 2);
            cis.updated = true;
        }
        console.log(`Danger ${cis.tradingsymbol} is below opening price, order id is ${order.order_id}`);
    }
}

function handleNoPosition(cis) {
    if (cis.tick.last_price > cis.tick.ohlc.open) {
        tickAboveOpen(cis);
    }
}

async function tickAboveOpen(cis) {
    if (!isTickAboveHourlyHistoricalValue(cis)) return;

    const minuteCandle = cis.minuteData;
    if (!minuteCandle) return;

    const last_candle = minuteCandle[minuteCandle.length - 1];
    if (last_candle) {
        cis.last_candle = last_candle;
        cis.lastCandleTime = convertToIndianTime(last_candle.date);

        const hasBuySignal = detectBuySignal(cis.minuteData);
        if (hasBuySignal && !cis.ordered) {
            cis.ordered = true;

            const orderParams = {
                exchange: "NFO",
                tradingsymbol: cis.tradingsymbol,
                transaction_type: "BUY",
                order_type: "LIMIT",
                quantity: cis.lot_size,
                price: cis.tick.last_price,
                product: "NRML",
                validity: "DAY",
            };

            try {
                const orderId = await kite.placeOrder("regular", orderParams);
                console.log("Order placed successfully. Order ID:", orderId);
            } catch (error) {
                console.error("Error placing order:", error);
            }
        }
    }
}

function isTickAboveHourlyHistoricalValue(cis) {
    if (!cis.hourlyHigh) return false;
    return cis.tick.last_price > cis.hourlyHigh;
}