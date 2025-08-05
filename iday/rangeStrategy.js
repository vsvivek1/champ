export async function executeRangeStrategy(cis, kite) {
    if (cis.ordered) {
        return false;
    }

    // Ensure the last price is above the opening price
    if (cis.tick.last_price <= cis.tick.ohlc.open) {
        console.log('Price is not above the opening point:', cis.tradingsymbol);
        return;
    }

    // Define the sideways range
    const rangeHigh = calculateRangeHigh(cis.minuteData);
    const rangeLow = calculateRangeLow(cis.minuteData);

    // Check if the price is within the defined range
    if (cis.tick.last_price < rangeLow || cis.tick.last_price > rangeHigh) {
        console.log('Price is not within the sideways range:', cis.tradingsymbol);
        return;
    }

    // Buy at the lower end of the range
    const buyPrice = rangeLow;
    const stopLoss = calculateStopLoss(rangeLow, rangeHigh);
    const sellPrice = rangeHigh;

    console.log(`Placing order for ${cis.tradingsymbol}:`);
    console.log(`Buy at: ${buyPrice}, Sell at: ${sellPrice}, Stop Loss: ${stopLoss}`);

    const orderParams = {
        exchange: "NFO",
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: cis.lot_size * 20, // Adjust quantity as needed
        price: buyPrice,
        product: "NRML",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        console.log(global.clock+ " Order placed successfully. Order ID:", orderId);
        cis.ordered = true;

        // Place a sell order at the high of the range
        const sellOrderParams = {
            ...orderParams,
            transaction_type: "SELL",
            price: sellPrice
        };

        const sellOrderId = await kite.placeOrder("regular", sellOrderParams);
        console.log("Sell order placed successfully. Order ID:", sellOrderId);

    } catch (error) {
        console.error("Error placing order:", error);
    }
}

// Calculate the high of the sideways range
function calculateRangeHigh(minuteData) {
    const recentCandles = minuteData.slice(-15); // Last 15 minutes for example
    const high = Math.max(...recentCandles.map(candle => candle.high));
    return high;
}

// Calculate the low of the sideways range
function calculateRangeLow(minuteData) {
    const recentCandles = minuteData.slice(-15); // Last 15 minutes for example
    const low = Math.min(...recentCandles.map(candle => candle.low));
    return low;
}

// Calculate stop loss based on range
function calculateStopLoss(rangeLow, rangeHigh) {
    const riskPercentage = 0.02; // Example risk percentage (2%)
    const stopLoss = rangeLow - (rangeHigh - rangeLow) * riskPercentage;
    return stopLoss;
}
