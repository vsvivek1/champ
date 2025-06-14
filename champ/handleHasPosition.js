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

export async function handlePositionPresent(cis, kite) {


  if (true) {
    // console.log('Position status for', 
      
    //   cis.tradingsymbol, 'SL:', cis.stopLossPrice, 'Last:', cis.tick.last_price, 'Target:', cis.targetPrice,
    
    //   `hasLivePosition is  ${cis.hasLivePosition}`
    // );
    cis.saidThat = true;
  }

   //setBuyPriceAndTargetPriceFromCompletedBuyOrder
  
    setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis);


  cis.entryHealth = 'Inside Has Position';
  if (global.seconds % 19 === 0) cis.saidThat = false;

  if (!cis.stopLossPrice || isNaN(cis.stopLossPrice)) {
    cis.stopLossPrice = cis.tick.ohlc.open;
  }

  if (!cis.updated && cis.tick.last_price <= cis.stopLossPrice) {
    cis.updated = true;
    console.log('Executing inbuilt stop-loss for ie',`ie ${cis.tick.last_price} less than  open price ${cis.stopLossPrice} for`, cis.tradingsymbol);
    executeSquareOff(true, cis, kite);
    return;
  }


  let transactiontype = cis.position.quantity > 0 ? 'SELL' : 'BUY';

  var tgtOrder = global.orders.find(o => o.tradingsymbol === cis.tradingsymbol && o.status === 'OPEN' && o.transaction_type === transactiontype);

if(!tgtOrder){

    global.orders = await kite.getOrders(); //trying once agin 
}

  if (!tgtOrder && !cis.hasTargetOrder) {
    if (!cis.targetOrderCheckStartTime) {
      cis.targetOrderCheckStartTime = Date.now();
    } else {
      const now = Date.now();
      const elapsed = now - cis.targetOrderCheckStartTime;
      global.orders = await kite.getOrders(); 

      if (elapsed >= 3000) {

        //setBuyPriceAndTargetPriceFromCompletedBuyOrder

       // console.log('settint target from setBuyPriceAndTargetPriceFromCompletedBuyOrder ')
       setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis);


        cis.hasTargetOrder = true;
      //  await placeTargetOrder(cis, tgtOrder, kite); no raksha
       // console.log(`Target order placed for ${cis.tradingsymbol} after 30 seconds of confirmation.`);
      }
    }
  }

  if (cis.inbuiltStopLoss) {
    cis.entryHealth = 'has inbuiltStopLoss:' + cis.inbuiltStopLoss + ' @ ' + cis.stopLossPrice + ' Now @' + cis.price;
    return;
  }



  if(cis.tick.last_price<cis.tick.ohlc.open  || (  cis.ma20 && cis.ma20!=-1 && cis.tick.last_price<cis.ma20 )){


    /////very important . give up those . give up those . give up those

    executeSquareOff(true, cis, kite);

    return;

  }


  return;

  if (!cis.inbuiltStopLoss && cis.tick.last_price < cis.stopLossPrice) {
    executeSquareOff(true, cis, kite);
    return;
  }

  if (global.instrumentName === 'STK') {
    if (cis.position.quantity < 0) {
      handleShortCoveringOfStocks(cis, kite);
    } else if (cis.position.quantity > 0) {
      handleLongCoveringOfStocks(cis, kite);
    }
    return;
  }

  const squareOff = shouldSquareOff(cis);
  if (squareOff && global.hours<10) {
    executeSquareOff(true, cis, kite);
    return;
  }

  cis.entryHealth = 'Stop-loss health check: ' + cis.buy_price;

  return;
}
