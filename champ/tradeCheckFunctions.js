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
    


        const bearishConditions = [
            { name: "Lower Lows and Lower Highs", exists: checkLowerLowsAndLowerHighs(cis.minuteData) },
            { name: "Penultimate Green and Last Small Body or Lower High", exists: checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis.minuteData) },
            { name: "Making Lower Lows", exists: isMakingLowerLows(cis) },
            { name: "Last Price Against Previous Candles", exists: checkLastPriceAgainstPreviousCandles(cis) },
            { name: "Color with Flags", exists: checkColorWithFlags(cis) },
            { name: "Red Candle Start After Green Candles", exists: redCandleStartAfterGreenCandles(cis) }
        ];
        
        // Filter the conditions that are true
        const activeBearishConditions = bearishConditions.filter(condition => condition.exists);
        
        // Log the results
        if (activeBearishConditions.length > 0) {
            //console.log("The following bearish conditions exist:",cis.tradingsymbol);
       if(global.seconds%20==0)     activeBearishConditions.forEach(condition => console.log(cis.tradingsymbol,`- ${condition.name}`));
        } else {
            if(global.seconds%20==0)    console.log("No bearish conditions exist.");
        }
    // Return `true` if no bearish conditions are met, indicating it's safe to initiate a long trade
    return !bearishConditionsExist;
}
