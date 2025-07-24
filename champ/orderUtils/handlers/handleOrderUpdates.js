import { handleBuyOrder } from './handleBuyOrder.js';
import { handleSellOrder } from './handleSellOrder.js';
import { handleRejectedBuyOrder } from './handleRejectedBuyOrder.js';
import eventBus from '../../eventBus.js';

export async function handleOrderUpdates(order, kite,cis) {







  //return;
  try {
  var cis=global.instrumentsForMining.find(a => a.instrument_token == order.instrument_token)||
  global.allInstruments.find(a => a.instrument_token == order.instrument_token)
  
  ;
//cis=cis1;
    if(cis && cis.name!=global.instrumentName){

        //console.log('cis1.name!=global.instrumentName',cis.name,global.instrumentName , 'from mismatch of order updates of threads')

        return;
    }




    if(global.mockTrading==true && order.status=== 'REJECTED' && order.transaction_type === 'BUY') {

cis.mockPosition=true;


    }

    if (order.status === 'OPEN'
      
      // && order.transaction_type === 'SELL'
    
    ) {

          global.orders = await kite.getOrders(); //trying once agin 


console.log('ORDER UPDATE OPEN',cis.tradingsymbol)
    }


    if (order.status === 'COMPLETE' && order.transaction_type === 'SELL') {

    
    cis.position={}

    cis. hasLivePosition=false;
      //general clean up
    
  
  }



    // if (!cis1 || !cis1.name.includes(global.instrumentName)) {

    //     return;
    //   throw new Error(`[handleOrderUpdates] Instrument not tracked: ${order.instrument_token}`);
    // }

   // const cis =global.instrumentsForMining.find(i => i.instrument_token == order.instrument_token);
    if (!cis) {

      cis =global.allInstruments.find(i => i.instrument_token == order.instrument_token);
    //  throw new Error(`[handleOrderUpdates] CIS not found for token: ${order.instrument_token}`);
    }

    if (order.status === 'COMPLETE' && order.transaction_type === 'SELL') {



cis.hasLivePosition = false;
console.log('emiting sell order update for',cis.tradingsymbol)
eventBus.emit('hasLivePositionUpdated', { token: order.instrument_token, value: false });
      cis.hasLivePosition=false;

      await handleSellOrder(order, kite, cis);
    } else if (order.status === 'COMPLETE' && order.transaction_type === 'BUY') {
      await handleBuyOrder(order, kite, cis);
    } else if (order.status === 'REJECTED' && order.transaction_type === 'BUY') {
      handleRejectedBuyOrder(cis);
    }

  } catch (error) {
    console.log('❌ [handleOrderUpdates] Error:', error);
    process.exit();
  }
}
