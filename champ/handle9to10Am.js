import { executeBuy } from "./executeBuy.js";
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import { isHammerCandle } from "./hammerStrategy.js";
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkGapDown } from './gapDownChecker.js';
import { hasManyUpperWicks } from './hasManyUpperWicks.js';

import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
export async function handle9to10AM(cis, kite) {

    // Check if there is a gap down or last price is less than open price
    if (
        checkGapDown(cis) || 
        cis.tick.last_price < cis.tick.ohlc.open
    ) {
        if (global.minutes % 5 == 0 && global.seconds == 57) {
            console.log(cis.tradingsymbol, 'is gap down, no morning trades or less than open price');
        }
        return false; // Exit condition
    }

    // Check for a no-buy time restriction
    if (cis.noBuyTime > global.date) {
        console.log('No buy allowed until ', cis.noBuyTime);
        return;
    }

    if(global.seconds<50){

        return false;
        
            }


    let proceedToTrade = false;
    cis.buyCriteria = null; // Reset the buy criteria flag

    let lastCandleHigh = cis.minuteData.slice(-1)[0].high;

    // Check if last price is less than last candle high
    if (cis.tick.last_price < lastCandleHigh) {
        if (global.seconds == 57) {
          //  console.log('ltp less than last candle high', cis.tradingsymbol, 'ltp',cis.tick.last_price ,'lstcndlehi',lastCandleHigh);
        }
       // return; // Exit until the price crosses over the last candle's high
    }

    // Check if the current candle color is bearish
    if (cis.liveMinute.color === 'bearish') {
        cis.message = 'Live minute Color bearish, no entry ' + cis.tradingsymbol;
        if (global.seconds == 57) {
            console.log(cis.message, cis.liveMinute.color, 'live color red rejection');
        }
        return; // Exit if the candle is bearish
    }

    // Breakout Strategy: 15-minute breakout condition
    let {
        breakoutOccurred,
    } = is15MinuteBreakout(cis.minuteData, cis.tick.last_price);

    if (breakoutOccurred) {
        proceedToTrade = true;

        cis.timeDelayRequired=true;
        cis.timer=1000*60;

         cis.entryStrategy='15minbreakoutOccurred'
        if (global.seconds == 57) console.log('15-minute breakout occurred in 9-10 AM', cis.tradingsymbol);
    }

    // Strategy 1: Check for Open=Low condition at specific seconds
    if (isOpenLowAtSpecificSeconds(cis)) {

         cis.entryStrategy='openLowAtSpeceficSecond'
       // proceedToTrade = true;
        if (global.seconds == 57) console.log('Open=Low condition detected at specific seconds', cis.tradingsymbol);
    }

    // Strategy 2: Check for Three Black Crows Bullish Reversal
    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {

         cis.entryStrategy='3blackCrows'
       // proceedToTrade = true;
        if (global.seconds == 57) console.log('Three Black Crows Bullish Reversal pattern detected', cis.tradingsymbol);
    }

    // Strategy 3: Check for Hammer Candle
    if (isHammerCandle(cis.minuteData.slice(-1)[0])) {

         cis.entryStrategy='isHammer'
        proceedToTrade = true;
        if (global.seconds == 57) console.log('Hammer candle pattern detected', cis.tradingsymbol);
    } 
    
    if ( hasManyUpperWicks(cis.minuteData)) {

             cis.entryStrategy='hasManyUpperWicks'
        proceedToTrade = true;
        if (global.seconds == 57) console.log('has many upper wick', cis.tradingsymbol);
    }


    if(
        cis.tick.last_price>cis.pricePoints.d1.high

        && cis.minuteData.slice(-2,-1)[0].close<cis.pricePoints.d1.high

        && cis.minuteData.slice(-1)[0].close>cis.pricePoints.d1.high
    
    ){

        if (global.seconds ==58) {

                       cis.entryStrategy='yesterdayHighCross'
            console.log('yesterday high cross', cis.tradingsymbol, { proceedToTrade });
        }

        proceedToTrade = true;

    }

    // Log status periodically for debugging
    if (global.seconds ==58) {
        console.log('Before proceeding to trade', cis.tradingsymbol, { proceedToTrade });
    }


    if(cis.tick.last_price>cis.tick.ohlc.high){
        proceedToTrade = true;
        console.log('break day high', cis.tradingsymbol,'alst_price=',cis.tick.last_price,'day high','cis.tick.ohlc.high');

    }
    // Execute the trade if any of the conditions are met
    if (proceedToTrade) {


        


        cis.buyCriteria = '9-10 AM'; // Set the buy criteria flag
        let noLots = 3; // Adjust the number of lots as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite, cis.tick.last_price);
        }
    }
}
