export function checkLowerLowsAndLowerHighs(cis) {

    if(!cis) return true;

   let minuteData=cis.minuteData;
    // Ensure we have at least two candles to compare
    if (!minuteData || minuteData.length < 2) {
        return true; // Not enough data
    }

    // Get the last two candles
    const lastCandle = minuteData[minuteData.length - 1]; // Most recent candle
    const secondLastCandle = minuteData[minuteData.length - 2]; // Previous candle

    // Check if the low of the last candle is lower than the low of the second last candle
    const isLowerLow = lastCandle.low < secondLastCandle.low;

    // Check if the high of the last candle is lower than the high of the second last candle
    const isLowerHigh = lastCandle.high < secondLastCandle.high;

    // Return true if both conditions are satisfied


    if(isLowerLow && isLowerHigh && cis.tick.last_price< secondLastCandle.low ){


  cis.stopLossStrategy='lowerLow'

  if( cis.hasLivePosition){
  console.log('EXECUTING STOP LOSS isLowerLow && isLowerHigh for',cis.tradingsymbol) 

return true
  }
 
       
      
        //some issue will c later

        return false;
      
    }




   /// EXECUTING STOP LOSS isLowerLow && isLowerHigh
return false;
   // return isLowerLow && isLowerHigh;
}