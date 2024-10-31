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


export function handlePositionPresent(cis, kite) {
    // Update the highest seen prices

    if(cis.tradingsymbol.includes('NXT')){

        return;
    }
    cis.lastSeenHighForPosition = Math.max(cis.tick.last_price, cis.lastSeenHighForPosition);
    cis.lastSeenHigh = Math.max(cis.tick.last_price, cis.lastSeenHigh);

    // Calculate current profit
    let prof = cis.lot_size * cis.tick.last_price;
    cis.highestProfit = Math.max(prof, cis.highestProfit);

    // Check for existing target order
    let target_order = global.orders.find(i => i.tradingsymbol === cis.tradingsymbol && i.status === 'OPEN' && i.transaction_type === 'SELL');
    if (!target_order) {
        cis.returns.push('NO target order');
        return;
    }

    // Determine whether to square off the position based on the time of day
    let squareOff = false;

  


    squareOff = 
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
///temp on oct 30

  
if(squareOff ){

    executeSquareOff(squareOff, cis, kite);
}

}

async function executeSquareOff(squareOff, cis, kite) {

   
    if (squareOff && !cis.updated) {
        let order = global.orders.find(o => o.tradingsymbol === cis.tradingsymbol && o.status === 'OPEN');
        if (order) {
            updateOpenOrderPrice(kite, order.order_id, cis.instrument_token, cis.tick.last_price);
            cis.updated = true;

            cis.sellType='stopLoss';
            cis.sellStrategy='stoploss'
            cis.sellPrice=cis.tick.last_price;

            const sellOrder = await handleStopLossOrTarget(
                cis.tradingsymbol,
                cis.sellPrice || -140, // Example sell price, fallback if not set in cis
                cis.sellType || 'stopLoss',
                cis.sellStrategy || 'fixed stop loss',
                cis.stopLossStrategy || 'trailing stop loss'
            );
            console.log('Sell Order after Stop Loss:', sellOrder);

            // Reset `cis.updated` after 1 minute
            setTimeout(() => {
                if (cis) {

                    console.log('CIS UPdated Lock REleased for',cis.tradingsymbol);
                    
                    cis.updated = false;   /// retrying of squareoff if order is still not [resend]
                }
            }, 10 * 1000);
        }
    }
}
