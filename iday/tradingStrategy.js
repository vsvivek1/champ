import chalk from 'chalk';
import { detectBuySignal } from './candleStickSignals.js';
import updateOpenOrderPrice from './updateOrder.js';
import terminalLink from 'terminal-link';
import { executeRangeStrategy } from './rangeStrategy.js';

export function isMakingLowerLows(tick, cis, lastPrice, lowerLowsCount) {
    if (lastPrice == null) {
        lastPrice = tick.last_price;
        return false;
    }

    const isLowerLow = tick.last_price < cis.lastSeenHigh && tick.last_price < lastPrice;
    lowerLowsCount = isLowerLow ? lowerLowsCount + 1 : 0;
    lastPrice = tick.last_price;

    return lowerLowsCount >= 3;
}

export async function executeBuy(cis, kite) {
    if (cis.ordered) {
        return false;
    }
    cis.ordered = true;

    let price = cis.lastCandle.close;
    const orderParams = {
        exchange: "NFO",
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: cis.lot_size * 20, // Example multiplier
        price: price,
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

export async function handlePositionPresent(cis, kite, orders) {
    cis.lastSeenHighForPosition = Math.max(cis.tick.last_price, cis.lastSeenHighForPosition);
    cis.lastSeenHigh = Math.max(cis.tick.last_price, cis.lastSeenHigh);

    let target_order = orders.find((i) => i.tradingsymbol == cis.tradingsymbol && i.status == 'OPEN' && i.transaction_type == 'SELL');
    if (!target_order && cis.hasLivePosition && !cis.hasPlacedTarget) {
        cis.hasPlacedTarget = true;
        await placeTargetOrderForScript(cis, kite);
    }

    // Logic for handling position present
    // Add additional conditions and logic for square off as needed
}

export async function handleNoPosition(cis, kite, date) {
    if (cis.ordered) {
        return false;
    }

    await executeRangeStrategy(cis, kite);

    // Logic for handling no position
    if (cis.tick.last_price > cis.tick.ohlc.open) {
        if (detectBuySignal(cis)) {
            await executeBuy(cis, kite);
        }
    }
}

async function placeTargetOrderForScript(cis, kite) {
    const orderParams = {
        exchange: "NFO",
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "SELL",
        order_type: "LIMIT",
        quantity: cis.position.quantity,
        price: Math.ceil(cis.position.buy_price * 1.15),
        product: "NRML",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        console.log("Target Order placed successfully. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing target order:", error);
    }
}
