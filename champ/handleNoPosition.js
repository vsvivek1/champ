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
let trades = [];



export function handleNoPosition(cis, kite) {


    if (!cis.minuteData || cis.minuteData.length < 1) return;

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


     
       

      if(checkLowerLowsAndLowerHighs(cis.minuteData)) {
//if(global.seconds==31)console.log('Lower lows and no entry for ',cis.tradingsymbol);

        return
      }else{

      //  if(global.seconds==31)console.log('NO Lower lows can try tests ',cis.tradingsymbol);

      }




    if (global.hours >= 9 && global.hours < 10) {
        handle9to10AM(cis, kite);
    } else if (global.hours >= 10 && global.hours < 12) {
        handle10to12PM(cis, kite);
    } else if (global.hours >= 12 && global.hours < 16) {
        handle12to4PM(cis, kite);
    }
}



function handle9to10AMx(cis, kite) {

    if(
    
        checkGapDown(cis) ||
    
        cis.tick.last_price<cis.tick.ohlc.open
      
      ){
    
       if(global.minutes%5==0 && global.seconds==30) console.log(cis.tradingsymbol,'is gap down no morning trades or less than open price');
        
        return false;
      }
    

    if(cis.noBuyTime>global.date){

        console.log('no buy till ',cis.noBuyTime);
        
    }

    let proceedToTrade = false;
    cis.buyCriteria = null; // Reset the buy criteria flag

    // Morning session logic (9 AM - 10 AM)
    if (cis.tick.last_price< cis.tick.ohlc.open) {
        proceedToTrade = true;
        cis.location.ohlcBewlowcheck = false;
        cis.returns.push('LTP greater than or equal to open in 9-10 AM');
    
    return;
    }

  /*   if (cis.liveMinute.hasLongUpperShadow) {
        cis.message = 'Live minute has long upper shadow, not entering in 9-10 AM';
       // return;
    }
 */
   // const isLastCandleHammer = checkLastCandleIsHammer(cis.minuteData);

    //console.log(isHammerCandle(cis.minuteData.slice(-1)));
   
   // cis.colorTrading=true;


   let {
    breakoutOccurred,
    lastPrice,
    highestHigh,
    lowestLow,
    priceRange,
    targetPrice,
    stopLoss,
}=is15MinuteBreakout(cis.minuteData,cis.tick.last_price);

   ///conditions
   if 
    
    (
        breakoutOccurred||
        
        isOpenLowAtSpecificSeconds(cis) ||


    checkThreeBlackCrowsBullishReversal(cis.minuteData)
    ||

    isHammerCandle(cis.minuteData.slice(-1)) 
    
    
    ) {
        proceedToTrade = true;
    }



    if(cis.tick.last_price<cis.minuteData.slice(-1).high){
console.log('buy signal is there waiting for cross over last candl high',cis.tradingsymbol);
return;

    }


  
  

    if (global.seconds % 20==0){
       // console.log('Just before hammer check ',cis.tradingsymbol,'checking');

        console.log(cis.tradingsymbol,'Before Proceed to trade',cis.tradingsymbol,{proceedToTrade });
    

    }
        

         // || isLastPriceAboveMaxOfPrev15(cis.minuteData, cis)
    if (proceedToTrade ) {
        cis.buyCriteria = '9-10 AM'; // Set the buy criteria flag
        let noLots = 3; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite,cis.tick.last_price);
        }
    }
}



function handle12to4PMX(cis, kite) {

  
    
    
    let h2 =  OpenPriceAfter12PM(cis.minuteData);

    if (cis.tick.last_price < h2 || h2==-1){

        return;
    }



  //  console.log("opening price after 12 is ",h2,cis.tradingsymbol);

   /*  if (!isOpenLowAtSpecificSeconds(cis)) {
       


        return false;
        proceedToTrade = true;
    } */

    //console.log('open low suceeded',cis.tradingsymbol);
    let proceedToTrade = false;
    cis.buyCriteria = null; // Reset the buy criteria flag

    // Afternoon session logic (12 PM - 4 PM)
   


    if (cis.liveMinute.color == 'bearish') {
        cis.message = 'Bearish Live candle No Return' + cis.tradingsymbol;
      
        if(global.seconds%15==0) console.log(cis.message,cis.liveMinute.color);
   
       //return;
    }

   
    if(global.seconds%31==0)  console.log('isHammerCandle ->',isHammerCandle(cis.minuteData.slice(-1)),'',cis.tradingsymbol,h2,cis.tick.last_price,cis.liveMinute.color );
    if(global.seconds%31==0)console.log(checkThreeBlackCrowsBullishReversal(cis.minuteData),'is 3 black crows is');
    if(global.seconds%31==0)console.log(cis.liveMinute.color == 'bullish','Live candle bullish');
    
   
   // cis.colorTrading=true;



 if(
    
   ( isHammerCandle(cis.minuteData.slice(-1))
    || checkThreeBlackCrowsBullishReversal(cis.minuteData)



    && cis.tick.last_price>cis.minuteData.slice(-1).high


)
|| (cis.liveMinute.color == 'bullish' && global.seconds==58))


    {
    proceedToTrade=true
 if (global.seconds==10)   console.log('is hammer',cis.tradingsymbol);
    
   }
   
  


   if (proceedToTrade ) {
        cis.buyCriteria = '12-4 PM'; // Set the buy criteria flag
        let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) {

            let price = cis.tick.last_price

            console.log('execute buy ',cis.tradingsymbol);
            
            executeBuy(cis, kite,price);
        }
    }

    //return;
}
