import { executeBuy } from "./executeBuy.js";
import { is15MinuteBreakout } from "./is15MinuteBreakout.js";
import { checkThreeBlackCrowsBullishReversal } from "./checkThreeBlackCrowsBullishReversal.js";
import { isHammerCandle } from "./hammerStrategy.js";
import { isOpenLowAtSpecificSeconds } from "./isOpenLowAtSpecifiedSeconds.js";
import { checkGapDown } from "./gapDownChecker.js";
import { hasManyUpperWicks } from "./hasManyUpperWicks.js";
import { findHourlyHighestPrice } from "./findElapsedHourHigh.js";
import { compareVolatility } from "./compareVolatility.js";
import { regressionBreakoutTrading } from "./regressionBreakOutTrading.js";
import { highAfter11AM } from "./highAfter11.js";
    import * as strategies from "./strategies/index.js";

export function handleGeneralTrades(cis, kite) {

    return;
    handleTrades(cis, kite);
}


export function handleTrades(cis, kite) {

return;

console.log('arrived hre')
  
        //if (global.seconds < 50) return false;
    
        for (let [name, strategy] of Object.entries(strategies)) {

            console.log(strategy,'strategy')


            if (strategy(cis, kite)) {
                console.log(`[✔] Trade executed using: ${cis.buyCriteria}`);
                return true;
            }
        }
    
        return false;
    


return;

    if (global.seconds < 50) return false;

    let proceedToTrade = false;
    let buyCriteria = null; // Track which strategy triggered the trade
    let targetMultiplier = global.targetPc || 1.05; // Default target percentage
    let stopLossMultiplier = global.stoplossPc || 0.95; // Default stop-loss percentage


      

      

    
    

    if (global.hours >= 10 && global.hours < 12) {
        // Mid-morning strategies
     

        if (regressionBreakoutTrading(cis)) {
            buyCriteria = "RegressionBreakout";
            proceedToTrade = true;
        }
    }

  

    // General Strategies
  

   

  

    // Final Trade Execution


    
     
    if (proceedToTrade) {
        cis.targetPrice = cis.tick.last_price * targetMultiplier;
        cis.stopLossPrice = cis.tick.last_price * stopLossMultiplier;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.buyCriteria = buyCriteria;

       /*  let noLots = global.hours === 12 ? 2 : 2; // Adjust lots for time of day
        for (let i = 0; i < noLots; i++) {
 */
          //  let p=Math.ceil(cis.tick.last_price-cis.minuteCandleMeanRange)
            executeBuy(cis, kite, cis.tick.last_price);

            cis.message = `Trade executed for: ${cis.tradingsymbol}, { buyCriteria: ${buyCriteria}, targetPrice: ${cis.targetPrice}, stopLossPrice: ${cis.stopLossPrice} }`;

       // }

     
    } /* else {
        console.log("No trade executed for:", cis.tradingsymbol);
    } */
}
