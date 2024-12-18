// handleHasPosition.js

import { squareOffBefore9Hrs, squareOffBetween9And12Hrs, squareOffAfter12Hrs } from './stopLossCriterias.js';
import updateOpenOrderPrice from "./updateOrder.js";
import {checkLowerLowsAndLowerHighs} from './checkLowerLowsAndLowerHighs.js';
import {checkLastPriceAgainstPreviousCandles} from './checkLastPriceAgainstPreviousCandles.js'; // Adjust the path based on file location
import checkColorWithFlags from './checkColorWithFlags.js'; // Adjust the path based on file location
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows, hasLargeUpperWick, isBearishAt50Sec, isOpenHighAtSpecificSeconds } from './criteriaFunctions.js';  // Import your criteria functions
import {redCandleStartAfterGreenCandles} from './redCandleStartAfterGreenCandles.js'

import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
import handleShortCoveringOfStocks from './handleShortCoveringOfStocks.js';
import handleLongCoveringOfStocks from './handleLongCoveringOfStocks.js';
import executeSquareOff from './executeSquareOff.js';
//import { colorPatternSquareOff} from './colorPatternSquareOff.js';


export function handlePositionPresent(cis, kite) {

    //return;
    let squareOff = false;

   // colorPatternSquareOff()


    // Update the highest seen prices

 
    cis.lastSeenHighForPosition = Math.max(cis.tick.last_price, cis.lastSeenHighForPosition);
    cis.lastSeenHigh = Math.max(cis.tick.last_price, cis.lastSeenHigh);

    // Calculate current profit
    let prof = cis.lot_size * cis.tick.last_price;
    cis.highestProfit = Math.max(prof, cis.highestProfit);




    // Check for existing target order
    let target_order = global.orders.find(i => i.tradingsymbol === cis.tradingsymbol && i.status === 'OPEN' && i.transaction_type === 'SELL');
    if (!target_order) {


        cis.returns.push('NO target order');

        process.exit();  /// stop must have a target for all entries and so should have a stop loss
        return;
    }



    // Determine whether to square off the position based on the time of day
    


 
    
    //return; 





    squareOff =   global.hours<13 &&
 (
   
checkLowerLowsAndLowerHighs(cis)
|| 

checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis) /// lst cndle green with (lower highs or very small body)
||
isMakingLowerLows(cis) /// is making lower lows
||
checkLastPriceAgainstPreviousCandles(cis) //last price bewlow low of last three candles
||
checkColorWithFlags(cis) /// if current candle is red after 30 seconds
||redCandleStartAfterGreenCandles(cis) /// red candle start after atleawt 2 grenn candles after 5 sec
); /// no matter what squarewoff on lower lows

 /*    if(squareOff  && cis.minuteData && cis.tick &&
         cis.tick.last_price>cis.minuteData.slice(-1)[0].low
        
        
        ){
////  check later and re write for huge gap downs check later

if(global.seconds%30==0)            console.log('No sq off since signs of recovery',cis.tradingsymbol);

return;
    } */

///temp on oct 30

/* squareOff=false;

if(cis.tick.last_price<cis.tick.open 
    ||redCandleStartAfterGreenCandles(cis)

    || checkLowerLowsAndLowerHighs(cis.minuteData)

    || isMakingLowerLows(cis) 

){

    squareOff=true;
} */
///temp on oct 30]


if(global.instrumentName=='STK'){



    if(cis.position.quantity<0){


  handleShortCoveringOfStocks(cis)  //empty

    }else if(cis.position.quantity>0){


 handleLongCoveringOfStocks(cis) //empty

    }

    //console.log()



    //return;
}

if(global.hours==9){


   if(cis.tick.last_price<cis.tick.ohlc.open) {

    console.log('executing squareoff below open in the morning',cis.inbuiltStopLoss,'9 hrs less than open sq off');
   

    executeSquareOff(squareOff, cis, kite);

   }

    return;
}




if(global.seconds%20==0 && global.minutes%5==0)console.log('stop loss health cehck',cis.buyPrice);



if(cis.inbuiltStopLoss && cis.tick.last_price<=cis.stopLossPrice){


    ///squareoff inbuilty


    console.log('executing inbuild stop loss',cis.inbuiltStopLoss,'cis.inbuiltStopLoss');
    executeSquareOff(squareOff, cis, kite);

}
  
if(cis.tick.last_price<cis.tick.ohlc.open){

    console.log('squareoff below open for ',cis.tradingsymbol);
    

    squareOff=true;


}


if(squareOff /* && !cis.inbuiltStopLoss */    ){



    /// squareofffgeneral
    console.log(cis.inbuiltStopLoss,'cis.inbuiltStopLoss', 'executing normal stop loss');
    
    executeSquareOff(squareOff, cis, kite);
}



}





