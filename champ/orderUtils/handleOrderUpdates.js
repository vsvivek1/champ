import { handleBuyOrder } from './handleBuyOrder.js';
import { handleSellOrder } from './handleSellOrder.js';
import { handleRejectedBuyOrder } from './handleRejectedBuyOrder.js';

export async function handleOrderUpdates(order, kite) {
  try {
    const cis1 =global.instrumentsForMining.find(a => a.instrument_token == order.instrument_token);
    if (typeof cis1 =='undefined'
        
        || !cis1.name.includes(global.instrumentName)
    
    ) {

        return;
      throw new Error(`[handleOrderUpdates] Instrument not tracked: ${order.instrument_token}`);
    }

    var cis =global.instrumentsForMining.find(i => i.instrument_token == order.instrument_token);
    if (!cis) {

      cis=global.instrumentsAll.find(i => i.instrument_token == order.instrument_token);

      //throw new Error(`[handleOrderUpdates] CIS not found for token: ${order.instrument_token}`);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {

      cis.placeTargetIfNotTargetSet=false;
      await handleSellOrder(order, kite, cis);
    } else if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
      await handleBuyOrder(order, kite, cis);
    } else if (order.status == 'REJECTED' && order.transaction_type == 'BUY') {
      handleRejectedBuyOrder(cis);
    }

  } catch (error) {
    console.log('❌ [handleOrderUpdates] Error:', error,cis1);

    console.log('cis here is ',cis1)
    process.exit();
  }
}
