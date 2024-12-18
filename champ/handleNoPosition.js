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
//import {penultimateGreenLastSmallBodyOrLowerHigh} from '.'

//import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';
function analyzeOHLCWithSlopeAndDegree(ohlcArray) {
    if (!ohlcArray || ohlcArray.length === 0) {

        return;
     // throw new Error("The OHLC array is empty or undefined.");
    }
  
    // Extract high and low values
    const highs = ohlcArray.map((candle, index) => ({ value: candle.high, index }));
    const lows = ohlcArray.map((candle, index) => ({ value: candle.low, index }));
  
    // Find the highest and lowest high values with their indices
    const highestHigh = highs.reduce((max, current) => (current.value > max.value ? current : max));
    const lowestHigh = highs.reduce((min, current) => (current.value < min.value ? current : min));
  
    // Find the highest and lowest low values with their indices
    const highestLow = lows.reduce((max, current) => (current.value > max.value ? current : max));
    const lowestLow = lows.reduce((min, current) => (current.value < min.value ? current : min));
  
    // Calculate the slope for highs
    const highSlope = (highestHigh.value - lowestHigh.value) / (highestHigh.index - lowestHigh.index);
    const highSlopeDegree = Math.atan(highSlope) * (180 / Math.PI);
  
    // Calculate the slope for lows
    const lowSlope = (highestLow.value - lowestLow.value) / (highestLow.index - lowestLow.index);
    const lowSlopeDegree = Math.atan(lowSlope) * (180 / Math.PI);
  
    return {
      highs: {
        highest: highestHigh.value,
        lowest: lowestHigh.value,
        ratio: highestHigh.value / lowestHigh.value,
        slope: highSlope,
        degree: highSlopeDegree,
        trend: highSlope > 0 ? "Up-trending" : "Down-trending"
      },
      lows: {
        highest: highestLow.value,
        lowest: lowestLow.value,
        ratio: highestLow.value / lowestLow.value,
        slope: lowSlope,
        degree: lowSlopeDegree,
        trend: lowSlope > 0 ? "Up-trending" : "Down-trending"
      }
    };
  }
let trades = [];

function isRangeGreaterThanFive(cis) {
    let c = cis.minuteData.slice(-5, -1).map(c1 => c1.high - c1.low);
    let lp = cis.tick.last_price;

    // Calculate the average range of the last 5 candles
    let sum = c.reduce((acc, value) => acc + value, 0);
    let average = sum / c.length;
    let isMoreThan10Percent = average > (0.05 * lp);

    if (isMoreThan10Percent) {
        let min = Math.min(...c);
        let max = Math.max(...c);

        /*  
        if (global.seconds % 5 === 0) {
            console.log('more than 10 pc average', 
                        `Min: ${min}, Max: ${max}, Average: ${average}`, 
                        cis.tradingsymbol);
        } */

        if (global.seconds % 30 === 0 && global.minutes % 10 == 0) {
            console.log('range IS greater than 5 pc average. So trading possible', cis.tradingsymbol, 'range=', average, 'last price=', cis.tick.last_price, { isMoreThan10Percent });
        }
        return true;
    } else {
        if (global.seconds % 30 === 0 && global.minutes % 10 == 0) {
            console.log('range not greater than 5 pc average. So no trading', cis.tradingsymbol, 'range=', average, 'last price=', cis.tick.last_price, { isMoreThan10Percent });
        }
        return false;
    }
}

async function getMargins(kite) {
    return await kite.getMargins();
}

export async function handleNoPosition(cis, kite) 

{
//console.log('global.instrumentName=',global.instrumentName)
    if(global.instrumentName=='STK' ){

      let m=await   kite.getMargins();

      console.log(m.equity.net,'m.equity.net');


        return;

        const pivotValues = Object.values(cis.pricePoints.pivotPointObject);
       

            if(cis.tick.last_price>cis.tick.ohlc.open){


               

    // Check if last_price matches any value


                //console.log(cis.tradingsymbol,'stk-buy')

                //console.log(cis);

                if(cis 

                  &&  !cis.ordered 
                    
                    // && cis.exchange=='BSE'

                    && cis.tick &&

                    cis.tick.volume_traded>10000


                    && cis.pricePoints 

                    && cis.pricePoints.d1 

                    &&cis.tick.last_price> cis.pricePoints.d1 .low

                    && cis.pricePoints.d1.range 
                    
                    && (cis.pricePoints.d1.range*100/cis.pricePoints.d1.open <4

                        
                    )


                    && cis.tradingsymbol!='SUZLON'


                    &&  pivotValues.includes(cis.tick.last_price)
                    // && cis.liveMinute.color=='bullish'

                ){

                //    console.log('range above 10',cis.pricePoints.d1.range*100/cis.pricePoints.d1.open)


                   // cis.ordered=true

                    cis.stockTrade=true;
        //executeBuy(cis, kite, cis.tick.last_price)
                  // process.exit();

                }
                }else if( cis 

                    &&  !cis.ordered 
                      
                      // && cis.exchange=='BSE'
  
                      && cis.tick &&
  
                      cis.tick.volume_traded>10000
  
  
                      && cis.pricePoints 
  
                      && cis.pricePoints.d1 
  
                      &&cis.tick.last_price> cis.pricePoints.d1 .low
  
                      && cis.pricePoints.d1.range 
                      
                      && (cis.pricePoints.d1.range*100/cis.pricePoints.d1.open <4
  
                          
                      )
  
  
             
  
  
                      &&  pivotValues.includes(cis.tick.last_price) ){

                        cis.shortTrading=true;
                        executeShorting(cis, kite,cis.tick.last_price) 

                      }
                     


                    return;




                //process.exit();
              
    

            }

           // return;
        


if(cis.tick.last_price>cis.tick.ohlc.open ){



    if(!cis.ordered && global.hours==9){


        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price -cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true
    
    
        cis.buyStrategy = 'aboobveopenat920';
        let p=Math.ceil(cis.tick.last_price)
    
        executeBuy(cis, kite, p);
    }
  




    if(!global.isAbove.includes(cis.tradingsymbol)){

        global.isAbove.push(cis.tradingsymbol);
    } 

}else{

    if(global.isAbove.includes(cis.tradingsymbol)){


        let index= global.isAbove.indexOf(cis.tradingsymbol);


        global.isAbove.splice(index,1)
    }

}




//if(global.seconds%20==0)console.log(global.isAbove,'global.isAbove')
//if(!cis.minuteData){

    if(false){

    if(
         cis.minuteData && 
        cis.tick.last_price>cis.tick.ohlc.open 
     
        && cis.minuteData.slice(-1)[0].low<cis.tick.ohlc.open
        
        ){




cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price -cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true


        cis.buyStrategy = 'aboobveopenat920';
        let p=Math.ceil(cis.tick.last_price)

        executeBuy(cis, kite, p);

    }

    //console.log('no min data',global.clock,cis.tradingsymbol);
   // return

}

//console.log(global.isAbove,'is above')

if(cis.tradingsymbol=='NIFTY24D1924400PE'){
    const resultx = analyzeOHLCWithSlopeAndDegree(cis.minuteData.slice(-15));

    console.log(resultx,cis.tradingsymbol);
    
    //return;

}


//colorPatternBuying();
    
 



    

    if(  !cis ||
        !cis.pricePoints || ! cis.pricePoints.d1  ){

            if(global.seconds%30==0)  console.log('no cis return');

            return;
        }


        if(
            
            checkLiveMinuteSmallBodyRedOrLongUpperShadow(cis) ||

            checkLowerLowsAndLowerHighs(cis)||
             checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis) ||
            
             checkLastPriceAgainstPreviousCandles(cis)
            ){



                //// if not returned here after buying stop loss will trigger immediateley .. s
                //so dont remove option buying is an exception
            return;
        }



        if (cis.pricePoints && cis.pricePoints.d1 && (cis.tick.last_price < cis.pricePoints.d1.low || 
            cis.tick.last_price < cis.tick.ohlc.open)) {
            global.addOrIncrementRejection('below yesterday low or below days open' + cis.tradingsymbol);
            if (global.minutes % 10 == 0 && global.seconds == 5) console.log(cis.tradingsymbol, 'd1low=', cis.pricePoints.d1.low, 'lp=', cis.tick.last_price);
            return;
        }



    if (

        global.hours<10 &&


        (
            (cis.tick.last_price < cis.pricePoints.d1.low || 
            cis.tick.last_price < cis.tick.ohlc.open)
        )
        
        ) {

        if(global.seconds%30==0)    console.log('bewlo open below y day low return'),cis.tradingsymbol;
        global.addOrIncrementRejection('below yesterday low or below days open' + cis.tradingsymbol);
        if (global.minutes % 10 == 0 && global.seconds == 5) console.log(cis.tradingsymbol, 'd1low=', cis.pricePoints.d1.low, 'lp=', cis.tick.last_price);
        return;
    }


    let proceedToTrade = false;
    if (cis.tick.last_price < 5) return;
    if (cis.noBuy) {
        global.addOrIncrementRejection('cis no buy');
        return;
    }

    if (!cis.minuteData || !cis.tick) {
        global.addOrIncrementRejection('cis no tick');
        return;
    }

    let noLots = 2;


    if (!cis.minuteData || cis.minuteData.length < 1) {
      
        global.addOrIncrementRejection('NO MINUTE DATA' + cis.tradingsymbol, cis.minuteData);
        return;
    }

    let told = false;


    if (global.seconds  == 0 && global.minutes % 5 == 0) {
        //if (told) return;
        console.log('BE PATIENT DONT TRADE MANUAL. NO OVERNIGHTS. IF I CANT U NEVER CANT. TRUST ME DONT SWITCH ME OFF time:', global.clock);
        told = true;
    }



    let specialTrade = false;

    //console.log('cis',cis.tradingsymbol,cis.tick);

  /*   let twoCross = analyzeTwoRedCandles(cis);

    if (twoCross) {
        cis.buyStrategy = 'twoRedCandleCross';
       specialTrade = true;
        console.log('EXECUTING SPECIAL TRADE TWO CANDLE CROSS', cis.tradingsymbol);
    }
 */
    const rversa = reversalCheck(cis.minuteData, cis);

    if (rversa ) {


        cis.buyStrategy = 'rversa30';

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
            cis.stopLossPrice = cis.tick.last_price -cis.liveMinute.range;
            cis.inbuiltTarget = true;
            cis.inbuiltStopLoss = true
        specialTrade = true;
        console.log('rversa30', cis.tradingsymbol);
    }


    if(
        
        cis.liveMinute.hasLongLowerShadow && global.seconds==59 && cis.tick.last_price>cis.tick.ohlc.open){
      /*   let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) { */

           
            cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
            cis.stopLossPrice = cis.tick.last_price -cis.liveMinute.range;
            cis.inbuiltTarget = true;
            cis.inbuiltStopLoss = true


            cis.buyStrategy = 'hasLongLowerShadowAboveOpenAt59';
            let p=Math.ceil(cis.tick.last_price)

            executeBuy(cis, kite, p);
       // }

        return;

    }

    if (specialTrade && cis.tick.last_price > 1) {
        let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) {


            let p=Math.ceil(cis.tick.last_price-cis.minuteCandleMeanRange/3)

            executeBuy(cis, kite, p);
        }

        return;
    }

    if (!canInitiateLongTrade(cis)) {
        // global.addOrIncrementRejection('can InitiateLongTrade is false')
        if (global.minutes % 15 == 0 && global.seconds == 0) console.log("Conditions are not favorable for a long trade.", cis.tradingsymbol);

        if (global.seconds == 59 && cis.liveMinute.color == 'bullish') {
            for (let i = 0; i < noLots; i++) {
                // executeBuy(cis, kite,cis.tick.last_price);
            }

          //  cis.buyStrategy = 'green candle and high at 59 sec';

            // return;
        }


    } else {
        if (global.minutes % 15 == 0 && global.seconds == 0) console.log("Not bearish", cis.tradingsymbol);
    }


   

    
    const result = findSupportPoints(cis.minuteData);

    // Output the results

    let lp1 = cis.tick.last_price;
    // let m=await kite.getMargins()
    // console.log(m.equity.available.live_balance,',m.equity.available.live_balance'); */

   // let sup = checkLastCandleOverSupportPoint(cis.minuteData.slice(-1)[0], result, lp1);
    // console.log("Support Points:", result,cis.tradingsymbol,sup);

    // disabled temp

/*     if (sup && cis.tick.last_price > cis.minuteData.slice(-1)[0].high) {
        console.log('SUPPORT BUYING OF,', sup, cis.tradingsymbol, lp1);

        let p=Math.ceil(cis.tick.last_price-cis.minuteCandleMeanRange/3)
        let noLots = 2; // Adjust as needed
        for (let i = 0; i < noLots; i++) {
            executeBuy(cis, kite, p);
        }

        return;
    } */

    // if(global.seconds%15==0 && global.minutes%5==0)console.log('cis.highBeforeThreeMinutes',"last high :",cis.highBeforeThreeMinutes,"LTP:",cis.tick.last_price,cis.tradingsymbol);




    if(
        cis.tick.last_price>cis.tick.open

        && cis.minuteData(-2).low<cis.tick.open

        && cis.minuteData(-1).close>cis.tick.open

        && !cis.ordered

    ){
        console.log('open cross from below',cis.tradingsymbol);
        
        cis.buyStrategy = 'openCrossFromBelow';
        cis.targetPrice = cis.tick.last_price * global.targetPc;
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        proceedToTrade = true;

        executeBuy(cis, kite, cis.last_price);


        return;
    }


  
    if (
        
       ( global.hours<14 || (global.hours==14 && global.minutes<=30)) && typeof cis.highBeforeThreeMinutes!='undefined' &&
        
        cis && cis.tick.last_price > cis.highBeforeThreeMinutes && !cis.ordered && global.seconds==59) {
        // Capture the entire cis object to preserve its state at this moment
        const capturedCis = JSON.parse(JSON.stringify(cis));

        // Log the intention to execute the trade after 2 minutes
       // console.log('Trade condition met, will execute trade after 1 minutes:', capturedCis.tradingsymbol, capturedCis.tick.last_price);

        // Set a timeout to delay the trade execution by 2 minutes (120,000 milliseconds)

        console.log('cis.highBeforeThreeMinutes',cis.highBeforeThreeMinutes,
            cis.tick.last_price > cis.highBeforeThreeMinutes,cis.tradingsymbol);
        
        cis.buyStrategy = 'DayHighBreakOut';
        cis.targetPrice = cis.tick.last_price * global.targetPc;
        cis.stopLossPrice = cis.tick.last_price * global.stoplossPc;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        proceedToTrade = true;
        for (let i = 0; i < noLots; i++) {

            let p=Math.ceil(cis.tick.last_price)
            executeBuy(cis, kite, p);//
        }

        return;
    }

    /* if(!isRangeGreaterThanFive(cis)) {
        // return;
    } */

    // added positive close ranges only

   

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


//return ; /// only two strategies today
handleTrades(cis, kite);

return;

  /*   if (global.hours >= 9 && global.hours < 10) {
        handle9to10AM(cis, kite);
    } else if (global.hours >= 10 && global.hours < 12) {
        handle10to12PM(cis, kite);
    } else if (global.hours >= 12 && global.hours < 16) {
        handle12to4PM(cis, kite);
    } */


}