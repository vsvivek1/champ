// handleHasPosition.js (Cleaned with modular square-off conditions)

import { squareOffBefore9Hrs, squareOffBetween9And12Hrs, squareOffAfter12Hrs } from './stopLossCriterias.js';
import updateOpenOrderPrice from "./updateOrder.js";
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
import handleShortCoveringOfStocks from './handleShortCoveringOfStocks.js';
import handleLongCoveringOfStocks from './handleLongCoveringOfStocks.js';
import executeSquareOff from './executeSquareOff.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './fetchData.js';
import { shouldSquareOff } from './squareOffLogic.js';
import { placeTargetOrder } from './orderUtils.js';

import { setBuyPriceAndTargetPriceFromCompletedBuyOrder } from './setBuPriceAndTargetFromCompletedBuyOrder.js';
import { placeTargetIfNotTargetSet } from './placeTargetIfNotTargetSet.js';
import { consoleOrigin } from 'firebase-tools/lib/api.js';




// handleHasPosition.js (Freeze-quantity aware repair)



import {
  shouldTriggerStopLoss,

} from './stopLossEngine.js';

import { checkReversalExit } from './checkReversalExit.js';
import { placeOrderInFreezeChunks } from './orderUtils/placeOrderInFreezeChunks.js';

export async function handlePositionPresent(cis, kite) {


  //return;  //tempory
  cis.returnPoints="handlePositionPresent start health check"
  /* --------------------------------------------------
   * 1. PREPARE DATA
   * -------------------------------------------------- */

  const lastPrice = cis.tick.last_price;

  const openOrders = global.orders.filter(
    o => o.tradingsymbol === cis.tradingsymbol && o.status === 'OPEN'
  );

  const openOrderQty = openOrders.reduce((s, o) => s + o.quantity, 0);
  const positionQty = Math.abs(cis.position?.quantity ?? 0);

  console.log('openOrderQty:', openOrderQty, 'positionQty:', positionQty);

  // Nothing to repair or trail on a flat position. Also covers the case
  // where the position closed through some path other than our own SELL
  // order flow (e.g. expiry, manual square-off) and hasLivePosition was
  // never reset.
  if (positionQty <= 0) {
    cis.hasLivePosition = false;
    cis.returnPoints = 'handlePositionPresent: flat position, nothing to do';
    return;
  }

  //return;

  /* --------------------------------------------------
   * 2. DELTA CHECK
   * -------------------------------------------------- */

  const missingQty = positionQty - openOrderQty;

  cis.returnPoints="handlePositionPresent Missing qty check "+missingQty
  if (missingQty > 0) {
    // Stop-loss / exit order repair is now handled by the separate
    // stopLossGuard.js pm2 process; disabled here to avoid duplicate orders.
    return;

    console.log(
      'Repairing reverse orders for',
      cis.tradingsymbol,
      'missingQty:',
      missingQty
    );

    // Refresh position (safety)
    const positions = await kite.getPositions();
    const refreshedPosition = positions.net.find(
      p => p.tradingsymbol === cis.tradingsymbol
    );

    if (!refreshedPosition) return;
    cis.position = refreshedPosition;

    /* --------------------------------------------------
     * 3. FREEZE-QTY AWARE SPLITTING
     * -------------------------------------------------- */

    await placeOrderInFreezeChunks(kite, {
      exchange: refreshedPosition.exchange,
      tradingsymbol: refreshedPosition.tradingsymbol,
      transaction_type: refreshedPosition.quantity > 0 ? "SELL" : "BUY",
      quantity: missingQty,
      order_type: "LIMIT",
      price: Math.ceil(cis.minuteData.at(-1).close * 1.1),
      product: "NRML",
      validity: "DAY"
    }, cis.lot_size);

    global.orders = await kite.getOrders();
    return;
  }

  /* --------------------------------------------------
   * 4. STOP-LOSS TRAILING
   * -------------------------------------------------- */


 cis.returnPoints="Near should trigger stop loss "

  await checkReversalExit(cis, kite);




if (
  
  shouldTriggerStopLoss(cis, global)
|| cis.last3CandleLow<=cis.tick.last_price

|| cis.ma20>cis.tick.last_price

|| cis.tick.last_price<=cis.tick.ohlc.low


) {



  console.log(
    'STOP LOSS TRIGGERED',
    cis.tradingsymbol,
    cis.slReason,
    cis.tick.last_price
  );
  for (const order of openOrders) {
      await updateOpenOrderPrice(
        kite,
        order.order_id,
        cis.instrument_token,
        lastPrice,
        cis
      );
    }
}


 cis.returnPoints="After should trigger stop loss checks"

  // if (!cis.stopLossUpdating) {

  //   cis.stopLossUpdating = true;

  //   for (const order of openOrders) {
  //     await updateOpenOrderPrice(
  //       kite,
  //       order.order_id,
  //       cis.instrument_token,
  //       lastPrice,
  //       cis
  //     );
  //   }
  // }

  return;
}
