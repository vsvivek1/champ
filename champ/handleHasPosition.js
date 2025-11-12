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




export async function handlePositionPresent(cis, kite) {





let ml3=Math.min(...cis.minuteData.slice(-3).map(m=>m.low))
const openOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');


//console.log(cis.buyPrice,'buy price in has position for',cis.tradingsymbol,ml3,'3 min low' );
if(cis.tick.last_price<ml3) {
  console.log('stop loss ml3 min last price below last 3 min low for',cis.tradingsymbol,'last price',cis.tick.last_price,'3min low',ml3);


        await updateOpenOrderPrice(kite, openOrder.order_id, cis.instrument_token, cis.tick.last_price, cis);
}

  if(cis.stopLossExecuted){

    cis.returnPoints = `❌ [handlePositionPresent] Stop-loss already executed for ${cis.tradingsymbol}.`;

    return false;
  }

  if(!cis.position) return





  
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


    console.log('executting stop loss below ma20 ',cis.tradingsymbol,
   'last price',cis.tick.last_price,'ma20',cis.ma20,'open',cis.tick.ohlc.open, global.clock);

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
