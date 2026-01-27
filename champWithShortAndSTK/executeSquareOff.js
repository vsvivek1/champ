// executeSquareOff.js (Updated to update open order instead of placing a new one)

import updateOpenOrderPrice from "./updateOrder.js";
import { checkLowerLowsAndLowerHighs } from './checkLowerLowsAndLowerHighs.js';
import { checkLastPriceAgainstPreviousCandles } from './checkLastPriceAgainstPreviousCandles.js';
import checkColorWithFlags from './checkColorWithFlags.js';
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows } from './criteriaFunctions.js';
import { redCandleStartAfterGreenCandles } from './redCandleStartAfterGreenCandles.js';

import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';

export default async function executeSquareOff(squareOff, cis, kite) {
  if (!squareOff) return;

  if (!cis.position || cis.position.quantity == 0) {
    console.warn(`No active position for ${cis.tradingsymbol}, skipping square-off.`);
    return;
  }

  // Prevent repeated execution within 30 seconds
  const now = Date.now();
  if (cis.lastSquareOffTime && now - cis.lastSquareOffTime < 30000) {
    //console.log(`Skipping repeat square-off for ${cis.tradingsymbol} (last was ${Math.round((now - cis.lastSquareOffTime)/1000)}s ago)`);
    return;
  }
  cis.lastSquareOffTime = now;

  const openOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');
  if (!openOrder) {
    console.warn(`yNo open order found to update for ${cis.tradingsymbol}. Cannot proceed with stop-loss update.`);
    return;
  }



  // const conditionsMet = [];
  // if (checkLowerLowsAndLowerHighs(cis)) conditionsMet.push("lowerLowsAndLowerHighs");
  // if (checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis)) conditionsMet.push("penultimateGreenLastSmallBodyOrLowerHigh");
  // if (isMakingLowerLows(cis)) conditionsMet.push("makingLowerLows");
  // if (checkLastPriceAgainstPreviousCandles(cis)) conditionsMet.push("lastPriceAgainstPreviousCandles");
  // if (checkColorWithFlags(cis)) conditionsMet.push("colorWithFlags");
  // if (redCandleStartAfterGreenCandles(cis)) conditionsMet.push("redCandleAfterGreenCandles");

  //cis.stopLossStrategy = JSON.stringify({ conditionsMet });

  try {

    console.log('executting stop loss',conditionsMet)
    await updateOpenOrderPrice(kite, openOrder.order_id, cis.instrument_token, cis.tick.last_price, cis);

      // Mark position as closed for tracking
  cis.hasLivePosition = false;
  cis.sellType = 'stopLoss';
  cis.sellStrategy = 'stoploss';
  cis.sellPrice = cis.tick.last_price;
    console.log(`Updated open order for ${cis.tradingsymbol} to reflect stop-loss.`);

    // Optional DB logging
    handleStopLossOrTarget?.(
      cis.tradingsymbol,
      cis.sellPrice,
      cis.sellType,
      cis.sellStrategy,
      cis.stopLossStrategy
    );

  } catch (err) {
    console.error(`Failed to update open order for ${cis.tradingsymbol}`, err);
  }

  setTimeout(() => {
    if (cis) cis.updated = false;
  }, 3000);
} 
