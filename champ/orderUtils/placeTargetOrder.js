import { setTargetForTrade } from '../setTargetForTrade.js';

export async function placeTargetOrder(cis, order, kite, _retried = false) {
  const now = Date.now();

  // 🚫 Total lock to prevent parallel execution from rapid ticks
  if (cis.orderPlacementInProgress) {
    console.log(`🚫 Order placement already in progress for ${cis.tradingsymbol}, skipping.`);
    return;
  }
  cis.orderPlacementInProgress = true;

  try {
    if (cis.hasPlacedTarget) {
      console.log(`⚠️ Target already placed for ${cis.tradingsymbol}, skipping.`);
      return;
    }

    // 🔄 Fallback: Get latest BUY order if order not passed
    if (!order) {
      if (!global.orders) global.orders = [];
      if (!global.lastOrdersFetchTime) global.lastOrdersFetchTime = 0;

      let buyOrders = global.orders
        .filter(o =>
          o.instrument_token == cis.instrument_token &&
          String(o.status).toLowerCase() == 'complete' &&
          String(o.transaction_type).toLowerCase() == 'buy'
        )
        .sort((a, b) =>
          new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp)
        );

      if (buyOrders.length == 0) {
        if (!_retried) {
          const now = Date.now();
          if (now - global.lastOrdersFetchTime > 3000) {
            console.warn(`[⚠️] No BUY order found. Fetching fresh orders from exchange...`);
            try {
              global.orders = await kite.getOrders();
              global.lastOrdersFetchTime = now;
              global.hasFetchedOrdersOnce = true;
            } catch (err) {
              console.error(`❌ Failed to fetch orders from exchange:`, err.message || err);
              return;
            }
            return await placeTargetOrder(cis, null, kite, true); // Retry once
          } else {
            console.warn(`⏳ Orders fetched recently. Skipping retry.`);
          }
        } else {
          console.error(`[❌] Still no BUY orders found after fetch for ${cis.tradingsymbol}`);
          return;
        }
      } else {
        order = buyOrders[0];
        console.log(`ℹ️ Using fallback BUY order:`, order);
      }
    }

    // 🧠 Determine buy price safely
    let baseBuyPrice = cis.buy_price;


    if (typeof baseBuyPrice != 'number' || isNaN(baseBuyPrice)) {
      if (order && (typeof order.average_price == 'number' || typeof order.price == 'number')) {
        baseBuyPrice = order.average_price || order.price;
        cis.buy_price = baseBuyPrice;
        console.log(`ℹ️ buy_price set from order: ${baseBuyPrice}`);
      } else {
        console.error(`❌ Cannot determine buy price from cis or order for ${cis.tradingsymbol}`);
        return;
      }
    }

    // 🎯 Set targetPrice
    if (typeof cis.targetPrice != 'number' || isNaN(cis.targetPrice)) {
      if (!isNaN(cis.averageRange)) {
        cis.targetPrice = baseBuyPrice + cis.averageRange;
        console.log(`✅ Target set using averageRange: ${cis.targetPrice}`);
      } else if (cis.minuteData?.length > 0) {
        const last = cis.minuteData.at(-1);
        cis.targetPrice = last.high + global.targetPoints;


        cis.stopLossPrice = last.low -cis.tick.ohlc.open


        console.warn(`[⚠️] Target estimated from minuteData: ${cis.targetPrice}`);
      } else {
        const fallbackPoints = global.targetPoints || 5;
        cis.targetPrice = baseBuyPrice + fallbackPoints;
        cis.stopLossPrice = baseBuyPrice - fallbackPoints;
        console.log(`✅ Fallback targetPrice: ${cis.targetPrice}, stopLossPrice: ${cis.stopLossPrice}`);
      }
    }






    let lm=cis.minuteData.slice(-1);
    let high=lm.high;
    cis.buy_price=Math.max(high,cis.tick.last_price,cis.buy_price)


    //console.log(cis,cis.buy_price,cis.buy_price=cis.minuteData.slice(-1).high,cis.buy_price)

    if(global.hours==9)  cis.targetPrice=cis.buy_price*2;
     else if(global.hours==10)  cis.targetPrice=cis.buy_price*1.4;
      else if(global.hours==11)  cis.targetPrice=cis.buy_price*1.15;
      
       else cis.targetPrice=cis.buy_price*1.1;
   
    // 📝 Prepare order params
    const orderParams = {
      exchange: cis.exchange,
      tradingsymbol: cis.tradingsymbol,
      transaction_type: 'SELL',
      order_type: 'LIMIT',
      quantity: order?.quantity || cis.position?.quantity || 1,
      price: Math.ceil(cis.targetPrice),
      product: 'MIS',
      validity: 'DAY',
    };

    // 🔐 Final lock before placing order
    if (cis.hasPlacedTarget) {
      console.log(`⚠️ Target already marked as placed just before order placement for ${cis.tradingsymbol}, skipping.`);
      return;
    }

    // 🚀 Place the order
    const orderId = await kite.placeOrder('regular', orderParams);
    cis.hasPlacedTarget = true;
    cis.hasLivePosition = true;
    cis.hasPosition = true;

    await setTargetForTrade(cis.tradingsymbol, orderParams.price, 'custom');
    console.log(`✅ Target order placed. Order ID: ${orderId}`);
  } catch (err) {
    console.error(`❌ Error placing target order for ${cis.tradingsymbol}:`, err.message || err);
  } finally {
    // 🔓 Always release lock
    cis.orderPlacementInProgress = false;
  }
}
