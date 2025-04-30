import updateOpenOrderPrice from "./updateOrder.js";
import {checkLowerLowsAndLowerHighs} from './checkLowerLowsAndLowerHighs.js';
import {checkLastPriceAgainstPreviousCandles} from './checkLastPriceAgainstPreviousCandles.js'; // Adjust the path based on file location
import checkColorWithFlags from './checkColorWithFlags.js'; // Adjust the path based on file location
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows, hasLargeUpperWick, isBearishAt50Sec, isOpenHighAtSpecificSeconds } from './criteriaFunctions.js';  // Import your criteria functions
import {redCandleStartAfterGreenCandles} from './redCandleStartAfterGreenCandles.js'

import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
//import { colorPatternSquareOff} from './colorPatternSquareOff.js';

export default async function executeSquareOff(squareOff, cis, kite) {

   
    if (squareOff && !cis.updated) {
        let order = global.orders.find(o => o.tradingsymbol === cis.tradingsymbol && o.status === 'OPEN');
        if (order) {
            updateOpenOrderPrice(kite, order.order_id, cis.instrument_token, cis.tick.last_price);
            cis.updated = true;

            cis.sellType='stopLoss';
            cis.sellStrategy='stoploss'
            cis.sellPrice=cis.tick.last_price;

            let conditionsMet = [];

            if (checkLowerLowsAndLowerHighs(cis)) {
                conditionsMet.push("lowerLowsAndLowerHighs");
            }
            if (checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis)) {
                conditionsMet.push("penultimateGreenLastSmallBodyOrLowerHigh");
            }
            if (isMakingLowerLows(cis)) {
                conditionsMet.push("makingLowerLows");
            }
            if (checkLastPriceAgainstPreviousCandles(cis)) {
                conditionsMet.push("lastPriceAgainstPreviousCandles");
            }
            if (checkColorWithFlags(cis)) {
                conditionsMet.push("colorWithFlags");
            }
            if (redCandleStartAfterGreenCandles(cis)) {
                conditionsMet.push("redCandleAfterGreenCandles");
            }
        
            // Set stopLossStrategy with the stringified conditionsMet
            cis.stopLossStrategy = JSON.stringify({ conditionsMet: conditionsMet });

            const sellOrder = await handleStopLossOrTarget(
                cis.tradingsymbol,
                cis.sellPrice , // Example sell price, fallback if not set in cis
                cis.sellType ,
                cis.sellStrategy ,
                cis.stopLossStrategy 
            );  /// this is db writing   carefull
         //   console.log('Sell Order after Stop Loss:', sellOrder);

            // Reset `cis.updated` after 1 minute
            setTimeout(() => {
                if (cis) {

                    //console.log('CIS UPdated Lock REleased for',cis.tradingsymbol);
                    
                    cis.updated = false;   /// retrying of squareoff if order is still not [resend]
                }
            }, 3 * 1000);
        }
    }
}