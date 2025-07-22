import { setTargetForTrade } from '../setTargetForTrade.js';

export async function placeTargetOrder(cis, order, kite) {
  if (cis.orderPlacementInProgress) {
    console.log(`🚫 Order already in progress for ${cis.tradingsymbol}, skipping.`);
    return;
  }
  cis.orderPlacementInProgress = true;

  try {
    if (cis.hasPlacedTarget) {
      console.log(`⚠️ Target already placed for ${cis.tradingsymbol}, skipping.`);
      return;
    }

    let finalTargetPrice;

    switch (true) {
      // ✅ CASE 1: Use in-built target
      case cis.hasInBuiltTarget === true: {
        finalTargetPrice = Math.ceil(cis.targetPrice);
        break;
      }

      // 🟢 CASE 2: Fallback to last buy order + 5 points
      default: {
        if (!order) {
          if (!global.orders) global.orders = [];

          const buyOrders = global.orders
            .filter(o =>
              o.instrument_token === cis.instrument_token &&
              String(o.status).toLowerCase() === 'complete' &&
              String(o.transaction_type).toLowerCase() === 'buy'
            )
            .sort((a, b) =>
              new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp)
            );

          if (buyOrders.length === 0) {
            console.warn(`⚠️ No BUY order found for ${cis.tradingsymbol}. Skipping target.`);
            return;
          }

          order = buyOrders[0];
          console.log(`ℹ️ Using last buy order:`, order);
        }

        const buyPrice = order.average_price || order.price;
        if (!buyPrice || isNaN(buyPrice)) {
          console.error(`❌ Invalid buy price from order.`);
          return;
        }

        cis.buy_price = buyPrice;
        finalTargetPrice = Math.ceil(buyPrice + 5);
        cis.targetPrice = finalTargetPrice;
        console.log(`🎯 Target set as buy_price + 5 = ${finalTargetPrice}`);
        break;
      }
    }

    const orderParams = {
      exchange: cis.exchange,
      tradingsymbol: cis.tradingsymbol,
      transaction_type: 'SELL',
      order_type: 'LIMIT',
      quantity: order?.quantity || cis.position?.quantity || 1,
      price: finalTargetPrice,
      product: 'MIS',
      validity: 'DAY',
    };

    const orderId = await kite.placeOrder('regular', orderParams);
    cis.hasPlacedTarget = true;
    cis.hasLivePosition = true;
    cis.hasPosition = true;

    await setTargetForTrade(cis.tradingsymbol, orderParams.price, 'final');
    console.log(`✅ Target order placed. Order ID: ${orderId}`);
  } catch (err) {
    console.error(`❌ Error placing target order for ${cis.tradingsymbol}:`, err.message || err);
  } finally {
    cis.orderPlacementInProgress = false;
  }
}
