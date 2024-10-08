// orderUtils.js

import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './fetchData.js';

export async function updateOpenOrderPrice(kite, order_id, instrument_token, last_price) {
    const updatedPrice = last_price; // Modify as per your logic

    try {
        const orderParams = {
            order_id: order_id,
            price: updatedPrice,
            // Additional parameters as required
        };

        await kite.modifyOrder("regular", orderParams);
        console.log(`Order ${order_id} updated successfully to price ${updatedPrice}`);
    } catch (error) {
        console.error(`Error updating order ${order_id}:`, error);
    }
}

export async function handleOrderUpdates(order, kite) {
    let cis = instrumentsForMining.find(i => i.instrument_token == order.instrument_token);
    if (!cis) return;

    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
        cis.sellPrice = order.price;
        cis.noBuy = true;
        let dt = new Date();
        cis.noBuyTime = dt.getTime() + (1 * 60 * 1000);

        cis.lastSeenHigh = 0;
        cis.lastSeenHighForPosition = 0;
       // cis.ordered = false;
       cis.hasLivePosition = false;
       // cis.updated = false;
       //cis.placedTarget = false;
       // cis.hasPlacedTarget = false;
       // cis.updated = false;
        //cis.highestProfit = 0;

        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        placeTargetOrder(cis, order, kite);
    }
}

async function placeTargetOrder(cis, order, kite) {
    const targetPoints = 5; // Adjust target points as needed
   
  //  var targetPrice = order.price + targetPoints;
    var targetPrice = order.price *1.08
    if(cis.colorTrading==true){

       // targetPrice=order.sprice+ Math.ceil(order.price*.01);
        targetPrice=order.price*1.08;//Math.ceil(order.price+1);
    }
    
    const orderParams = {
        exchange: "NFO",
        tradingsymbol: order.tradingsymbol,
        transaction_type: "SELL",
        order_type: "LIMIT",
        quantity: order.quantity,
        price: Math.ceil(targetPrice),
        product: "NRML",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;
        console.log("Target order placed successfully. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing target order:", error);
    }
}
