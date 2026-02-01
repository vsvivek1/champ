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
      // case cis.hasInBuiltTarget == true: {
      //   finalTargetPrice = Math.ceil(cis.targetPrice);
      //   break;
      // }

      // 🟢 CASE 2: Fallback to last buy order + 5 points

case (cis.hasInbuiltTarget == true): 
     {
        finalTargetPrice = Math.ceil(cis.targetPrice);
        console.log(`🎯 Using provided target price: ${finalTargetPrice}`);
        break;
      } 


      default: {
        if (!order) {

                   console.log('inside default of place targer' ,order.tradingsymbol,'status',order.status,'transaction_type',order.transaction_type  )

          if (!global.orders) global.orders = [];

          const buyOrders = global.orders
            .filter(o =>
              o.instrument_token == cis.instrument_token &&
              String(o.status).toLowerCase() == 'complete' &&
              String(o.transaction_type).toLowerCase() == 'buy'
            )
            .sort((a, b) =>
              new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp)
            );

          if (buyOrders.length == 0) {
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

        if(global.hours==9){

 finalTargetPrice = Math.ceil(buyPrice * 1.05);
        }else{

           finalTargetPrice = Math.ceil(buyPrice*1.05,1);
        }
       
        cis.targetPrice = finalTargetPrice;
        console.log(`🎯 Target set as buy_price * 1.005 = ${finalTargetPrice}`);
        break;
      }
    }


    finalTargetPrice = Math.round(buyPrice *1.5,1);
    
    // const orderParams = {
    //   exchange: cis.exchange,
    //   tradingsymbol: cis.tradingsymbol,
    //   transaction_type: 'SELL',
    //   order_type: 'LIMIT',
    //   quantity: order.quantity, //|| cis.position?.quantity || 1,
    //   price: finalTargetPrice,
    //   product: 'NRML',
    //   validity: 'DAY',
    // };


   // 1️⃣ Get lowest LOW of last 15 minutes
let fifteenMinutesLow = null;

if (cis.minuteData && cis.minuteData.length >= 15) {
  fifteenMinutesLow = cis.minuteData
    .slice(-15)
    .reduce((min, candle) => {
      const low = candle[3]; // LOW index
      return low < min ? low : min;
    }, Infinity);
}

// 2️⃣ Decide trigger price (1% below 15-min low)
let triggerPrice;

if (fifteenMinutesLow === null || !isFinite(fifteenMinutesLow)) {
  console.log(
    '⚠️ fifteenMinutesLow invalid, setting SL to 5% below buy price'
  );
  triggerPrice = Math.round(buyPrice * 0.95 * 10) / 10;
} else {
  triggerPrice = Math.round(fifteenMinutesLow * 0.99 * 10) / 10;
}

// 3️⃣ SL limit price (slightly below trigger)
let slPrice = Math.round(triggerPrice * 0.997 * 10) / 10;

// 4️⃣ Final order params
const orderParams = {
  exchange: cis.exchange,
  tradingsymbol: cis.tradingsymbol,
  transaction_type: 'SELL',
  order_type: 'SL',

  trigger_price: triggerPrice, // ✅ NUMBER
  price: slPrice,              // ✅ NUMBER

  quantity: order.quantity,
  product: 'NRML',
  validity: 'DAY',
};

         //    console.log('order update received at before place order' ,order.tradingsymbol,'status',order.status,'transaction_type',order.transaction_type  )

    const orderId = await kite.placeOrder('regular', orderParams);
    cis.hasPlacedTarget = true;
    cis.hasLivePosition = true;
    cis.hasPosition = true;

    await setTargetForTrade(cis.tradingsymbol, orderParams.price, 'final');
    console.log(`✅ Target order placed. Order ID: ${orderId}`,orderId,"\n");
  } catch (err) {
    console.error(`❌ Error placing target order for ${cis.tradingsymbol}:`, err.message || err);
  } finally {
    cis.orderPlacementInProgress = false;
  }
}
