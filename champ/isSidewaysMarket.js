// isSidewaysMarket.js
// Detects a whipsaw/no-trend market by counting how many times price has
// crossed its own rolling 20-candle MA over a recent lookback window.
// Many crossings = chop, not trend -- exactly the condition that kept
// stopping out and re-entering on the wrong side.
export function isSidewaysMarket(cis, lookback = 20, maxCrossings = 6) {
    const candles = cis.minuteData;

    if (!candles || candles.length < lookback + 20) {
        return false; // not enough history yet to judge
    }

    const window = candles.slice(-(lookback + 20));

    let crossings = 0;
    let prevAboveMA = null;

    for (let i = 20; i < window.length; i++) {
        const ma = window
            .slice(i - 20, i)
            .reduce((sum, c) => sum + c.close, 0) / 20;

        const aboveMA = window[i].close > ma;

        if (prevAboveMA !== null && aboveMA !== prevAboveMA) {
            crossings++;
        }
        prevAboveMA = aboveMA;
    }

    return crossings >= maxCrossings;
}
