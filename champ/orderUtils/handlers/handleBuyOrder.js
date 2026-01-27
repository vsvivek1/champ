import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from '../../fetchData.js';
import { placeTargetOrder } from '../placeTargetOrder.js';

export async function handleBuyOrder(order, kite, cis) {
  try {
    await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);

    if (!order || !cis) {
      throw new Error('[handleBuyOrder] Missing order or CIS');
    }

    cis.last_price = order.average_price;
    cis.slTriggerPrice = order.average_price * 0.95;
    cis.slPrice = order.average_price * 0.94;
  
  
    cis.tgtTriggerPrice = order.average_price * 1.06;
    
    
    cis.tgtPrice = order.average_price+1

   ///      console.log('\norder update received at handle before place target order' ,order.tradingsymbol,'status',order.status,'transaction_type',order.transaction_type ,global.clock )

/// so this is working
    await placeTargetOrder(cis, order, kite);
  } catch (error) {
    console.log('❌ [handleBuyOrder] Error:', error);
    process.exit();
  }
}
