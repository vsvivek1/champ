// handleNoPosition.js

import { executeBuy } from './executeBuy.js';

import { executeShorting } from './executeShorting.js';




import { isLastPriceAboveMaxOfPrev15, highestPointAfter12PM, OpenPriceAfter12PM } from './tickSupport.js';
import { checkLastCandleIsHammer, isHammerCandle } from './hammerStrategy.js';
import { checkThreeBlackCrowsBullishReversal } from './checkThreeBlackCrowsBullishReversal.js';
import { is15MinuteBreakout } from './is15MinuteBreakout.js';
import { handle10to12PM } from './handleTrades10to12Pm.js';
import { handle12to4PM } from './handle12to4PM.js';
import { handle9to10AM } from './handle9to10Am.js';
import { isOpenLowAtSpecificSeconds } from './isOpenLowAtSpecifiedSeconds.js';
import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';
import { checkGapDown } from './gapDownChecker.js';
import { findSupportPoints } from './findSupportPoints.js';
import { checkLastCandleOverSupportPoint } from './checkLastCandleOverSupportPoints.js';
import { canInitiateLongTrade } from './tradeCheckFunctions.js';
import { analyzeTwoRedCandles } from './analyzeTwoRedCandles.js';
import { reversalCheck } from './reversalCheck.js';



import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
import {handleTrades}  from './handleTrade.js';

import {checkPenultimateGreenAndLastSmallBodyOrLowerHigh} from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js'


import {checkLastPriceAgainstPreviousCandles} from './checkLastPriceAgainstPreviousCandles.js'

import {checkLiveMinuteSmallBodyRedOrLongUpperShadow} from './checkLiveMinuteSmallBodyRedOrLongUpperShadow.js';
import { colorPatternBuying } from './colorPatternBuying.js';
import getTimeFactorAndElapsedMinutes from './getTimeFactorAndElapsedTime.js';
import { handleSTKTrades } from './handleSTKTrades.js';
import { handleNonSTKTrades } from './handleNonSTKTrades.js';
//import {penultimateGreenLastSmallBodyOrLowerHigh} from '.'

//import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';











function handleReversalTrades(cis, kite) {
    const rversa = reversalCheck(cis.minuteData, cis);
    if (rversa) {

        cis.signals.reversa30=true
        cis.buyStrategy = 'rversa30';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true; // Indicates a trade was executed
    }else{

        cis.signals.reversa30=false;
    }
    return false;
}



function handleTimeBasedTrades(cis, kite) {

    return;
    if (global.hours >= 9 && global.hours < 10) {
        handle9to10AM(cis, kite);
    } else if (global.hours >= 10 && global.hours < 12) {
        handle10to12PM(cis, kite);
    } else if (global.hours >= 12 && global.hours < 16) {
        handle12to4PM(cis, kite);
    }
}

function validateCISTradeConditions(cis) {


    // General Rejection Checks


if(
    !cis.operatorBuyCandles

    || !cis.operatorBuyCandles.allCandles

){


    if(typeof cis.returnPoints=='undefined'){

        cis.returnPoints=[];
        
    }

    cis.entryHealth='NO OPERATOR BUY CANDLES FOUND'
    cis.returnPoints.push('NO OPERATOR BUY CANDLES FOUND')

    return false;

}

    if (cis.tick.last_price < 1) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
            
        }

        cis.entryHealth='LAST PRICE LESS THAN 1'
        cis.returnPoints.push('less than one ')

        global.addOrIncrementRejection("LAST PRICE LESS THAN 1: " + cis.tradingsymbol);
        return;
    }

    if (cis.liveMinute.color === "bearish") {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
           
        }
        cis.returnPoints.push('live candle bearish ') 
       cis.entryHealth='live candle bearish'
        
        global.addOrIncrementRejection("LIVE CANDLE BEARISH: " + cis.tradingsymbol);
        return;
    }

    if (checkGapDown(cis)) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];
            cis.returnPoints.push('Gap down ')
        }
             cis.entryHealth='Gap down '
        global.addOrIncrementRejection("GAP DOWN: " + cis.tradingsymbol);
        return;
    }

    // Time-Specific Strategies
    // if (global.hours === 9 && global.minutes < 30) {
    //     // Early morning specific strategies
    //     if (cis.tick.last_price < cis.tick.ohlc.open) {

    //         if(typeof cis.returnPoints=='undefined'){

    //             cis.returnPoints=[];
    //             cis.returnPoints.push('below open')

    //             cis.entryHealth='below open AT 9'
    //         }else{

    //             cis.returnPoints.push('below open')

    //               cis.entryHealth='below open AT 9 RET POINTS'
    //         }
    //         console.log(cis.tradingsymbol, "Price below open, skipping trade.");
    //         return;
    //     }
    
    // }
    ///

    if(!cis.isAboveOpen){

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('Below Open')
        
        return false;
    }
    if (cis.tick.last_price < 5) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
          
        
        global.addOrIncrementRejection('Price too low');
        cis.returnPoints.push('Below 5 Rs')
        return false;
    }

    if (cis.noBuy) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('cis no buy time')
        
        global.addOrIncrementRejection('cis no buy');

        cis.returnPoints.push('cis no buy')
        return false;
    }

    if ( !cis.tick) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('no tick')
        
        global.addOrIncrementRejection('cis no tick');

        cis.returnPoints.push('cis no tick')
        return false;
    }

    if (!cis.minuteData ) {

        if(typeof cis.returnPoints=='undefined'){

            cis.returnPoints=[];}
            cis.returnPoints.push('no minute data')
        
        global.addOrIncrementRejection('no minute data');
        return false;
    }

    cis.returnPoints.push('no minute data')



      cis.entryHealth='NOTHING PICKED IN CIST'
    return true;
}

function handleGeneralTrades(cis, kite) {
    handleTrades(cis, kite);
}



export async function handleNoPosition(cis, kite) {
    let { timeFactor, elapsedMinutes } = getTimeFactorAndElapsedMinutes();

    if (global.instrumentName == 'STK') {

        
        handleSTKTrades(cis, kite);
    } 
    
    else
    
    {
        cis.entryHealth='HanleNonStkTrades'

   
        handleNonSTKTrades(cis, kite);
    }
}
