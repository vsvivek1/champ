// Function to check for the "Three Black Crows and a Bullish Reversal" pattern
export function checkThreeBlackCrowsBullishReversal(minuteData) {
    const length = minuteData.length;
  
    if (length < 4) {
      // Not enough data to check the pattern
      return false;
    }
  
    // Extract the last four candles
    const lastCandle = minuteData[length - 1];
    const thirdLastCandle = minuteData[length - 2];
    const secondLastCandle = minuteData[length - 3];
    const firstLastCandle = minuteData[length - 4];
  
    // Check if the last candle is bullish
    const isLastCandleBullish = lastCandle.close > lastCandle.open;
  
    // Check if the previous three candles are bearish
    const isFirstLastBearish = firstLastCandle.close < firstLastCandle.open;
    const isSecondLastBearish = secondLastCandle.close < secondLastCandle.open;
    const isThirdLastBearish = thirdLastCandle.close < thirdLastCandle.open;
  
    // Check if the previous three candles are making lower lows
    const isLowerLow = (firstLastCandle.low > secondLastCandle.low) &&
                       (secondLastCandle.low > thirdLastCandle.low);
  
    // Return true if the pattern matches, otherwise false

    return false  /// three crows disabled on nov 2
    return isLastCandleBullish && isFirstLastBearish && isSecondLastBearish && isThirdLastBearish && isLowerLow;
  }
  