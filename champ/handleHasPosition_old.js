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

import {
  shouldTriggerStopLoss,
  updateLiveCandleColorStats
} from './stopLossEngine.js';


export async function handlePositionPresent(cis, kite) {




let daylow=Math.min(...cis.minuteData.map(m=>m.low))
var openOrders = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');

let openOrderQuantity=openOrders.reduce((a,b)=>a+b.quantity,0);
let positionQuantity=cis.position.quantity;

let openOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN' 
// && o.quantity==Math.abs(cis.position.quantity)
);


if(openOrderQuantity!=Math.abs(positionQuantity)
  // || openOrder.quantity!=cis.position.quantity 


)
{

  console.log('no open orders insufficient or not  found for',cis.tradingsymbol, 'open order qty',openOrderQuantity,'position qty',positionQuantity );

  //get possition again
  let positions1= await kite.getPositions();

 let position=positions1.net.find(p=>p.tradingsymbol==cis.tradingsymbol);

 //console.log('fetched positions again for',cis.tradingsymbol,position);
cis.position=position;


  //place reverse order

  let multiplier=position.quantity/cis.lot_size;


  for(let i=0;i<multiplier;i++){

  const orderId = await kite.placeOrder("regular", {
      exchange: position.exchange,                 // NSE | NFO | BSE
      tradingsymbol: position.tradingsymbol,
      transaction_type: position.quantity > 0 ? "SELL" : "BUY",         // BUY | SELL
      quantity: cis.lot_size,                    // lot size × lots
      order_type: "LIMIT", 
      price: Math.ceil(cis.minuteData.slice(-1)[0].close*1.1),           // MARKET | LIMIT | SL | SL-M
      product: "NRML",                  // MIS | NRML | CNC
      validity: "DAY"
    });

  }
    
  //get orderss

  let orders= await kite.getOrders();

  global.orders=orders;

  openOrder = global.orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');  

  //console.log('placed reverse order for',cis.tradingsymbol,openOrder);

  //update OpernOrder

return;


}

//console.log('tick per second after ordering',global.seconds,'handling position for',cis.tradingsymbol,cis.tps);

//console.log('handling position for',cis.tradingsymbol,'last price',cis.tick.last_price,'day low',daylow);
//console.log(cis.buyPrice,'buy price in has position for',cis.tradingsymbol,ml3,'3 min low' );
if(
 (cis.tick.last_price<=cis.tick.ohlc.low || cis.tick.last_price<=daylow || true) &&!cis.stopLossUpdating

){ 
 // console.log('stop loss ml3 min last price below last 3 min low for',cis.tradingsymbol,'last price',cis.tick.last_price,'day low',daylow);

let openOrders=global.orders.filter(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN'); 

cis.stopLossUpdating=true;
for(let openOrder of openOrders){ 
  
  console.log('updating open order price for',cis.tradingsymbol,'order id',openOrder.order_id,'to last price',cis.tick.last_price);       
        await updateOpenOrderPrice(kite, openOrder.order_id, cis.instrument_token, cis.tick.last_price, cis);
} 

//process.exit(1);
}
return
console.log('day low for',cis.tradingsymbol,'is',daylow);

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
       

let dayLow=Math.min(...cis.minuteData.map(d=>d.low));

    if(cis.tick.last_price<dayLow
      
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
