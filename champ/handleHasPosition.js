// handleHasPosition.js

import { squareOffBefore9Hrs, squareOffBetween9And12Hrs, squareOffAfter12Hrs } from './stopLossCriterias.js';
import updateOpenOrderPrice from "./updateOrder.js";
import {checkLowerLowsAndLowerHighs} from './checkLowerLowsAndLowerHighs.js';
import {checkLastPriceAgainstPreviousCandles} from './checkLastPriceAgainstPreviousCandles.js'; // Adjust the path based on file location
import checkColorWithFlags from './checkColorWithFlags.js'; // Adjust the path based on file location
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';

export function handlePositionPresent(cis, kite) {
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
        return;
    }

    // Determine whether to square off the position based on the time of day
    let squareOff = false;

    switch (true) {
        case (global.hours < 10):
            squareOff = squareOffBefore9Hrs(cis, global.orders, global.date);
            break;
        case (global.hours >= 10 && global.hours <= 12):
            squareOff = squareOffBetween9And12Hrs(cis, global.orders, global.date);
            break;
        case (global.hours > 12):
            squareOff = squareOffAfter12Hrs(cis, global.orders, global.date);
            break;
        default:
            // Optional: handle any unexpected cases
            break;
    }

    // Execute square off if needed


    squareOff = (checkLowerLowsAndLowerHighs(cis.minuteData)
    || 

    checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis.minuteData) /// lst cndle green with (lower highs or very small body)

||checkLastPriceAgainstPreviousCandles(cis)||

checkColorWithFlags(cis)

); /// no matter what squarewoff on lower lows

    if(squareOff  && cis.minuteData && cis.tick && cis.tick.last_price>cis.minuteData.slice(-1).low){
console.log('No sq off since signs of recovery',cis.tradingsymbol);

return;
    }
    executeSquareOff(squareOff, cis, kite);
}

function executeSquareOff(squareOff, cis, kite) {
    if (squareOff && !cis.updated) {
        let order = global.orders.find(o => o.tradingsymbol === cis.tradingsymbol && o.status === 'OPEN');
        if (order) {
            updateOpenOrderPrice(kite, order.order_id, cis.instrument_token, cis.tick.last_price);
            cis.updated = true;

            // Reset `cis.updated` after 1 minute
            setTimeout(() => {
                if (cis) {
                    cis.updated = false;
                }
            }, 1 * 60 * 1000);
        }
    }
}
