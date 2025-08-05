import { handleBuyOrder } from './handleBuyOrder.js';
import { handleSellOrder } from './handleSellOrder.js';
import { handleRejectedBuyOrder } from './handleRejectedBuyOrder.js';
import eventBus from '../../eventBus.js';

export async function handleOrderUpdates(order, kite,cis,globalInstrumentsForMining) {







  //return;
  try {

if(!cis || typeof cis == 'undefined') {
return
}


if( cis.name!=global.instrumentName){

  console.log('cis.name!=global.instrumentName',cis.name,global.instrumentName , 'from mismatch of order updates of threads')
  return
}
  
//     if(typeof cis == 'undefined' || !cis) {
//   var cis=globalInstrumentsForMining.find(a => a.instrument_token == order.instrument_token)
  
//    global.allInstruments.find(a => a.instrument_token == order.instrument_token)
  
//   ;
//     }
// //cis=cis1;
//     if(cis && cis.name!=global.instrumentName){

//         //console.log('cis1.name!=global.instrumentName',cis.name,global.instrumentName , 'from mismatch of order updates of threads')

//         return;
//     }


//order status for  SENSEX25JUL81900PE buyPrice undefined orderId targetSet undefined stopLossSet undefined entryPrice 478 averageRange 12.301234567901236 ordered true targetPrice nil stopLossPrice nill

console.log(global.clock,cis.instrument_token,'from cis instrument token in handel order updates')

    if(global.mockTrading==true && order.status== 'REJECTED' && order.transaction_type == 'BUY') {

      console.log(order,'order ');

cis.mockPosition=true;

cis.buyPrice = order.average_price;
cis.entryPrice = order.average_price;

  cis.ordered = true;


  cis.targetSet = true


  cis.stopLossSet = true
  cis.targetPrice = order.average_price*4;
  cis.stopLossPrice = order.average_price*0.95;
  cis.hasLivePosition = true;

  console.log('mock order update for',cis.tradingsymbol,'buyPrice',cis.buyPrice,'orderId',
      "targetSet",cis.targetSet,'stopLossSet',cis.stopLossSet,
      'entryPrice',cis.entryPrice,'averageRange',cis.averageRange,'ordered',cis.ordered,
  "targetPrice",cis.targetPrice,"stopLossPrice",cis.stopLossPrice,`thread is ${global.instrumentName}`
  );

  eventBus.emit('hasLivePositionUpdated', { token: order.instrument_token, value: false });
  eventBus.emit('cisUpdated', { token: order.instrument_token, cis });

}

    if (order.status == 'OPEN'
      
      // && order.transaction_type == 'SELL'
    
    ) {

          global.orders = await kite.getOrders(); //trying once agin 


console.log('ORDER UPDATE OPEN',cis.tradingsymbol)
    }


    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {

    
    cis.position={}

    cis. hasLivePosition=false;
    cis.stopLossExecuted=false;
    cis.ordered =false
      //general clean up
    
  
  }



    // if (!cis1 || !cis1.name.includes(global.instrumentName)) {

    //     return;
    //   throw new Error(`[handleOrderUpdates] Instrument not tracked: ${order.instrument_token}`);
    // }

   // const cis =global.instrumentsForMining.find(i => i.instrument_token == order.instrument_token);
    if (!cis) {

      process.exit()

    //  cis =global.allInstruments.find(i => i.instrument_token == order.instrument_token);
    //  throw new Error(`[handleOrderUpdates] CIS not found for token: ${order.instrument_token}`);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
      console.log('Order completed for', cis.tradingsymbol, 'status:', order.status);

      // Resetting the order state
      cis.ordered = false;
      cis.entryPrice = null;
      cis.buyPrice = null;
      cis.targetSet = false;
      cis.stopLossSet = false;
      cis.targetPrice = null;
      cis.stopLossPrice = null;
      cis.buyStrategy = null;
      cis.averageRange = null;
      cis.stockTrade = false;
      cis.message = `Order completed for ${cis.tradingsymbol}. Status: ${order.status}, thread is ${global.instrumentName}`;


cis.hasLivePosition = false;
cis.placedOrder = false
console.log('emiting sell order update for',cis.tradingsymbol,global.clock)
eventBus.emit('hasLivePositionUpdated', { token: order.instrument_token, value: false });
      cis.hasLivePosition=false;

      await handleSellOrder(order, kite, cis);
    } else if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
     
     
     
      await handleBuyOrder(order, kite, cis);
   
   
   
    } else if (order.status == 'REJECTED' && order.transaction_type == 'BUY') {
      handleRejectedBuyOrder(cis);
    }

  } catch (error) {
    console.log('❌ [handleOrderUpdates] Error:', error);
    process.exit();
  }
}
