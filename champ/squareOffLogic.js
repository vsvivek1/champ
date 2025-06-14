import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';
import { checkLastPriceAgainstPreviousCandles } from './checkLastPriceAgainstPreviousCandles.js';
import checkColorWithFlags from './checkColorWithFlags.js';
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows } from './criteriaFunctions.js';
import { redCandleStartAfterGreenCandles } from './redCandleStartAfterGreenCandles.js';

/**
 * Determines whether the position should be squared off based on multiple conditions.
 * All checks must pass before 1 PM (global.hours < 13).
 */
export function shouldSquareOff(cis) {
 // if (global.hours >= 13) return false;

///isMakingLowerLows(cis), temporily removed

 //redCandleStartAfterGreenCandles(cis),

  const conditions = [
    checkLowerLowsAndLowerHighs(cis),
    checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis),
    
    checkLastPriceAgainstPreviousCandles(cis),
    checkColorWithFlags(cis),
  
    LessThanMa20(cis),
    


  ];

  return conditions.some(Boolean); // If any condition is true
}


function LessThanMa20(cis){

  if(cis.tick.last_price<cis.ma20 && cis.minuteData.length>=20){

    console.log(`stop loss due to last price less than moving average 20 `)

    return true
  }else{

    return false
  }
}