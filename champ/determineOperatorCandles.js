export function determineOperatorCandleFlags(cis) {
    if (!cis || !Array.isArray(cis.minuteData) || cis.minuteData.length == 0 || !cis.tick || !cis.tick.last_price) {
        cis.operatorBuyCandles = {
            fifteenMinutes: false,
            thirtyMinutes: false,
            oneHour: false,
            allCandles: false,
        };
        cis.operatorSellCandles = {
            fifteenMinutes: false,
            thirtyMinutes: false,
            oneHour: false,
            allCandles: false,
        };
       // console.log("Insufficient data to determine operator candle flags.");
        return;
    }

    const lastPrice = cis.tick.last_price;

    // Helper functions
    const isLargeGreenCandle = (candle) => {
        return candle.close > candle.open && (candle.close - candle.open) > 0.03 * lastPrice;
    };

    const isLargeRedCandle = (candle) => {
        return candle.open > candle.close && (candle.open - candle.close) > 0.03 * lastPrice;
    };

    // Define time intervals in minutes
    const intervals = {
        fifteenMinutes: 15,
        thirtyMinutes: 30,
        oneHour: 60,
        allCandles: cis.minuteData.length, // Entire data
    };

    // Initialize flags
    // cis.operatorBuyCandles = {};
    // cis.operatorSellCandles = {};

    // Iterate over each interval
    for (const [key, minutes] of Object.entries(intervals)) {
        const candlesToCheck = cis.minuteData.slice(-minutes); // Get the last 'minutes' candles

        // Check for large green candles
        const hasLargeGreenCandle = candlesToCheck.some(isLargeGreenCandle);


        if(typeof cis.operatorBuyCandles=='undefined') cis.operatorBuyCandles={};
        cis.operatorBuyCandles[key] = hasLargeGreenCandle;

        // Check for large red candles
        const hasLargeRedCandle = candlesToCheck.some(isLargeRedCandle);
        

        if(typeof cis.operatorSellCandles=='undefined') cis.operatorSellCandles={};
        cis.operatorSellCandles[key] = hasLargeRedCandle;
    }
}
