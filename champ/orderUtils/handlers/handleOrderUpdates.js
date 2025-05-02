import { handleBuyOrder } from './handleBuyOrder.js';
import { handleSellOrder } from './handleSellOrder.js';
import { handleRejectedBuyOrder } from './handleRejectedBuyOrder.js';

export async function handleOrderUpdates(order, kite) {
  try {
    const cis1 = global.allInstruments.find(a => a.instrument_token == order.instrument_token);

    if(cis1.name!=global.instrumentName){

        console.log('cis1.name!=global.instrumentName',cis1.name,global.instrumentName)

        return;
    }


    if (!cis1 || !cis1.name.includes(global.instrumentName)) {

        return;
      throw new Error(`[handleOrderUpdates] Instrument not tracked: ${order.instrument_token}`);
    }

    const cis = global.allInstruments.find(i => i.instrument_token == order.instrument_token);
    if (!cis) {
      throw new Error(`[handleOrderUpdates] CIS not found for token: ${order.instrument_token}`);
    }

    if (order.status === 'COMPLETE' && order.transaction_type === 'SELL') {
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
