// criteriaFunctions.js

export function isMakingLowerLows(cis) {
    // Ensure there are at least two candles to compare

   // console.log(cis.minuteData);
   // console.log(cis.minuteData);
    
    if (!cis.minuteData ||  cis.minuteData.length < 2) {
        return false;
    }

    // Get the last two candles
    const lastCandle = cis.minuteData[cis.minuteData.length - 1];
    const previousCandle = cis.minuteData[cis.minuteData.length - 2];

    // Check if the last two candles have made lower lows and lower highs
    const lowerLow = lastCandle.low < previousCandle.low;
    const lowerHigh = lastCandle.high < previousCandle.high;

    // If both conditions are met, return true

    if(lowerLow && lowerHigh){

        if(global.minutes%15==0 && global.seconds==0)   console.log('EXECUTING STOP LOSS lowerLow && lowerHigh')
    }
    return lowerLow && lowerHigh;
}

export function hasLargeUpperWick(cis) {
    // Check if global.seconds is 30
    if (global.seconds !== 30) {
        return false;
    }

    // Calculate the size of the upper wick for the current minute's candle
    const upperWickSize = cis.currentMinute.high - Math.max(cis.currentMinute.open, cis.currentMinute.close);
    const bodySize = Math.abs(cis.currentMinute.open - cis.currentMinute.close);

    // Define what qualifies as a "large" upper wick; this threshold can be adjusted
    const wickToBodyRatio = upperWickSize / bodySize;

    // Consider it a large upper wick if the wick is significantly larger than the body
    return wickToBodyRatio > 2;  // Example threshold: upper wick is twice the size of the body
}

export function isBearishAt50Sec(cis) {
    // Check if global.seconds is 50
    if (global.seconds !== 50) {
        return false;
    }

    // Determine if the current minute's candle is bearish
    // A bearish candle is defined as one where the close is lower than the open
    return cis.currentMinute.close < cis.currentMinute.open;
}

export function isOpenHighAtSpecificSeconds(cis) {
    // Check if global.seconds is 10, 20, or 30
    const relevantSeconds = [10, 20, 30];
    if (!relevantSeconds.includes(global.seconds)) {
        return false;
    }

    // Determine if the candle is Open=High
    return cis.currentMinute.open === cis.currentMinute.high;
}

// You can add more criteria functions here as needed
