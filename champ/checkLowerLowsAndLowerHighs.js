export function checkLowerLowsAndLowerHighs(minuteData) {
    // Ensure we have at least two candles to compare
    if (!minuteData || minuteData.length < 2) {
        return false; // Not enough data
    }

    // Get the last two candles
    const lastCandle = minuteData[minuteData.length - 1]; // Most recent candle
    const secondLastCandle = minuteData[minuteData.length - 2]; // Previous candle

    // Check if the low of the last candle is lower than the low of the second last candle
    const isLowerLow = lastCandle.low < secondLastCandle.low;

    // Check if the high of the last candle is lower than the high of the second last candle
    const isLowerHigh = lastCandle.high < secondLastCandle.high;

    // Return true if both conditions are satisfied


    if(isLowerLow && isLowerHigh){

        //some issue will c later

       // console.log('EXECUTING STOP LOSS isLowerLow && isLowerHigh') 
    }


   /// EXECUTING STOP LOSS isLowerLow && isLowerHigh
return false;
   // return isLowerLow && isLowerHigh;
}