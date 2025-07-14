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


//import { handleNminuteBreakout } from './handleNminuteBreakout.js';



//isPenultimateGreen && (hasLowerHigh || isSmallBody


//checkGapDown
async function shortOptionOrder(kite, cis) {
  try {
    const orderParams = {
      exchange: cis.exchange,              // "NFO"
      tradingsymbol: cis.tradingsymbol,    // "NIFTY24JUL20000PE"
      transaction_type: kite.TRANSACTION_TYPE_SELL,
      quantity: cis.lot_size,              // e.g. 50
      order_type: cis.order_type || kite.ORDER_TYPE_MARKET,
      product: cis.product || kite.PRODUCT_MIS,
      variety: kite.VARIETY_REGULAR,       // for normal intraday order
      validity: kite.VALIDITY_DAY,
    };

    // Optional price for LIMIT order
    if (orderParams.order_type === kite.ORDER_TYPE_LIMIT && cis.tick.last_price) {
      orderParams.price = cis.tick.last_price;
    }

    const orderId = await kite.placeOrder(orderParams.variety, orderParams);
    console.log("Short order placed. Order ID:", orderId);
    return orderId;
  } catch (error) {
    console.error("Failed to place short order:", error);
  }
}



function check20MAcrossFromAbove(cis) {

    if (typeof cis.ma20 === 'undefined' || typeof cis.tick === 'undefined' || typeof cis.tick.ohlc === 'undefined') {
        //console.error("Required properties are not defined in cis object.");
        return false;
    }

    const len = cis.minuteData.length;

if (len >= 4) {
  const last = cis.minuteData[len - 1];
  const prev1 = cis.minuteData[len - 2];
  const prev2 = cis.minuteData[len - 3];
  const prev3 = cis.minuteData[len - 4];

  const ema = last.ema20;

  const condition =
    last.low < ema &&
    prev1.low > ema &&
    prev2.low > ema &&
    prev3.low > ema;

//  console.log('Condition met: 20 ma cross over from above', condition);

  return condition ? true : false;
} else {

    return false;
  //console.log('Not enough data');
}

}

var checkShootingStar = (cis) => {  
    if (typeof cis.tick === 'undefined' || typeof cis.tick.ohlc === 'undefined') {
        //console.error("Required properties are not defined in cis object.");
        return false;
    }

    const last = cis.tick.ohlc;

    // Check if the last candle is a shooting star
    const isShootingStar = last.close < last.open && 
                          (last.high - last.close) > 2 * (last.open - last.close) &&
                          (last.high - last.open) > 2 * (last.open - last.close);

   // console.log('Shooting star condition:', isShootingStar);

   return isShootingStar;
}

var redCandleAfterThreeGreen = (cis) => {
    if (typeof cis.minuteData === 'undefined' || cis.minuteData.length < 4) {
        //console.error("Not enough data to check for red candle after three green candles.");
        return false;
    }

    const len = cis.minuteData.length;
    const last = cis.minuteData[len - 1];
    const prev1 = cis.minuteData[len - 2];
    const prev2 = cis.minuteData[len - 3];
    const prev3 = cis.minuteData[len - 4];

    // Check if the last candle is red and the previous three candles are green
    const isRedCandleAfterThreeGreen = last.close < last.open &&
                                       prev1.close > prev1.open &&
                                       prev2.close > prev2.open &&
                                       prev3.close > prev3.open;

   // console.log('Red candle after three green condition:', isRedCandleAfterThreeGreen);

   return isRedCandleAfterThreeGreen;
}

export function handleNonSTKTrades(cis, kite) {

//console.log('terst')

    /// no trading below open . profit athu mathi decided



    // 


//!cis.position || if

 //if(cis.position)  console.log(cis.tradingsymbol, 'handleNonSTKTrades called',cis.position.quantity,'ma20',cis.ma20,'last price',cis.tick.last_price,'open',cis.tick.ohlc.open);
    if(
        global.enableShortTrading && cis.position &&


     (cis.position.quantity==0) &&

       // cis.tick.ohlc.open>cis.tick.last_price &&
         cis.ma20>cis.tick.last_price && !cis.shorted){




             

/// and what ???

///1

if(check20MAcrossFromAbove(cis)){

    cis.signals.safePass20MAcrossFromAbove=true;
    console.log('20 ma cross from above',cis.tradingsymbol)
     console.log('short ',cis.tradingsymbol)

        cis.shorted=true;
shortOptionOrder(kite, cis)


return;
}


//2
if(checkShootingStar(cis)){

    cis.signals.safePassShootingStar=true;
    console.log('shooting star',cis.tradingsymbol)
     console.log('short ',cis.tradingsymbol)
    
        cis.shorted=true;
shortOptionOrder(kite, cis)
return;
}

///3

if(redCandleAfterThreeGreen(cis)){

    cis.signals.safePassRedCandleAfterThreeGreen=true;
    console.log('red candle after three green',cis.tradingsymbol)
     console.log('short ',cis.tradingsymbol)
    
        cis.shorted=true;
shortOptionOrder(kite, cis)
return;
}


  
       
    
    
    
    
    if (cis.tick.last_price < cis.tick.ohlc.open && !(cis.expiryDay && global.hours > 13))
        /// if last price is less than open and not expiry day and not after 1pm then return
    {

            cis.signals.aboveDayOpen=false
        
            cis.returnPoints=`LTP ${cis.tick.last_price}  is less than  ,Open Price ${cis.tick.ohlc.open} `;

            
            cis.saidItsAbove=false;
            if(global.seconds%30==0)  {


                cis.saidItsAbove=false;

                cis.saidItBelow=true;

                //console.log(cis.returnPoints, `for ${cis.tradingsymbol} so returning no trading below open . profit athu mathi decided`)
            }  
            return;
        }
        else {
            cis.signals.aboveDayOpen=true;

            if(global.seconds%1==0 && !cis.saidItsAbove)  {console.warn('ltp abobe open', `for ${cis.tradingsymbol} so proceeding`);
            
            
            cis.saidItsAbove=true;

            cis.saidItBelow=false;

        
        }  
        
        }



/// no tick below open reach here

 let gd=checkGapDown(cis);



        if(gd&& global.hours<11){


              cis.signals.safePassGapDownTill11=false
            cis.returnPoints='gap down so no trade before 11' 
            return;
        }

        //if morning gap down till 11 no trade

    if(global.hours==15 && global.minutes>15) return;


    /// no trade after 15:15


    if(!cis || typeof cis.ma20=='undefined' )  return;

/// cis not defined or ma20 not defined no tick pass


    //if()
    
if(cis.liveMinute.color === 'bearish'){

    /// no buying being a red candle /// many times tested and found usefull in eleiminating losses

   cis.signals.safePasscheckcis_liveMinute_colorBearish=false;
        return false  
}

/// if current is bearish candle not going to buy

 cis.signals.safePasscheckcis_liveMinute_colorBearish=true

    if(checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis)){

        cis.signals.safePasscheckPenultimateGreenAndLastSmallBodyOrLowerHigh=false;
       

        // temporily bypassing
       /// return false;
    }


cis.signals.safePasscheckPenultimateGreenAndLastSmallBodyOrLowerHigh=true

 
  
   
//console.log(cis.operatorBuyCandles.fifteenMinutes,'15min')
        if(cis.operatorBuyCandles.fifteenMinutes==false){

             cis.signals.safepassOperatorCandleCheck=false

          //  console.log(cis.operatorBuyCandles,'op buy candles not present',cis.tradingsymbol)
            return false;
        }


cis.signals.safepassOperatorCandleCheck=true
cis.signals.operatorCandlesIn15Minutes=true;


       
         cis.signals.safePassGapDownTill11=true




    //checkLowerLowsAndLowerHighs
    if(checkLowerLowsAndLowerHighs(cis)){

cis.signals.safeproceedLowerLowsAndLowerHighs=false
       
//temporary byepassing
///return true;
    }
cis.signals.safeproceedLowerLowsAndLowerHighs='NA';
    


if(typeof cis.ma20!='undefined' && typeof cis.displayedMa20!='undefined') {

        console.log('cis.ma20',cis.ma20,cis.tradingsymbol)

        cis.displayedMa20=true
    }

   

if(typeof cis.tick=='undefined' || typeof cis.tick.ohlc=='undefined' || typeof cis.ma20=='undefined') return;



if(cis.tick.last_price<cis.tick.ohlc.open){

   // console.log(cis.tick.last_price,is.tick.ohlc.open)
///// very important dont ever remove this 
    

//wont work returning early
//cross20MaWith10CandlesBelow(cis,kite);
    
    //return;  //just one function for trades below open

//return false;
}







    
    if(cis.tick.last_price<cis.ma20 
        
        // && cis.minuteData.length>=


    ){
    
    
cis.signals.safePassLtpAboveMa20=false
        cis.returnPoints='ltp less than mooving average 20'+`MA20 ${cis.ma20},LTP ${cis.tick.last_price}`;
        //console.log(`last price   ${cis.tick.ohlc.last_price} less than ma20 ${cis.ma20} for ${cis.tradingsymbol} returning`)
        return ;
    }
    
   cis.signals.safePassLtpAboveMa20=true
    

   // console.log('cis.ohlc.last_price is greater than cis.ma20',cis.tick.last_price,cis.ma20)


    //return


    // if(cis.tick.last_price>cis.ma20 * 1.3){


    //     cis.signals.safePassHugeDiffOFLTPwithMA20=false
    //     return false
    // }
    //     cis.signals.safePassHugeDiffOFLTPwithMA20=true

   
    if (!validateCISTradeConditions(cis)) 
    {


        cis.signals.safepassCISTCheck=false;
        cis.returnPoints='CIST_HEALT-CHECK_FAILED';
        cis.entryHealth='CIST HEALTH CHECK FAILED'

        //temporary bye passing
        //return;
    }
      cis.signals.safepassCISTCheck='NA'  






     cis.entryHealth='validatedCISTradeConditions'
    // Handle time-based trades
    //handleTimeBasedTrades(cis, kite);



   // handleReversalTrades
    //handleNonSTKTrades
    // Handle reversal trades


    if (handleReversalTrades(cis, kite)) return; ///
cis.signals.handleReversalTrades=false

    //// case morning before 10 above open buy and sl at open and not gap down





    //buyAboveOpenAtNineAm
    if(buyAboveOpenAtNineAm(cis,kite)) return;
cis.signals.buyAboveOpenAtNineAm=false

    ///buy if its a huge tick


    //  if(buyAtHugeLastTick(cis,kite) ) return; // not doing this
    cis.signals.buyAtHugeLastTick=false
    
  
    // Handle long lower shadow trades
   // handleLongLowerShadowTrades


    if (handleLongLowerShadowTrades(cis, kite)) return;
     cis.signals.handleLongLowerShadowTrades=false

    // Handle general trades


    if (handleNminuteBreakout(cis, kite, 60) && global.hours<13) return;
   cis.signals.handleNminuteBreakout60=false;

    if (handleNminuteBreakout(cis, kite, 30) && global.hours<13) return;

     cis.signals.handleNminuteBreakout30=false;
    if (handleNminuteBreakout(cis, kite, 15)  && global.hours<13) return;

     cis.signals.handleNminuteBreakout15=false;

    if (handleLastCandleHighBelowMA20(cis, kite) ) return;

       cis.signals.handleLastCandleHighBelowMA20=false;

       
    if (handleHammerCandleTrade(cis, kite)) return;
  //  if (handleAfternoonBreakouts(cis, kite)) return;
    if (handleYesterdayHighCross(cis, kite)) return;
    //if (handleManyUpperWicks(cis, kite)) return;
   // if (handleThreeBlackCrowsReversal(cis, kite)) return;
   // if (handleOpenLowAtSpecificSeconds(cis, kite)) return;




    



   // handleNminuteBreakout


   // handleGeneralTrades
  //  handleGeneralTrades(cis, kite); //not working

    cis.entryHealth='exitAfterAllChecks'

    cis.signals.exitAfterAllEntryStrategyChecks=true;
return;

    //cis.hugeLastTick
}

}
