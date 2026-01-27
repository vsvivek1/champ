export function analyzeTwoRedCandles(cis) {


    return false;
    if(global.seconds<56){

        return
    }
    const minuteData = cis.minuteData;
    const ltp = cis.tick.last_price; // LTP from `cis.tick.last_price`

    if (minuteData.length < 3) {
        // Not enough candles to analyze
        return false;
    }

    // Get the last two candles
    const lastTwoCandles = minuteData.slice(-2);

    // Check if both are red candles (close < open)
    const isBothRed = lastTwoCandles.every(candle => candle.close < candle.open);

    if (!isBothRed) {
        return false; // Exit if not both red candles
    }

    // Get the last candle's high
    const lastCandleHigh = lastTwoCandles[1].high;

    // Check if LTP crosses the high of the last candle
    const ltpCrossedHigh = ltp > lastCandleHigh;

    //console.log('two cross hre',{ltpCrossedHigh},{ltp},{lastCandleHigh});
    

    if (ltpCrossedHigh) {
        const lastCandleLow = lastTwoCandles[1].low;
        const candleHeight = lastCandleHigh - lastCandleLow;

        // Calculate target and stop-loss
        const target = lastCandleHigh + (candleHeight * 0.3);
        const stopLoss = lastCandleLow + (candleHeight / 2);

        // Set target and stop-loss in `cis`
        cis.targetPrice = target;
        cis.stopLossPrice = stopLoss;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

       // console.log("Conditions met:");
        //console.log(`Target set: ${target}`);
      //  console.log(`Stop Loss set: ${stopLoss}`);
        return true;
    }

    return false;
}
