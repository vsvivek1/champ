function is15MinuteBreakout(ohlcData, lastPrice) {


    var   breakoutOccurred,
    lastPrice,
    highestHigh,
    lowestLow,
    priceRange,
    targetPrice,
    stopLoss=0;
    if (!Array.isArray(ohlcData) || ohlcData.length < 15) {


        return {
            breakoutOccurred,
            lastPrice,
            highestHigh,
            lowestLow,
            priceRange,
            targetPrice,
            stopLoss,
        };
        throw new Error('OHLC data must be an array with at least 15 candles.');
    }

    if (typeof lastPrice !== 'number') {
        lastPrice = parseFloat(lastPrice);
        if (isNaN(lastPrice)) {


            
            throw new Error('Invalid last price provided.');
        }
    }

    const last15Candles = ohlcData.slice(-60);

     highestHigh = -Infinity;
     lowestLow = Infinity;

    last15Candles.forEach(candle => {
        const highPrice = parseFloat(candle.high);
        const lowPrice = parseFloat(candle.low);

        if (highPrice > highestHigh) {
            highestHigh = highPrice;
        }

        if (lowPrice < lowestLow) {
            lowestLow = lowPrice;
        }
    });

     priceRange = highestHigh - lowestLow;

     let rangePc=priceRange/lastPrice
   targetPrice = highestHigh + priceRange;
  stopLoss = lowestLow - priceRange;
   breakoutOccurred = lastPrice > highestHigh;

    return {
        breakoutOccurred,
        lastPrice,
        highestHigh,
        lowestLow,
        priceRange,
        targetPrice,
        stopLoss,
    };
}


export {is15MinuteBreakout};