export function checkLiveMinuteSmallBodyRedOrLongUpperShadow(cis) {
    // Ensure cis and liveMinute are available
    if (!cis || !cis.liveMinute || !cis.minuteData || cis.minuteData.length < 4) {
        return false;
    }

    const liveMinute = cis.liveMinute;

    // Check if the live minute candle is red (close < open)
    const isRedCandle = liveMinute.close < liveMinute.open;

    // Calculate the body size and total range
    const bodySize = Math.abs(liveMinute.close - liveMinute.open);
    const totalRange = liveMinute.high - liveMinute.low;

    // Define the threshold for a small body (e.g., less than 10% of the total range)
    const isSmallBody = totalRange > 0 && bodySize < 0.1 * totalRange;

    // Calculate the average range of the last 4 candles
    const lastFourCandles = cis.minuteData.slice(-4);
    const averageRange =
        lastFourCandles.reduce((sum, candle) => sum + (candle.high - candle.low), 0) / 4;

    // Check if the live minute candle's range is less than half the average range
    const isRangeSmall = totalRange < 0.5 * averageRange;

    // Check if the live minute candle has a long upper shadow
    const upperShadow = liveMinute.high - Math.max(liveMinute.open, liveMinute.close);
    const lowerShadow = Math.min(liveMinute.open, liveMinute.close) - liveMinute.low;
    const isLongUpperShadow = upperShadow > 2 * bodySize && upperShadow > lowerShadow;

    // Log for debugging if any of the conditions match
 /*    if (isRedCandle || isSmallBody || isRangeSmall || isLongUpperShadow) {
        console.log('Live minute candle check:', {
            isRedCandle,
            isSmallBody,
            isRangeSmall,
            isLongUpperShadow,
            liveMinute,
            averageRange
        });
    }
 */
    // Return true if the candle meets any of the conditions
    return isRedCandle || isSmallBody || isRangeSmall || isLongUpperShadow;
}
