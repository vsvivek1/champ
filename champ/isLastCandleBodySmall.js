export function isLastCandleBodySmallAndLastPriceCrossedItsHigh(cis) {
    const { minuteData } = cis;
    
    // Ensure we have at least 10 candles to analyze
    if (minuteData.length < 10) {
        throw new Error("Not enough data. Minimum of 10 candles required.");
    }
    
    // Get the last 10 candles
    const lastTenCandles = minuteData.slice(-10);
    
    // Calculate the average body size of the last 10 candles
    const averageBodySize = lastTenCandles.reduce((sum, candle) => {
        const bodySize = Math.abs(candle.close - candle.open);
        return sum + bodySize;
    }, 0) / lastTenCandles.length;
    
    // Calculate the body size of the last candle
    const lastCandle = minuteData[minuteData.length - 1];
    const lastCandleBodySize = Math.abs(lastCandle.close - lastCandle.open);
    
    // Check if the last candle's body size is less than 1/5 of the average body size
    return lastCandleBodySize < (averageBodySize / 5) && cis.tick.last_price>lastCandle.high;
}
