import { executeBuy } from "./executeBuy.js";
import { isHammerCandle } from "./hammerStrategy.js";
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import findHourlyHighestPrice from './findElapsedHourHigh.js';
import { compareVolatility } from './compareVolatility.js';
import { hasManyUpperWicks } from './hasManyUpperWicks.js';
import {isLastCandleBodySmallAndLastPriceCrossedItsHigh} from './isLastCandleBodySmall.js'
import { regressionBreakoutTrading } from "./regressionBreakOutTrading.js";

import { highAfter11AM } from './highAfter11.js';
export function handle12to4PM(cis, kite) {


    
    
    if (global.seconds === 30) {
        displayScripts(kite);
     }
   

    if(global.seconds<50){

return false;

    }

    let h2 = findHourlyHighestPrice(cis);
    let previousCandleClose = cis.minuteData.slice(-2, -1)[0].close;
    let lastCandleClose = cis.minuteData.slice(-1)[0].close;
    let lastCandleHigh = cis.minuteData.slice(-2, -1)[0].high;
    if(cis.tick.last_price<1){

        global.addOrIncrementRejection('LAST PRICE LESS THAN 1'+cis.tradingsymbol)

        return;
    }
   // Exit if live minute is bearish
   if (cis.liveMinute.color === 'bearish') {
    cis.message = 'Live minute Color bearish, no entry ' + cis.tradingsymbol;
    if (global.seconds == 57 && global.minutes%5==0)  //console.log(cis.message, cis.liveMinute.color, 'live color red rejection');
    return;
}

if (cis.tick.last_price < lastCandleHigh) {
     if (global.seconds == 57 && global.minutes%5==0) console.log('ltp less than last candle high', cis.tradingsymbol, lastCandleHigh);
    // return;
 }


 
const result = compareVolatility(cis.minuteData);
//console.log('Last 5 candles volatility:',cis.tradingsymbol, result.lastFiveVolatility);
//console.log('Previous 10 candles volatility:',cis.tradingsymbol, result.previousTenVolatility);

if(cis.minuteData && cis.minuteData.length>15 &&  result && 
    result.lastFiveVolatility>result.previousTenVolatility*1.4

    && cis.tick.last_price>cis.minuteData.slice(-1)[0].high
    
    && (global.seconds ==59)
    
    ){



        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
       cis.buyStrategy='volatality cross'
            cis.buyCriteria = 'volatality cross';
            let noLots = 3; // Adjust as needed
            for (let i = 0; i < noLots; i++) {
                let price = cis.tick.last_price;
                executeBuy(cis, kite, price);
            }
            console.log('Comparison result:',cis.tradingsymbol, result.comparison);

            return;
    }
   
            if (global.seconds == 57 && global.minutes%5==0)  console.log('health here', cis.tradingsymbol);

   // return;

    let proceedToTrade = false;

 

    // Exit if last price is less than the last candle's high
   

 
    // Strategy 1: h2 breakout condition (previous close < h2 and current close > h2)
    if (previousCandleClose < h2 && lastCandleClose > h2  && (global.seconds ==59)) {
        cis.buyStrategy='Noon High BreakOut'
        proceedToTrade = true;

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
 console.log('h2 breakout occurred', cis.tradingsymbol);
    }

    // Strategy 2: 15-minute breakout
    let {
        breakoutOccurred,
    } = is15MinuteBreakout(cis.minuteData, cis.last_price);

    if (breakoutOccurred ) {

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 

        cis.buyStrategy='15MinBreakout'

        cis.timeDelayRequired=true;
        cis.timer=1000*60;
       proceedToTrade = true;
       console.log('15-minute breakout occurred', cis.tradingsymbol);
    }

    // Strategy 3: Three Black Crows Bullish Reversal
    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
        cis.buyStrategy='3Crows'
       // proceedToTrade = true;
       console.log('Three Black Crows pattern detected', cis.tradingsymbol);
    }

    // Strategy 4: Hammer Candle
    if (isHammerCandle(cis.minuteData.slice(-1)[0])) {

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
 cis.buyStrategy='isHammer'
 proceedToTrade = true;
     console.log('Hammer candle pattern detected', cis.tradingsymbol);
    }

    if ( hasManyUpperWicks(cis.minuteData)) {

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
         cis.buyStrategy='hasManyUpperWicks'
        proceedToTrade = true;
      console.log('has many upper wick', cis.tradingsymbol);
    }


    if(cis.tick.last_price>cis.tick.ohlc.high  && (global.seconds ==59)){

        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 

        cis.buyStrategy='lastPriceAboveOHLCHigh'
        proceedToTrade = true;
        console.log('break day high', cis.tradingsymbol,'alst_price=',cis.tick.last_price,'day high','cis.tick.ohlc.high');

    }

  if(global.minutes%5==0){



    if(global.seconds==58) console.log('Do not Trade manually \nJUST BEFORE PROCEED TO TRADE procced to health 12-15 health check',cis.tradingsymbol,{proceedToTrade});
  } 
    


 // proceedToTrade=false;

  //console.log('ivide',regressionBreakoutTrading(cis),'regressionBreakoutTrading(cis)',{proceedToTrade});
  

 if(regressionBreakoutTrading(cis))  {


       cis.buyStrategy='REGRESSION TRADING'
       console.log('regression trading',cis.tradingsymbol);
       


       //need to corr3ct this
    //proceedToTrade=true;
 }


 if(
    
    cis.minuteData.slice(-1)[0].low==cis.minuteData.slice(-1)[0].open 

    && cis.minuteData.slice(-1)[0].high==cis.minuteData.slice(-1)[0].close

    && Math.abs(cis.minuteData && cis.minuteData.length &&  cis.minuteData.slice(-1)[0].close-cis.minuteData.slice(-1)[0].open)>cis.minuteData.slice(-1)[0].open*.05
){
    cis.targetPrice = cis.tick.last_price * global.targetPc
    cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
    cis.inbuiltTarget = true;
    cis.inbuiltStopLoss = true; 

    cis.buyStrategy='Marubozoiur buying'
    console.log('rMarubozoiur buying',cis.tradingsymbol);
    

 proceedToTrade=true;

}


 /*  if(isLastCandleBodySmallAndLastPriceCrossedItsHigh ){
     cis.buyStrategy='lastCandleBodySmallAndPriceCrossedHigh'
    proceedToTrade=true;
  } */
    // Execute buy logic if any of the strategies meet the criteria

    //console.log(global.allInstruments.map(i=>i.tradingsymbol,),'trading symbols');
    


    const resul = highAfter11AM(cis);
    
//console.log("Highest Point:", resul.highest),cis.tradingsymbol;
//console.log("Lowest Point:", resul.lowest,cis.tradingsymbol);

if(cis.minuteData.slice(-1)[0].low<resul.highest && cis.tick.last_price>resul.highest){
    cis.buyStrategy='HighCrossAfter11'
    console.log('high cross after 11 am',cis.tradingsymbol);
    

    cis.targetPrice = cis.tick.last_price * global.targetPc
    cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
    cis.inbuiltTarget = true;
    cis.inbuiltStopLoss = true; 

 proceedToTrade=true;

}


if(global.seconds%5==0 && global.minutes%5==0){
    console.log('12-4 health check sample trading symbols',
       global.instrumentsForMining.map(i=>i.tradingsymbol),
        
        
        cis.tradingsymbol,{proceedToTrade});

}


    if (proceedToTrade) {
        cis.buyCriteria = '12-4 PM';
        let noLots = 3; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            let price = cis.tick.last_price;
            executeBuy(cis, kite, price);
        }
    }
}
