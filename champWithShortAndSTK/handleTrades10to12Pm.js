import findHighestPrice from './findElapsedHourHigh.js';
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import { isHammerCandle } from './hammerStrategy.js';
import { executeBuy } from './executeBuy.js';
import { checkGapDown } from './gapDownChecker.js';
import { hasManyUpperWicks } from './hasManyUpperWicks.js';

import { regressionBreakoutTrading } from './regressionBreakOutTrading.js';
//global.regressionBreakoutTrading=regressionBreakoutTrading;

export function handle10to12PM(cis, kite) {

    //regressionBreakoutTrading(cis);
    

    cis.qualifiedForTrade=true;

   
    if (global.seconds == 30) {
        displayScripts(kite);
     }
   


   

            if (cis.liveMinute.color == 'bearish') {
                cis.message = 'Live minute Color bearish, no entry ' + cis.tradingsymbol;
                if (global.seconds == 57) {
                   // console.log(cis.message, cis.liveMinute.color, 'live color red rejection');
                }


               // return; // Exit if the candle is bearish  removed on 31st 
            }
    // Check if there is a gap down or last price is less than open price
    if (
        checkGapDown(cis) || 
        cis.tick.last_price < cis.tick.ohlc.open
    ) {
        if (global.minutes % 5 == 0 && global.seconds == 57) {
            console.log(cis.tradingsymbol, 'is gap down, no morning trades or less than open price');
        }

        global.addOrIncrementRejection('GAP DOWN 12-14'+cis.tradingsymbol)
        return false; // Exit condition
    }

   // let secondLastCandleHigh = cis.minuteData.slice(-2, -1)[0].high;
    let lastCandleHigh = cis.minuteData.slice(-1)[0].high;

    // Exit if last price is less than last candle's high
    if (lastCandleHigh > cis.tick.last_price) {
        if (global.seconds == 57) {
           // console.log(cis.tradingsymbol, 'below last candle high', cis.tradingsymbol); on 31st
        }
        // return; // Exit condition  removed on 31st
    }


 
    
    let h = findHighestPrice(cis);

    if (global.seconds == 57) {
       // console.log('Lp ABOVE OPEN and status of H and LTP', cis.tradingsymbol, h, cis.tick.last_price);
    }

    let proceedToTrade = false;
    cis.buyCriteria = 'Buy Above Open and Last hour High'; // Reset the buy criteria flag

    // Breakout Strategy: 15-minute breakout condition
    let {
        breakoutOccurred,
        lastPrice,
        highestHigh,
        lowestLow,
        priceRange,
        targetPrice,
        stopLoss,
    } = is15MinuteBreakout(cis.minuteData, cis.tick.last_price);

    // Separate checks for different strategies
    if (breakoutOccurred) {

      /*   const candleHeight = highOfLast3Candles - lowOfLast3Candles;
        const target = highOfLast3Candles + (candleHeight * 0.2);
        const stopLoss = lowOfLast3Candles + (candleHeight / 2);

        //Set target and stop-loss in `cis`

        */
        //specialTrade=true;
        cis.targetPrice = targetPrice,
        cis.stopLossPrice = stopLoss;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 


         cis.buyStrategy='15minBreakOut'
        //cis.timeDelayRequired=true;
       // cis.timer=1000*60;
        proceedToTrade = true;
        if (global.seconds == 57) console.log('15-minute breakout occurred in 10-12 PM', cis.tradingsymbol);
    }

    // Check if last price is greater than highest price of the hour and the last candle's high is below `h`
    if (cis.tick.last_price > h && cis.minuteData.slice(-1)[0].high < h) {
        proceedToTrade = true;
        if (global.seconds == 57) console.log('Price above hourly high and below last candle high', cis.tradingsymbol);
    }

    // Strategy 1: Check for Open=Low condition at specific seconds
    if (isOpenLowAtSpecificSeconds(cis)) {
        proceedToTrade = true;
        if (global.seconds == 57) console.log('Open=Low condition detected at specific seconds', cis.tradingsymbol);
    }

    // Strategy 2: Check for Three Black Crows Bullish Reversal
    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {
        cis.buyStrategy='3Crows'
        proceedToTrade = true;
        if (global.seconds == 57) console.log('Three Black Crows Bullish Reversal pattern detected', cis.tradingsymbol);
    }

    // Strategy 3: Check for Hammer Candle and price above last candle's high
    if (isHammerCandle(cis.minuteData.slice(-1)) && cis.tick.last_price > cis.minuteData.slice(-1)[0].high) {
       
        cis.buyStrategy='isHammer'
        proceedToTrade = true;
        if (global.seconds == 57) console.log('Hammer candle pattern detected and price above last candle high', cis.tradingsymbol);
    }

    if ( hasManyUpperWicks(cis.minuteData)) {
        proceedToTrade = true;
        if (global.seconds == 57) console.log('has many upper wick', cis.tradingsymbol);
    }

    // Log status periodically for debugging
    if (global.seconds == 57) {
        console.log('Status check at 53 handle trade 10-12', cis.tradingsymbol, { proceedToTrade });
    }


    if(cis.tick.last_price>cis.tick.ohlc.high){


        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 
        proceedToTrade = true;
        console.log('break day high', cis.tradingsymbol,'alst_price=',cis.tick.last_price,'day high','cis.tick.ohlc.high');

    }


   // console.log('cis.minuteData.splice(-1)[0]',cis.minuteData.splice(-1)[0]);



   if(
        
    cis.tick.last_price>   cis.pricePoints.d1.high  
|| cis.tick.last_price>   cis.pricePoints.d2.high  
|| cis.tick.last_price>   cis.pricePoints.d3.high  
|| cis.tick.last_price>   cis.pricePoints.d4.high  



){


    cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 


    console.log('yday break strategy',cis.tradingsymbol);
    
    proceedToTrade=true;

}
    

//console.log(cis.minuteData.splice(-1)[0],'cis.minuteData.splice(-1)[0]');

    if(cis.minuteData &&  cis.minuteData.splice(-1)[0]  && cis.minuteData.splice(-1)[0].high<cis.tick.ohlc.open && cis.tick.last_price>cis.tick.last_price){


        cis.targetPrice = cis.tick.last_price * global.targetPc
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true; 

        console.log('crossing oepon from bottom',cis.tradingsymbol);
        proceedToTrade=true;
    }

   if(global.minutes%2==0 && global.seconds==30) console.log('health check 10-12',cis.tradingsymbol,{proceedToTrade});
    
    // Execute the trade if any of the conditions are met
    if (proceedToTrade) {
        cis.buyCriteria = '10-12 PM'; // Set the buy criteria flag
        let noLots = 2; // Adjust the number of lots as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite, cis.tick.last_price);
        }
    }
}
