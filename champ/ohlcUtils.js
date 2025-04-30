export function analyzeOHLCWithSlopeAndDegree(cis) {
    if (!cis || !Array.isArray(cis.minuteData) || cis.minuteData.length === 0) {
        cis.highSlopes = { message: "No Data Available" };
        cis.lowSlopes = { message: "No Data Available" };
        return;
    }

    const ohlcArray = cis.minuteData;

    // Extract high and low values
    const highs = ohlcArray.map((candle, index) => ({ value: candle.high, index }));
    const lows = ohlcArray.map((candle, index) => ({ value: candle.low, index }));

    // Find the highest and lowest high values with their indices
    const highestHigh = highs.reduce((max, current) => (current.value > max.value ? current : max));
    const lowestHigh = highs.reduce((min, current) => (current.value < min.value ? current : min));

    // Find the highest and lowest low values with their indices
    const highestLow = lows.reduce((max, current) => (current.value > max.value ? current : max));
    const lowestLow = lows.reduce((min, current) => (current.value < min.value ? current : min));

    // Calculate the slope for highs
    const highSlope = (highestHigh.value - lowestHigh.value) / (highestHigh.index - lowestHigh.index || 1); // Prevent division by zero
    const highSlopeDegree = Math.atan(highSlope) * (180 / Math.PI);

    // Calculate the slope for lows
    const lowSlope = (highestLow.value - lowestLow.value) / (highestLow.index - lowestLow.index || 1); // Prevent division by zero
    const lowSlopeDegree = Math.atan(lowSlope) * (180 / Math.PI);

    // Set values in cis object
    cis.highSlopes = {
        highest: highestHigh.value,
        lowest: lowestHigh.value,
        ratio: highestHigh.value / lowestHigh.value,
        slope: highSlope,
        degree: highSlopeDegree,
        trend: highSlope > 0 ? "Up-trending" : "Down-trending",
    };

    cis.lowSlopes = {
        highest: highestLow.value,
        lowest: lowestLow.value,
        ratio: highestLow.value / lowestLow.value,
        slope: lowSlope,
        degree: lowSlopeDegree,
        trend: lowSlope > 0 ? "Up-trending" : "Down-trending",
    };
}

export function isRangeGreaterThanFive(cis) {
    if (!cis || !Array.isArray(cis.minuteData) || cis.minuteData.length < 5 || !cis.tick || !cis.tick.last_price) {
        cis.isRangeAboveThreshold = false;
        cis.actualRange = null;
      //  console.log("Insufficient data to calculate range.");
        return;
    }

    const recentCandles = cis.minuteData.slice(-5, -1);
    const ranges = recentCandles.map((candle) => candle.high - candle.low);
    const lp = cis.tick.last_price;

    // Calculate the average range of the last 5 candles
    const sum = ranges.reduce((acc, value) => acc + value, 0);
    const average = sum / ranges.length;
    const isMoreThan10Percent = average > (0.05 * lp);

    cis.actualRange = average; // Set actual range in cis
    cis.isRangeAboveThreshold = isMoreThan10Percent; // Set range flag in cis

    if (isMoreThan10Percent) {
        const min = Math.min(...ranges);
        const max = Math.max(...ranges);

   
           
           
     cis.message=    `
                "Range IS greater than 5% average. So trading possible",
                cis.tradingsymbol,
                "range=", average,
                "last price=", lp,
                { min, max, isMoreThan10Percent }
            `;
     
    } else {

        cis.message='Range NOT greater than 5% average. So no trading'+average
      
    }
}
