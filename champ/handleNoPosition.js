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
import { handleTrades } from './handleTrade.js';

import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { checkLastPriceAgainstPreviousCandles } from './checkLastPriceAgainstPreviousCandles.js';
import { checkLiveMinuteSmallBodyRedOrLongUpperShadow } from './checkLiveMinuteSmallBodyRedOrLongUpperShadow.js';
import { colorPatternBuying } from './colorPatternBuying.js';
import getTimeFactorAndElapsedMinutes from './getTimeFactorAndElapsedTime.js';
import { handleSTKTrades } from './handleSTKTrades.js';
import { handleNonSTKTrades } from './handleNonSTKTrades.js';



function handleReversalTrades(cis, kite) {
    const rversa = reversalCheck(cis.minuteData, cis);
    if (rversa) {

        cis.buyStrategy = 'rversa30';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    } else {
       
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

      if (!cis.operatorBuyCandles || !cis.operatorBuyCandles.allCandles) {
        cis.entryHealth = 'NO OPERATOR BUY CANDLES FOUND';
        cis.returnPoints = 'NO OPERATOR BUY CANDLES FOUND';
        return false;
    }

    if (cis.tick.last_price < 1) {
        cis.entryHealth = 'LAST PRICE LESS THAN 1';
        cis.returnPoints = 'less than one';
        global.addOrIncrementRejection("LAST PRICE LESS THAN 1: " + cis.tradingsymbol);
        return false;
    }

    if (cis.liveMinute.color === "bearish") {
        cis.returnPoints = 'live candle bearish';
        cis.entryHealth = 'live candle bearish';
        global.addOrIncrementRejection("LIVE CANDLE BEARISH: " + cis.tradingsymbol);
        return false;
    }

    if (checkGapDown(cis)) {
        cis.returnPoints = 'Gap down';
        cis.entryHealth = 'Gap down';
        global.addOrIncrementRejection("GAP DOWN: " + cis.tradingsymbol);
        return false;
    }

    if (!cis.isAboveOpen) {
        cis.returnPoints = 'Below Open';
        return false;
    }

    if (cis.tick.last_price < 5) {
        cis.returnPoints = 'Below 5 Rs';
        global.addOrIncrementRejection('Price too low');
        return false;
    }

    if (cis.noBuy) {
        cis.returnPoints = 'cis no buy';
        global.addOrIncrementRejection('cis no buy');
        return false;
    }

    if (!cis.tick) {
        cis.returnPoints = 'no tick';
        global.addOrIncrementRejection('cis no tick');
        return false;
    }

    if (!cis.minuteData) {

        if (global.seconds %5==0){

 //setmarginCisOrdersAndPosition() ;
 



        }
        console.log(cis.minuteData, 'hi');
        cis.returnPoints = 'no minute data';
        global.addOrIncrementRejection('no minute data');
        return false;
    }

    cis.returnPoints = 'no minute data';
    cis.entryHealth = 'NOTHING PICKED IN CIST';
    return true;
}

function handleGeneralTrades(cis, kite) {
    handleTrades(cis, kite);
}

export async function handleNoPosition(cis, kite) {



    let { timeFactor, elapsedMinutes } = getTimeFactorAndElapsedMinutes();

    if (global.instrumentName == 'STK') {
        handleSTKTrades(cis, kite);
    } else {
        cis.entryHealth = 'HanleNonStkTrades';
        handleNonSTKTrades(cis, kite);
    }
}
