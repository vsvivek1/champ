// hammerStrategy.js

export function isHammerCandle(candle) {
    const bodySize = Math.abs(candle.close - candle.open);
    const lowerWick = candle.open < candle.close 
        ? candle.open - candle.low 
        : candle.close - candle.low;
    const upperWick = candle.high - Math.max(candle.open, candle.close);

    const isSmallBody = bodySize <= (candle.high - candle.low) * 0.3;
    const isLongLowerWick = lowerWick >= 4 * bodySize;
    const isSmallUpperWick = upperWick <= bodySize * 0.3;


   if(global.seconds==10) console.log('hammer health ok');
    
    return isSmallBody && isLongLowerWick && isSmallUpperWick;
}

export function checkLastCandleIsHammer(candles) {
    if (candles.length === 0) {
        return false;
    }

    const lastCandle = candles[candles.length - 1];
    return isHammerCandle(lastCandle);
}
