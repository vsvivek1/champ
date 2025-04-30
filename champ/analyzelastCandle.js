function analyzeCandlestickPatterns(cis) {
    if (!cis || !Array.isArray(cis.minuteData) || cis.minuteData.length < 1) {
        cis = cis || {};
        cis.lastCandlePattern = "No Data";
        cis.lastCandlePatternAction = "Hold";
        return cis;
    }

    const data = cis.minuteData;
    const latestCandles = data.slice(-3); // Get the last three candles

    let pattern = "";
    let action = "";

    // Helper function to determine the body midpoint
    const getMidpoint = (candle) => (candle.open + candle.close) / 2;

    if (latestCandles.length === 3) {
        const [candle1, candle2, candle3] = latestCandles;
        const isBullish1 = candle1.close > candle1.open;
        const isBullish2 = candle2.close > candle2.open;
        const isBullish3 = candle3.close > candle3.open;
        const isBearish1 = candle1.close < candle1.open;
        const isBearish2 = candle2.close < candle2.open;
        const isBearish3 = candle3.close < candle3.open;

        // Three-Candle Patterns
        if (isBearish1 && Math.abs(candle2.close - candle2.open) < (candle2.high - candle2.low) * 0.1 && isBullish3 && candle3.close > getMidpoint(candle1)) {
            pattern = "Morning Star";
            action = "Buy";
        } else if (isBullish1 && Math.abs(candle2.close - candle2.open) < (candle2.high - candle2.low) * 0.1 && isBearish3 && candle3.close < getMidpoint(candle1)) {
            pattern = "Evening Star";
            action = "Sell";
        } else if (isBullish1 && isBullish2 && isBullish3 && candle2.close > candle1.close && candle3.close > candle2.close) {
            pattern = "Three White Soldiers";
            action = "Strong Buy";
        } else if (isBearish1 && isBearish2 && isBearish3 && candle2.close < candle1.close && candle3.close < candle2.close) {
            pattern = "Three Black Crows";
            action = "Strong Sell";
        }
    }

    if (!pattern && latestCandles.length >= 2) {
        const [candle1, candle2] = latestCandles.slice(-2);
        const isBullish1 = candle1.close > candle1.open;
        const isBullish2 = candle2.close > candle2.open;
        const isBearish1 = candle1.close < candle1.open;
        const isBearish2 = candle2.close < candle2.open;

        // Two-Candle Patterns
        if (isBearish1 && isBullish2 && candle2.open < candle1.low && candle2.close > getMidpoint(candle1)) {
            pattern = "Piercing Line";
            action = "Buy";
        } else if (isBullish1 && isBearish2 && candle2.open > candle1.high && candle2.close < getMidpoint(candle1)) {
            pattern = "Dark Cloud Cover";
            action = "Sell";
        } else if (isBullish2 && isBearish1 && candle2.open <= candle1.close && candle2.close >= candle1.open) {
            pattern = "Bullish Engulfing";
            action = "Buy";
        } else if (isBearish2 && isBullish1 && candle2.open >= candle1.close && candle2.close <= candle1.open) {
            pattern = "Bearish Engulfing";
            action = "Sell";
        }
    }

    if (!pattern) {
        // Single-Candle Patterns or Default to Last Candle
        const lastCandle = latestCandles[latestCandles.length - 1];
        const { open, high, low, close } = lastCandle;

        const bodySize = Math.abs(close - open);
        const candleRange = high - low;
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;

        const dojiTolerance = candleRange * 0.1;

        if (bodySize < dojiTolerance) {
            if (upperShadow > bodySize * 2 && lowerShadow > bodySize * 2) {
                pattern = "Long-Legged Doji";
                action = "Hold";
            } else if (lowerShadow > upperShadow * 2) {
                pattern = "Dragonfly Doji";
                action = "Potential Buy";
            } else if (upperShadow > lowerShadow * 2) {
                pattern = "Gravestone Doji";
                action = "Potential Sell";
            } else {
                pattern = "Doji";
                action = "Hold";
            }
        } else if (close > open) {
            if (lowerShadow > bodySize * 2 && upperShadow < bodySize) {
                pattern = "Bullish Hammer";
                action = "Buy";
            } else if (upperShadow > bodySize * 2 && lowerShadow < bodySize) {
                pattern = "Inverted Hammer";
                action = "Hold";
            } else {
                pattern = "Bullish Candle";
                action = "Buy";
            }
        } else {
            if (lowerShadow > bodySize * 2 && upperShadow < bodySize) {
                pattern = "Hanging Man";
                action = "Hold";
            } else if (upperShadow > bodySize * 2 && lowerShadow < bodySize) {
                pattern = "Shooting Star";
                action = "Sell";
            } else {
                pattern = "Bearish Candle";
                action = "Sell";
            }
        }
    }

    // Update cis
    cis.lastCandlePattern = pattern || "No Clear Pattern";
    cis.lastCandlePatternAction = action || "Hold";

    return cis;
}

// Example Usage


const updatedCis = analyzeCandlestickPatterns(cis);
//console.log(updatedCis);
