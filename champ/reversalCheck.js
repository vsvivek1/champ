export function reversalCheck(candles, cis) {
    // Validate input
    if (candles.length < 30) {

        return false;
       // throw new Error("Insufficient candles, at least 30 are required.");
    }

    // Extract the last 30 candles
    const last30Candles = candles.slice(-30);

    // Find the highest high and lowest low in the last 30 candles
    const highestHigh = Math.max(...last30Candles.map(candle => candle.high));
    const lowestLow = Math.min(...last30Candles.map(candle => candle.low));

    // Calculate the percentage decrease
    const percentageDecrease = ((highestHigh - lowestLow) / highestHigh) * 100;

    // Extract the last 3 candles
    const last3Candles = candles.slice(-3);

    // Find the highest high in the last 3 candles
    const highOfLast3Candles = Math.max(...last3Candles.map(candle => candle.high));
    const lowOfLast3Candles = Math.min(...last3Candles.map(candle => candle.low));

    // Check the conditions
    if (percentageDecrease > 30 && cis.tick.last_price > highOfLast3Candles) {
        // Calculate target and stop-loss
        const candleHeight = highOfLast3Candles - lowOfLast3Candles;
        const target = highOfLast3Candles + (candleHeight * 0.2);
        const stopLoss = lowOfLast3Candles + (candleHeight / 2);

        // Set target and stop-loss in `cis`
        cis.targetPrice = target;
        cis.stopLossPrice = stopLoss;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;


        cis.signal=`Reversal detected. Target ${target} and stop-loss ${stopLoss} set:`

        // console.log("Reversal detected. Target and stop-loss set:");
        // console.log(`Target: ${target}`);
        // console.log(`Stop Loss: ${stopLoss}`);
        return true;
    }

    return false;
}
