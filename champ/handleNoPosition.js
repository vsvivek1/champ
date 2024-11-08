// handleNoPosition.js

import { executeBuy } from './executeBuy.js';
import { isLastPriceAboveMaxOfPrev15, highestPointAfter12PM,OpenPriceAfter12PM } from './tickSupport.js';
import { checkLastCandleIsHammer, isHammerCandle } from './hammerStrategy.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import {handle10to12PM} from './handleTrades10to12Pm.js'
import {handle12to4PM} from './handle12to4PM.js'
import {handle9to10AM} from './handle9to10Am.js'
import {isOpenLowAtSpecificSeconds}from './isOpenLowAtSpecifiedSeconds.js';
import {checkLowerLowsAndLowerHighs} from './checkLowerLowsAndLowerHighs.js';
import {checkGapDown} from './gapDownChecker.js'
import {findSupportPoints} from './findSupportPoints.js'
import {checkLastCandleOverSupportPoint} from './checkLastCandleOverSupportPoints.js'
import { canInitiateLongTrade } from './tradeCheckFunctions.js'; // Adjust the path based on file location




///logs

import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
let trades = [];

function isRangeGreaterThanFive(cis) {
    let c = cis.minuteData.slice(-5, -1)
      .map(c1 => c1.high - c1.low);
    
    let lp = cis.tick.last_price;
    
    // Calculate the average range of the last 5 candles
    let sum = c.reduce((acc, value) => acc + value, 0);
    let average = sum / c.length;
    
    let isMoreThan10Percent = average > (0.05 * lp);
    
    
    
    
    if (isMoreThan10Percent ) {
        let min = Math.min(...c);
        let max = Math.max(...c);
     
    /*  
        if (global.seconds % 5 === 0) {
       
    
        console.log('more than 10 pc average', 
                    `Min: ${min}, Max: ${max}, Average: ${average}`, 
                    cis.tradingsymbol);
      } */
    
      if (global.seconds % 30 === 0 && global.minutes%10==0) {
        console.log('range IS greater than 5 pc average. So trading possible', 
                    cis.tradingsymbol,'range=',average, 'last price=',cis.tick.last_price,{isMoreThan10Percent});

                    
      }
    

      return true;
    } else {
      if (global.seconds % 30 === 0 && global.minutes%10==0) {
        console.log('range not greater than 5 pc average. So no trading', 
                    cis.tradingsymbol, 'range=',average, 'last price=',cis.tick.last_price,{isMoreThan10Percent});
      }
      return false;
    }
    
    
}
async function getMargins(kite){

    return await kite.getMargins();

}

export async function handleNoPosition(cis, kite) {


    if (!cis.minuteData || cis.minuteData.length < 1){

       // console.log('no min data',cis.minuteData,cis.tradingsymbol);
        

        global.addOrIncrementRejection('NO MINUTE DATA'+cis.tradingsymbol,cis.minuteData)

        return;
    } 


////
//console.log(cis.name);
//let m=await getMargins(kite)
//console.log(m.equity.net,'getMargins(kite)');


if (!canInitiateLongTrade(cis)) {


    global.addOrIncrementRejection('can InitiateLongTrade is false')
 if(global.minutes%15==0 && global.seconds==0)   console.log("Conditions are not favorable for a long trade.",cis.tradingsymbol);

   ///removed on 31st oct
 
 //return;
    // Proceed with initiating a long trade
    // Your code to initiate a long trade goes here
} else {
    if(global.minutes%15==0 && global.seconds==0)     console.log("Not bearish",cis.tradingsymbol);
}

    if(cis.noBuy){

        global.addOrIncrementRejection('cis no buy')
        return;
    }


    if(!cis.minuteData || !cis.tick){


        global.addOrIncrementRejection('cis no tick')
        return;
    }

    if(
        
       // checkLowerLowsAndLowerHighs(cis.minuteData) ||  removed on 31st 
(cis.pricePoints&& cis.pricePoints.d1) &&
        ( (cis.tick.last_price<cis.pricePoints.d1.low)
        
        ||cis.tick.last_price<cis.tick.ohlc.open)
        
        /// if below yesterday low no trade what ever
    
    
    ) {
        

        global.addOrIncrementRejection('below yesterday low or below days open'+cis.tradingsymbol)
    if(global.minutes%10==0 && global.seconds==5) console.log(cis.tradingsymbol,'d1low=',cis.pricePoints.d1.low,'lp=',cis.tick.last_price,checkLowerLowsAndLowerHighs(cis.minuteData),cis.tick.last_price<cis.pricePoints.d1.low,cis.tick.last_price<cis.tick.ohlc.open);
        
                return
              }
        

    const result = findSupportPoints(cis.minuteData);

    // Output the results
  
let lp1=cis.tick.last_price;
  

let sup=checkLastCandleOverSupportPoint(cis.minuteData.slice(-1)[0],result,lp1)
   // console.log("Support Points:", result,cis.tradingsymbol,sup);
 


   //disabled temp

    if(sup && cis.tick.last_price> cis.minuteData.slice(-1)[0].high   && false){


        console.log('SUPPORT BUYING OF,',sup,cis.tradingsymbol,lp1);
        let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite,lp1);
        }
    }
    


    if(global.seconds%2==0 && global.minutes%5==0)console.log('cis.highBeforeThreeMinutes',"last high :",cis.highBeforeThreeMinutes,"LTP:",cis.tick.last_price,cis.tradingsymbol);
    
   if (cis && cis.tick.last_price > cis.highBeforeThreeMinutes && !cis.ordered) {
    // Capture the entire cis object to preserve its state at this moment
    const capturedCis = JSON.parse(JSON.stringify(cis));

    // Log the intention to execute the trade after 2 minutes
    console.log('Trade condition met, will execute trade after 1 minutes:', capturedCis.tradingsymbol, capturedCis.tick.last_price);

    // Set a timeout to delay the trade execution by 2 minutes (120,000 milliseconds)

    let noLots = 2; // Adjust the number of lots as needed
    for (let i = 0; i < noLots; i++) {
      //  executeBuy(capturedCis, kite, cis.tick.last_price);
        executeBuy(cis, kite, cis.tick.last_price);
    }
 /*    setTimeout(() => {
        console.log('Executing trade for last high before 1 minute buy strategy:', capturedCis.tradingsymbol, capturedCis.tick.last_price);
        
       
    }, 600000); // 2 minutes in milliseconds */
}

    





/* if(!isRangeGreaterThanFive(cis)){

   // return;

} */

//added positve close ranges only
  


    if(global.seconds<55){

        return false;
        
            }


   
    /* if (global.seconds == 10) {
        if (cis.liveMinute.color == 'bullish') {
  
            let obj = {};
            obj.tradingsymbol = cis.tradingsymbol;
            obj.time = Date();
            obj.buyPrice = cis.tick.last_price;
            trades.push(obj);
        } else {
            let obj = trades[trades.length - 1];
            if (obj) {
                obj.sellPrice = cis.tick.last_price;
            }
        }


       // console.log(trades, 'trades');
    } */


     
       

     


    if (global.hours >= 9 && global.hours < 10) {
        handle9to10AM(cis, kite);
    } else if (global.hours >= 10 && global.hours < 12) {
        handle10to12PM(cis, kite);
    } else if (global.hours >= 12 && global.hours < 16) {
        handle12to4PM(cis, kite);
    }
}






