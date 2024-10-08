// candleStickSignals.js

/**
 * Detects buy signals based on candlestick patterns.
 * 
 * @param {Object} cis - The current instrument state object.
 * @returns {boolean} - Returns true if a buy signal is detected, otherwise false.
 */
export function detectBuySignal(cis) {
    if (!cis || !cis.minuteData || cis.minuteData.length < 2) {
        return false;
    }

    const lastCandle = cis.minuteData[cis.minuteData.length - 1];
    const prevCandle = cis.minuteData[cis.minuteData.length - 2];

    // Example logic: Bullish engulfing pattern
    const isBullishEngulfing = lastCandle.close > lastCandle.open &&
                               prevCandle.close < prevCandle.open &&
                               lastCandle.open <= prevCandle.close &&
                               lastCandle.close >= prevCandle.open;

    if (isBullishEngulfing) {
        return true;
    }

    // Example logic: Hammer pattern
    const isHammer = lastCandle.close > lastCandle.open &&
                     lastCandle.low < lastCandle.open &&
                     lastCandle.high - lastCandle.close < (lastCandle.close - lastCandle.open) * 0.5 &&
                     lastCandle.low < lastCandle.open - (lastCandle.open - lastCandle.low) * 2;

    if (isHammer) {
        return true;
    }

    // Add more candlestick pattern detection logic here as needed

    return false;
}
