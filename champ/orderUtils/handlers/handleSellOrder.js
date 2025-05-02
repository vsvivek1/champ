import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from '../../fetchData.js';
import { placeShortCovering } from '../placeShortCovering.js';

export async function handleSellOrder(order, kite, cis) {
  try {
    if (!order || !cis) {
      throw new Error('[handleSellOrder] Missing order or CIS');
    }

    cis.sellPrice = order.price;
    cis.noBuy = true;

    setTimeout(() => {
      cis.noBuy = false;
      console.log('[handleSellOrder] NoBuy lock released:', cis.tradingsymbol);
    }, 60 * 1000);

    console.log('[handleSellOrder] Sell order completed');

    // Reset CIS state explicitly
    cis.lastSeenHigh = 0;
    cis.lastSeenHighForPosition = 0;
    cis.ordered = false;
    cis.hasLivePosition = false;
    cis.updated = false;
    cis.placedTarget = false;
    cis.hasPlacedTarget = false;
    cis.highestProfit = 0;

    await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);

    if (cis.shortTrading) {
      await placeShortCovering(cis, order, kite);
    }

  } catch (error) {
    console.log('❌ [handleSellOrder] Error:', error);
    process.exit();
  }
}
