// tradeCheckFunctions.js

// Import other functions needed for the checks
import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';
import { checkLastPriceAgainstPreviousCandles } from './checkLastPriceAgainstPreviousCandles.js';
import checkColorWithFlags from './checkColorWithFlags.js';
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows, hasLargeUpperWick, isBearishAt50Sec, isOpenHighAtSpecificSeconds } from './criteriaFunctions.js'; 
import { redCandleStartAfterGreenCandles } from './redCandleStartAfterGreenCandles.js';

export function canInitiateLongTrade(cis) {
    // Checking all conditions that indicate bearish signals
    const bearishConditionsExist = 
        checkLowerLowsAndLowerHighs(cis.minuteData) || 
        checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis.minuteData) || 
        isMakingLowerLows(cis) ||
        checkLastPriceAgainstPreviousCandles(cis) ||
        checkColorWithFlags(cis) ||
        redCandleStartAfterGreenCandles(cis);
    
    // Return `true` if no bearish conditions are met, indicating it's safe to initiate a long trade
    return !bearishConditionsExist;
}
