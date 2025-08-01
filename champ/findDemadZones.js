/**
 * Filters candles with lower wicks representing demand zones and allows overlapping wicks.
 * Ensures the low of the candle is not encompassed by the body of any other candle.
 * @param {Array} minuteData - Array of OHLC candlesticks.
 * @returns {Array} - Candles identified as demand zone candles.
 */
export function findDemandZones(cis) {

let minuteData=cis.minuteData

    let demandZones= minuteData.filter((candle, index, array) => {
        const { open, high, low, close } = candle;

        // Calculate body and lower wick
        const body = Math.abs(close - open);
        const lowerWick = Math.min(open, close) - low;

        // Check lower wick rejection condition
        if (lowerWick < 3 * body) return false;

        // Ensure the low is not within the body of any other candle
        const isLowUnique = array.every((otherCandle, otherIndex) => {
            if (otherIndex == index) return true; // Skip the current candle
            const otherBodyLow = Math.min(otherCandle.open, otherCandle.close);
            const otherBodyHigh = Math.max(otherCandle.open, otherCandle.close);

            // Check if low is outside the range of the other candle's body
            return low < otherBodyLow || low > otherBodyHigh;
        });

        return isLowUnique;
    });
    cis.demandZones=demandZones;



}
