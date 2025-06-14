import { executeBuy } from "./executeBuy.js";

/**
 * Checks if all highs of the last `lookback` candles are below the `maPeriod`-period moving average
 * and the given `ltp` crosses above that moving average.
 *
 * @param {Array<{ high: number, close: number }>} candles - Array of candle data (oldest→newest).
 * @param {number} ltp - Last traded price to check against MA.
 * @param {number} [maPeriod=20] - Period for simple moving average.
 * @param {number} [lookback=10] - Number of recent candles to check.
 * @returns {boolean} True if all highs < MA and LTP > MA, false otherwise (including insufficient data).
 */
export function cross20MaWith10CandlesBelow(cis) {
  // If not enough candles to compute MA + lookback, bail out
  
//executeBuy
  let candles=cis.minuteData;

  // 1) Ensure highs of the last `lookback` candles are below their respective MA
  const startIdx = candles.length-10;


  for (let i = startIdx; i < candles.length; i++) {
   
    if (candles[i].high >= cis.ma20) {
      return false;
    }
  }



  // 2) Check if LTP is above the current 20-period MA

 if(cis.tick.last_price > cis.ma20){

    executeBuy(cis,kite,cis.tick.last_price)

    return true;
 }

}


