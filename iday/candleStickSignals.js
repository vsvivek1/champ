// candlestickSignals.js

// Function to detect buy signals from OHLC data
export function detectBuySignal(ohlcData) {
    // Helper function to detect bullish engulfing pattern
    function isBullishEngulfing(current, previous) {
        return (
            current.open < current.close &&
            previous.open > previous.close &&
            current.open < previous.close &&
            current.close > previous.open
        );
    }

    // Helper function to detect hammer pattern
    function isHammer(candle) {
        const body = Math.abs(candle.open - candle.close);
        const lowerShadow = candle.open < candle.close
            ? candle.open - candle.low
            : candle.close - candle.low;
        const upperShadow = candle.high - Math.max(candle.open, candle.close);

        return lowerShadow > 2 * body && upperShadow < body;
    }

    // Helper function to detect morning star pattern
    function isMorningStar(current, previous, beforePrevious) {
        return (
            beforePrevious.close < beforePrevious.open &&
            previous.close < previous.open &&
            current.close > current.open &&
            current.close > (beforePrevious.open + beforePrevious.close) / 2
        );
    }

    // Iterate through the OHLC data to check for buy signals
    for (let i = 2; i < ohlcData.length; i++) {
        const current = ohlcData[i];
        const previous = ohlcData[i - 1];
        const beforePrevious = ohlcData[i - 2];

        if (isBullishEngulfing(current, previous)) {
            return true; // Buy signal detected
        }

        if (isHammer(current)) {
            return true; // Buy signal detected
        }

        if (isMorningStar(current, previous, beforePrevious)) {
            return true; // Buy signal detected
        }
    }

    return false; // No buy signal detected
}
