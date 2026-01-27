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

const FREEZE_QTY = {
  NIFTY: 1800,
  SENSEX: 900
};

function getFreezeQty(tradingsymbol) {
  if (tradingsymbol.includes('NIFTY')) return FREEZE_QTY.NIFTY;
  if (tradingsymbol.includes('SENSEX')) return FREEZE_QTY.SENSEX;
  return Infinity; // stocks / others
}

export async function handlePositionPresent(cis, kite) {


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

  /* --------------------------------------------------
   * 2. DELTA CHECK
   * -------------------------------------------------- */

  const missingQty = positionQty - openOrderQty;

  cis.returnPoints="handlePositionPresent Missing qty check "+missingQty
  if (missingQty > 0) {

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

    const freezeQty = getFreezeQty(cis.tradingsymbol);
    let qtyRemaining = missingQty;

    while (qtyRemaining > 0) {

      let orderQty = Math.min(qtyRemaining, freezeQty);

      // Lot-size alignment (important for options)
      if (cis.lot_size && orderQty % cis.lot_size !== 0) {
        orderQty = Math.floor(orderQty / cis.lot_size) * cis.lot_size;
      }

      if (orderQty <= 0) break;

      await kite.placeOrder("regular", {
        exchange: refreshedPosition.exchange,
        tradingsymbol: refreshedPosition.tradingsymbol,
        transaction_type: refreshedPosition.quantity > 0 ? "SELL" : "BUY",
        quantity: orderQty,
        order_type: "LIMIT",
        price: Math.ceil(cis.minuteData.at(-1).close * 1.1),
        product: "NRML",
        validity: "DAY"
      });

      qtyRemaining -= orderQty;
    }

    global.orders = await kite.getOrders();
    return;
  }

  /* --------------------------------------------------
   * 4. STOP-LOSS TRAILING
   * -------------------------------------------------- */


 cis.returnPoints="Near should trigger stop loss "




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
