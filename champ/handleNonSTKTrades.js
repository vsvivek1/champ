// ==== IMPORTS ====
import { buyAboveOpenAtNineAm } from "./buyAboveOpenAtNineAm.js";
import { buyAtHugeLastTick } from "./buyAtHugeTick.js";
import { validateCISTradeConditions } from "./handleCISTTradeConditions.js";
import { handleLongLowerShadowTrades } from "./handleLongLowerShadowTrades.js";
import { handleNminuteBreakout } from "./handleNminutesBreakOut.js";
import { handleReversalTrades } from "./handleReversalTrades.js";
import { handleGeneralTrades } from "./handleTrade.js";
import { handleLastCandleHighBelowMA20 } from './handleLastCandleHighBelowMA20.js';
import { handleHammerCandleTrade } from './handleHammerCandleTrade.js';
import { handleAfternoonBreakouts } from './handleAfternoonBreakouts.js';
import { handleYesterdayHighCross } from './handleYesterdayHighCross.js';
import { handleManyUpperWicks } from './handleManyUpperWicks.js';
import { handleThreeBlackCrowsReversal } from './handleThreeBlackCrowsReversal.js';
import { handleOpenLowAtSpecificSeconds } from './handleOpenLowAtSpecificSeconds.js';
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from "./checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js";
import { checkLowerLowsAndLowerHighs } from "./checkLowerLowsAndLowerHighs.js";
import { cross20MaWith10CandlesBelow } from "./cross20MaWith10CandlesBelow.js";
import { checkGapDown } from "./gapDownChecker.js";
import { handleShortNonSTKTrades } from "./handleShortNonSTKTrades.js";
import e from "cors";
import { handleMA20Reclaim } from './handleMa20Reclaim.js';


// ==== MAIN FUNCTION ====
export async function handleNonSTKTrades(cis, kite) {

      if (typeof cis.tick == 'undefined' || typeof cis.tick.ohlc == 'undefined' || typeof cis.ma20 == 'undefined') {

cis.returnPoints = `cis.tick or cis.tick.ohlc or cis.ma20 is undefined for ${cis.tradingsymbol}`;
cis.signals.safePassTickHealth=false
        return
      }
     cis.signals.safePassTickHealth=true; 


//     if (cis.placedOrder==true) {


// //order status for  SENSEX25JUL81900PE buyPrice undefined orderId targetSet undefined stopLossSet undefined entryPrice 478 averageRange 12.301234567901236 ordered true targetPrice nil stopLossPrice nill

   
        

//         return false;
//     }
     

    if (global.enableShortTrading) {
    const shorted = await handleShortNonSTKTrades(
        cis,
        kite,
        shortOptionOrder,
        shouldShortBasedOnMA20,
        check20MAcrossFromAbove,
        redCandleAfterThreeGreen
    );
    if (shorted) return;
}

    // if (
        
    //     // cis.tick.last_price < cis.tick.ohlc.open &&
        
        
    //     !(cis.expiryDay && global.hours > 11)) {
    //     cis.signals.aboveDayOpen = false;
    //     cis.returnPoints = `LTP ${cis.tick.last_price}  is less than, Open Price ${cis.tick.ohlc.open}`;
    //     cis.saidItsAbove = false;
    //     cis.saidItBelow = true;
    //     return;
    // } else {
    //     cis.signals.aboveDayOpen = true;
    //     if (global.seconds % 1 == 0 && !cis.saidItsAbove) {
    //         console.warn('ltp above open', `for ${cis.tradingsymbol} so proceeding`);
    //         cis.saidItsAbove = true;
    //         cis.saidItBelow = false;
    //     }
    // }


// if(cis.ordered==true){
// //console.log('cis.ordered is true, so returning',cis.tradingsymbol);
//         return;

//     }




 if (!cis || typeof cis.ma20 == 'undefined') {

    //console.error(`MA20 is undefined for ${cis.tradingsymbol}, cannot proceed.`);
    cis.signals.aboveMA20 = false;
    cis.returnPoints = `MA20 is undefined for ${cis.tradingsymbol}`;
    return;
 }
 

    
if(cis.tick.last_price<cis.ma20){

    cis.signals.aboveMA20 = false;

    cis.returnPoints = `LTP ${cis.tick.last_price} is less than MA20 ${cis.ma20}`;
   // cis.signals.aboveDayOpen = false
    return;
}


cis.signals.aboveMA20 = true;
   // cis.signals.aboveDayOpen = true;

if(cis.tick.last_price < cis.vwap){

cis.signals.lastPriceGreaterThanVWAP= false
cis.returnPoints = `LTP ${cis.tick.last_price} is less than VWAP ${cis.vwap}`;
    return;
} ;
cis.signals.lastPriceGreaterThanVWAP= true;


    let gd = checkGapDown(cis);
    if (gd && global.hours < 11) {
        cis.signals.safePassGapDownTill11 = false;
        cis.returnPoints= `Gap Down detected:  Open Price ${cis.tick.ohlc.open} is less than Previous Close ${gd}  `;
        return;
    }
    cis.signals.safePassGapDownTill11 = true;

   
   
    if (global.hours == 15 && global.minutes > 15){

cis.returnPoints = `Market closing soon, so not placing any orders`;
   cis.signals.safePassClosingTime=false;

        return;

    } 
    cis.signals.safePassClosingTime=true

   

    if (cis.liveMinute.color == 'bearish') {
        cis.signals.safePasscheckcis_liveMinute_colorBearish = false;
        cis.returnPoints
        return false;
    }
    cis.signals.safePasscheckcis_liveMinute_colorBearish = true;

   
    // if (checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis)) {
    //     cis.signals.safePasscheckPenultimateGreenAndLastSmallBodyOrLowerHigh = false;
    // }

   // cis.signals.safePasscheckPenultimateGreenAndLastSmallBodyOrLowerHigh = true;

    if (cis.operatorBuyCandles.fifteenMinutes == false) {
        cis.signals.safepassOperatorCandleCheck = false;

        cis.returnPoints = `Operator candles in 15 minutes not found for ${cis.tradingsymbol}`;
       // console.warn(`⚠️ Operator candles in 15 minutes not found for ${cis.tr
        return false;
    }

    cis.signals.safepassOperatorCandleCheck = true;
    cis.signals.operatorCandlesIn15Minutes = true;
    cis.signals.safePassGapDownTill11 = true;

    // if (checkLowerLowsAndLowerHighs(cis)) {
    //     cis.signals.safeproceedLowerLowsAndLowerHighs = false;
    // }
   // cis.signals.safeproceedLowerLowsAndLowerHighs = 'NA';

    // if (typeof cis.ma20 !== 'undefined' && typeof cis.displayedMa20 !== 'undefined') {
    //     console.log('cis.ma20', cis.ma20, cis.tradingsymbol);
    //     cis.displayedMa20 = true;
    // }

  

    if (cis.tick.last_price < cis.ma20) {
        cis.signals.safePassLtpAboveMa20 = false;
        cis.returnPoints = `ltp less than moving average 20: MA20 ${cis.ma20}, LTP ${cis.tick.last_price}`;
        return;
    }
    cis.signals.safePassLtpAboveMa20 = true;

    if (!validateCISTradeConditions(cis)) {
        cis.signals.safepassCISTCheck = false;
        cis.returnPoints = 'CIST_HEALT-CHECK_FAILED';
        cis.entryHealth = 'CIST HEALTH CHECK FAILED';
    }
    cis.signals.safepassCISTCheck = 'NA';
    cis.entryHealth = 'validatedCISTradeConditions';
    



 //console.log(cis.ordered,'cis.ordered',cis.tradingsymbol);


///// trade entries

    if (handleReversalTrades(cis, kite)) return;
    cis.signals.handleReversalTrades = false;

    if (buyAboveOpenAtNineAm(cis, kite)) return;
    cis.signals.buyAboveOpenAtNineAm = false;

   // cis.signals.buyAtHugeLastTick = false;

    if (handleLongLowerShadowTrades(cis, kite)) return;
    cis.signals.handleLongLowerShadowTrades = false;

    if (handleNminuteBreakout(cis, kite, 60) && global.hours) return;
    cis.signals.handleNminuteBreakout60 = false;

    // if (handleNminuteBreakout(cis, kite, 30) && global.hours < 13) return;
    // cis.signals.handleNminuteBreakout30 = false;

    // if (handleNminuteBreakout(cis, kite, 15) && global.hours < 13) return;
    // cis.signals.handleNminuteBreakout15 = false;

    if (handleLastCandleHighBelowMA20(cis, kite)) return;
    cis.signals.handleLastCandleHighBelowMA20 = false;

    if (handleHammerCandleTrade(cis, kite)) return;
   



     if (handleMA20Reclaim(cis, kite)) return;
     cis.signals.handleMA20Reclaim = false;

    
    cis.entryHealth = 'exitAfterAllChecks';
    cis.signals.exitAfterAllEntryStrategyChecks = true;


    var cisx=cis;
    setTimeout(() => {
 cisx.signals.exitAfterAllEntryStrategyChecks=false

    },300)


    
    
    return;
}

// ==== UTILITY FUNCTIONS ====

async function shortOptionOrder(kite, cis) {
    let shortMultiplier = 4;
    for (let i = 0; i < shortMultiplier; i++) {
        try {
            const orderParams = {
                exchange: cis.exchange,
                tradingsymbol: cis.tradingsymbol,
                transaction_type: kite.TRANSACTION_TYPE_SELL,
                quantity: cis.lot_size,
                order_type: cis.order_type || kite.ORDER_TYPE_MARKET,
                product: cis.product || kite.PRODUCT_MIS,
                variety: kite.VARIETY_REGULAR,
                validity: kite.VALIDITY_DAY,
            };

            if (orderParams.order_type == kite.ORDER_TYPE_LIMIT && cis.tick.last_price) {
                orderParams.price = cis.tick.last_price;
            }

            const orderId = await kite.placeOrder(orderParams.variety, orderParams);
            console.log("Short order placed. Order ID:", orderId);
            return orderId;
        } catch (error) {
            console.error("Failed to place short order:", error);
        }
    }
}

function shouldShortBasedOnMA20(cis) {
    const data = cis.minuteData;
    const ltp = cis.tick.last_price;
    if (!data || data.length < 6 || ltp == undefined) return false;

    const lastIndex = data.length - 1;
    const recentCandles = data.slice(lastIndex - 5, lastIndex);
    const currentMA20 = data[lastIndex].ma20;

    const allHighsAboveMA20 = recentCandles.every(candle => candle.high > candle.ma20);
    const isLtpBelowMA20 = ltp < currentMA20;

    return allHighsAboveMA20 && isLtpBelowMA20;
}

function check20MAcrossFromAbove(cis) {
    if (!cis.ma20 || !cis.tick?.ohlc || cis.minuteData.length < 4) return false;

    const [prev3, prev2, prev1, last] = cis.minuteData.slice(-4);
    const ema = last.ema20;

    return last.low < ema && prev1.low > ema && prev2.low > ema && prev3.low > ema;
}

function checkShootingStar(cis) {
    const last = cis.tick?.ohlc;
    if (!last) return false;

    return last.close < last.open &&
        (last.high - last.close) > 2 * (last.open - last.close) &&
        (last.high - last.open) > 2 * (last.open - last.close);
}

function redCandleAfterThreeGreen(cis) {
    if (!cis.minuteData || cis.minuteData.length < 4) return false;

    const [prev3, prev2, prev1, last] = cis.minuteData.slice(-4);

    return last.close < last.open &&
        prev1.close > prev1.open &&
        prev2.close > prev2.open &&
        prev3.close > prev3.open;

    // return false; // hardcoded override previously present
}


// function checkMA20ReclaimFollowThrough(cis) {
//     const candles = cis.minuteData;
//     if (!candles || candles.length == 0) return { buyOption: false };

//     const last = candles.at(-1);
//     const ma20 = cis.ma20;
//     const ltp = cis.last_price;

//     const isReclaim = last.low < ma20 && last.close > ma20 && ltp > ma20;


//     return isReclaim;

//     return {
//         buyOption: isReclaim,
//         strategyName: isReclaim ? "MA20 Reclaim with Follow-Through" : null
//     };
// }
