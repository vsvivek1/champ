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


let trades = [];


async function getMargins(kite){

    return await kite.getMargins();

}

export async function handleNoPosition(cis, kite) {


////
//console.log(cis.name);
//let m=await getMargins(kite)
//console.log(m.equity.net,'getMargins(kite)');


if (!canInitiateLongTrade(cis)) {

 if(global.minutes%15==0 && global.seconds==0)   console.log("Conditions are not favorable for a long trade.",cis.tradingsymbol);

    return;
    // Proceed with initiating a long trade
    // Your code to initiate a long trade goes here
} else {
    if(global.minutes%15==0 && global.seconds==0)     console.log("Not bearish",cis.tradingsymbol);
}

    if(cis.noBuy){


        return;
    }


    if(!cis.minuteData || !cis.tick){

        return;
    }

    if(
        
        checkLowerLowsAndLowerHighs(cis.minuteData)

        || (cis.tick.last_price<cis.pricePoints.d1.low)
        
        ||cis.tick.last_price<cis.tick.ohlc.open
        
        /// if below yesterday low no trade what ever
    
    
    ) {
        

    if(global.minutes%10==0 && global.seconds==5) console.log(cis.tradingsymbol,'d1low=',cis.pricePoints.d1.low,'lp=',cis.tick.last_price,checkLowerLowsAndLowerHighs(cis.minuteData),cis.tick.last_price<cis.pricePoints.d1.low,cis.tick.last_price<cis.tick.ohlc.open);
        
                return
              }
        

    const result = findSupportPoints(cis.minuteData);

    // Output the results
  
let lp1=cis.tick.last_price;
    let sup=checkLastCandleOverSupportPoint(cis.minuteData.slice(-1)[0],result,lp1)
   // console.log("Support Points:", result,cis.tradingsymbol,sup);
 

    if(sup && cis.tick.last_price> cis.minuteData.slice(-1)[0].high){


        console.log('SUPPORT BUYING OF,',sup,cis.tradingsymbol,lp1);
        let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite,lp1);
        }
    }
    


   // if(global.seconds%5==0)console.log('cis.highBeforeThreeMinutes',cis.highBeforeThreeMinutes,cis.tradingsymbol);
    
   if (cis && cis.tick.last_price > cis.highBeforeThreeMinutes && !cis.ordered) {
    // Capture the entire cis object to preserve its state at this moment
    const capturedCis = JSON.parse(JSON.stringify(cis));

    // Log the intention to execute the trade after 2 minutes
    console.log('Trade condition met, will execute trade after 2 minutes:', capturedCis.tradingsymbol, capturedCis.tick.last_price);

    // Set a timeout to delay the trade execution by 2 minutes (120,000 milliseconds)
    setTimeout(() => {
        console.log('Executing trade for last high before 1 minute buy strategy:', capturedCis.tradingsymbol, capturedCis.tick.last_price);
        
        let noLots = 2; // Adjust the number of lots as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(capturedCis, kite, lp1);
        }
    }, 120000); // 2 minutes in milliseconds
}

    


if(cis.tick.last_price<cis.pricePoints.d1.low){

if(global.minutes%10==0 && global.seconds%30==0){


    console.log('less than yesterday low for',cis.tradingsymbol,'going for support buy only');
}

   


 
    
    return;
}else{


    if( global.minutes%10==0 && global.seconds%30==0){

        console.log('above than yesterday low for',cis.tradingsymbol,'looking for breakout');
        
    }
     
}


//added positve close ranges only
  
let c = cis.minuteData.slice(-5, -1)
  .map(c1 => c1.high - c1.low);

let lp = cis.tick.last_price;

// Calculate the average range of the last 5 candles
let sum = c.reduce((acc, value) => acc + value, 0);
let average = sum / c.length;

let isMoreThan10Percent = average > (0.05 * lp);

/* && cis.tick.last_price > cis.tick.open 
    && cis.tick.last_price > cis.pricePoints.d1.low */


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

} else {
  if (global.seconds % 30 === 0 && global.minutes%10==0) {
    console.log('range not greater than 5 pc average. So no trading', 
                cis.tradingsymbol, 'range=',average, 'last price=',cis.tick.last_price,{isMoreThan10Percent});
  }
  return;
}



    if(global.seconds<55){

        return false;
        
            }


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
