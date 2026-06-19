// candlestickPatterns.js
// Display-only pattern detector -- identifies which named candlestick
// pattern (if any) the most recent candle(s) form. Does not feed into
// any trading decision.
import { isHammerCandle } from './hammerStrategy.js';

function isDoji(candle) {
    const range = candle.high - candle.low;
    if (range <= 0) return false;
    const body = Math.abs(candle.close - candle.open);
    return body <= range * 0.1;
}

function isBullishEngulfing(prev, curr) {
    const prevBearish = prev.close < prev.open;
    const currBullish = curr.close > curr.open;
    return prevBearish && currBullish &&
        curr.open <= prev.close &&
        curr.close >= prev.open;
}

function isBearishEngulfing(prev, curr) {
    const prevBullish = prev.close > prev.open;
    const currBearish = curr.close < curr.open;
    return prevBullish && currBearish &&
        curr.open >= prev.close &&
        curr.close <= prev.open;
}

function isMorningStar(c1, c2, c3) {
    const firstBearish = c1.close < c1.open;
    const firstBody = Math.abs(c1.close - c1.open);
    const secondBody = Math.abs(c2.close - c2.open);
    const secondSmall = secondBody <= firstBody * 0.5;
    const thirdBullish = c3.close > c3.open;
    const thirdClosesIntoFirstBody = c3.close > (c1.open + c1.close) / 2;

    return firstBearish && secondSmall && thirdBullish && thirdClosesIntoFirstBody;
}

function isEveningStar(c1, c2, c3) {
    const firstBullish = c1.close > c1.open;
    const firstBody = Math.abs(c1.close - c1.open);
    const secondBody = Math.abs(c2.close - c2.open);
    const secondSmall = secondBody <= firstBody * 0.5;
    const thirdBearish = c3.close < c3.open;
    const thirdClosesIntoFirstBody = c3.close < (c1.open + c1.close) / 2;

    return firstBullish && secondSmall && thirdBearish && thirdClosesIntoFirstBody;
}

export function detectCandlestickPattern(cis) {
    const candles = cis.minuteData;
    if (!candles || candles.length < 1) return null;

    if (candles.length >= 3) {
        const c1 = candles[candles.length - 3];
        const c2 = candles[candles.length - 2];
        const c3 = candles[candles.length - 1];
        if (isMorningStar(c1, c2, c3)) return 'Morning Star (bullish)';
        if (isEveningStar(c1, c2, c3)) return 'Evening Star (bearish)';
    }

    if (candles.length >= 2) {
        const prev = candles[candles.length - 2];
        const curr = candles[candles.length - 1];
        if (isBullishEngulfing(prev, curr)) return 'Bullish Engulfing';
        if (isBearishEngulfing(prev, curr)) return 'Bearish Engulfing';
    }

    const last = candles[candles.length - 1];
    if (isHammerCandle(last)) return 'Hammer (bullish)';
    if (isDoji(last)) return 'Doji (indecision)';

    return null;
}
