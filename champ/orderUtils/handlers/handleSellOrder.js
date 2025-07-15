import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from '../../fetchData.js';
import { placeShortCovering } from '../placeShortCovering.js';

export async function handleSellOrder(order, kite, cis) {
  try {

    cis.hasLivePosition=false;
    let a=cis.hasLivePosition;
    a;
    cis.hasLivePosition=false;
    cis.hasLivePosition = false;
    cis.lastSeenHigh = 0;
    cis.lastSeenHighForPosition = 0;
    cis.ordered = false;
    cis.hasLivePosition = false;
    cis.updated = false;
    cis.placedTarget = false;
    cis.hasPlacedTarget = false;
    cis.highestProfit = 0;

    if (!order || !cis) {
      throw new Error('[handleSellOrder] Missing order or CIS');
    }

    cis.sellPrice = order.price;
    cis.noBuy = true;

    console.log('[handleSellOrder] Sell order completed');

    cis.hasLivePosition=false;

    setTimeout(() => {
      cis.noBuy = false;
      console.log('[handleSellOrder] NoBuy lock released:', cis.tradingsymbol);
    }, 10 * 1000);

    

    // Reset CIS state explicitly
  
 
    await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);


    
    if (global.enableShortTrading 

    ) {

      if(cis && cis.minuteData && cis.minuteData.length > 0) {
      await placeShortCovering(cis, order, kite);
    }
    } // <-- Add this closing brace for the 'if (global.enableShortTrading)' block

  } catch (error) {
    console.log('❌ [handleSellOrder] Error:', error);
    process.exit();
  }
}
