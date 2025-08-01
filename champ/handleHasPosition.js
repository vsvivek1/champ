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


async function shortCoverOrder(kite, cis) {
  try {
    const quantity = cis.position?.quantity;
    if (!quantity || quantity <= 0) {
      console.log("No short position to cover.");
      return null;
    }

    const orderParams = {
      exchange: cis.exchange,               // "NFO"
      tradingsymbol: cis.tradingsymbol,     // e.g., "NIFTY24JUL20000PE"
      transaction_type: kite.TRANSACTION_TYPE_BUY,
      quantity: quantity,
      order_type: cis.order_type || kite.ORDER_TYPE_MARKET,
      product: cis.product || kite.PRODUCT_MIS,
      variety: kite.VARIETY_REGULAR,
      validity: kite.VALIDITY_DAY,
    };

    if (orderParams.order_type == kite.ORDER_TYPE_LIMIT && cis.price) {
      orderParams.price = cis.price;
    }

    const orderId = await kite.placeOrder(orderParams.variety, orderParams);
    console.log("Short position covered. Order ID:", orderId);
    return orderId;
  } catch (error) {
    console.error("Failed to cover short position:", error);
  }
}


async function shortCoveringStoploss(kite, cis) {
  try {
    const matchingOrder = global.orders.find(order =>
      order.status == "OPEN" &&
      order.transaction_type == kite.TRANSACTION_TYPE_BUY &&
      order.tradingsymbol == cis.tradingsymbol &&
      order.exchange == cis.exchange
    );

    if (!matchingOrder) {
      console.log("No open BUY order found for short covering.");
      return;
    }

    const updatedParams = {
      order_id: matchingOrder.order_id,
      quantity: matchingOrder.quantity,
      price: parseFloat(cis.tick.last_price.toFixed(1)),
      order_type: kite.ORDER_TYPE_LIMIT,
      product: matchingOrder.product,
      validity: kite.VALIDITY_DAY,
    };

    const modifiedOrderId = await kite.modifyOrder(kite.VARIETY_REGULAR, matchingOrder.order_id, updatedParams);
    console.log(`Short covering SL updated to ₹${updatedParams.price}. Order ID: ${modifiedOrderId}`);
    return modifiedOrderId;
  } catch (error) {
    console.error("Error updating short covering SL:", error);
  }
}


export async function handlePositionPresent(cis, kite) {


  if(!cis.position) return


  if(cis.position.quantity<0){

  if( global.seconds==30)  console.log('stop loss of',cis.tradingsymbol ,'@',cis.ma20);
  }

  if(cis.position.quantity<0 && cis.ma20 && cis.position.quantity<0 && !cis.shortCoverd && 
    (
      //cis.tick.last_price>cis.tick.ohlc.open ||
      
      cis.tick.last_price>cis.ma20) ){


///// short covering stop loss function

    cis.shortCoverd=true;
    console.log('have a short position for short covering',cis.tradingsymbol);
    console.log('short covering stop loss for',cis.tradingsymbol,'@',cis.ma20);
    //console.table(cis);
    shortCoveringStoploss(kite, cis);

    setTimeout(()=>{


      /// in case its not executed for trying it again
 cis.shortCoverd=false

    },5*1000)


   
    

    return;
  }

  
//if(global.seconds==30)console.log('long postion present for',cis.tradingsymbol);

  if (true) {
    // console.log('Position status for', 
      
    //   cis.tradingsymbol, 'SL:', cis.stopLossPrice, 'Last:', cis.tick.last_price, 'Target:', cis.targetPrice,
    
    //   `hasLivePosition is  ${cis.hasLivePosition}`
    // );
    cis.saidThat = true;
  }

   //setBuyPriceAndTargetPriceFromCompletedBuyOrder
  
       if(global.seconds%30==0){
    setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis,kite);

    //console.log(`position present ${cis.tradingsymbol} sl ${cis.stopLossPrice} ma20 ${cis.ma20} `);

       }


 
if(cis.expiryDay && global.hours>13 &&  cis.tick.last_price>cis.ma20){

  // If it's after 1 PM on the expiry day and the last price is above the 20-period moving average,
  // we don't do stop loss for below open, so we return early.
  return;

}
       


    if(cis.tick.last_price<cis.ma20
      
      // || (cis.tick.last_price<cis.tick.ohlc.open 


        
      // )
    
    
    )
    
    
    {

      const openOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');
  if (!openOrder) {

  cis.signals?  cis.signals.NoReverseOrderFoundForPosition=true : cis.signals={NoReverseOrderFoundForPosition:true};
    //console.warn(`xNo open order found to update for ${cis.tradingsymbol}. Cannot proceed with stop-loss update.`);


   if(!cis.hasReverseOrder){
    console.log('has reverse order',cis.tradingsymbol);

     placeTargetIfNotTargetSet(cis, kite);
   cis.hasReverseOrder=true
    return;
   }
  
  }



  if(openOrder && openOrder.status == 'OPEN' && openOrder.order_id &&cis.position.quantity>0) {


    console.log('executting stop loss below ma20 or below open price',cis.tradingsymbol,
   'last price',cis.tick.last_price,'ma20',cis.ma20,'open',cis.tick.ohlc.open);

        await updateOpenOrderPrice(kite, openOrder.order_id, cis.instrument_token, cis.tick.last_price, cis);

        return;

  }



    }
     

return;




  cis.entryHealth = 'Inside Has Position';
  if (global.seconds % 19 == 0) cis.saidThat = false;

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

  var tgtOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN' && o.transaction_type == transactiontype);

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
       setBuyPriceAndTargetPriceFromCompletedBuyOrder(cis,kite);


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

  // if (!cis.inbuiltStopLoss && cis.tick.last_price < cis.stopLossPrice) {
  //   executeSquareOff(true, cis, kite);
  //   return;
  // }

  // if (global.instrumentName == 'STK') {
  //   if (cis.position.quantity < 0) {
  //     handleShortCoveringOfStocks(cis, kite);
  //   } else if (cis.position.quantity > 0) {
  //     handleLongCoveringOfStocks(cis, kite);
  //   }
  //   return;
  // }

  // const squareOff = shouldSquareOff(cis);
  // if (squareOff && global.hours<10) {
  //   executeSquareOff(true, cis, kite);
  //   return;
  // }

  // cis.entryHealth = 'Stop-loss health check: ' + cis.buy_price;

  // return;
}
