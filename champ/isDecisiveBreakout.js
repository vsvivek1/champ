// isDecisiveBreakout.js
// A sideways/choppy market can still break out decisively -- in that case
// the chop signal shouldn't block the entry. "Decisive" means price clears
// the recent compression range by more than a full average candle range,
// not just a marginal poke above the edge of the range (which is itself
// chop noise).
export function isDecisiveBreakout(cis, lookback = 20, breakoutMultiplier = 1.0) {
    const candles = cis.minuteData;

    if (!candles || candles.length < lookback + 1 || !cis.tick) {
        return false;
    }

    const recent = candles.slice(-(lookback + 1), -1); // exclude the still-forming live candle
    const rangeHigh = Math.max(...recent.map(c => c.high));
    const avgRange = recent.reduce((sum, c) => sum + (c.high - c.low), 0) / recent.length;

    return cis.tick.last_price > rangeHigh + breakoutMultiplier * avgRange;
}
