import { setTargetForTrade } from '../setTargetForTrade.js';

export async function placeShortCovering(cis, order, kite) {

    //return;
    let targetPrice = global.hours === 9
        ? order.average_price * 0.997
        : order.average_price * 0.99;

    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: order.quantity,
        price: order.price-2,
        product: "MIS",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;
        cis.shortTrading = false;
        await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), 'short-cover');
        console.log("Short covering order placed. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing short covering order:", error);
    }
}
