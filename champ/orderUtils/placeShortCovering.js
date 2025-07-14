import { WEB_PERMISSION_TO_PROTOCOL_PERMISSION } from 'puppeteer';
import { setTargetForTrade } from '../setTargetForTrade.js';

export async function placeShortCovering(cis, order, kite) {

    //return;
    let targetPrice = global.hours === 9
        ? order.average_price * 0.997
        : order.average_price * 0.99;




    let range=    Math.ceil(cis.minuteCandleMeanRange)

    let tgt=Math.floor(cis.price-cis.actualRange);

    if(isNaN(tgt)  ) tgt=cis.minuteData.slice(-1).low-range;
    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: order.quantity,
        price: tgt ,
        product: "MIS",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;
        cis.shortTrading = false;
       // await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), 'short-cover');
        console.log("Short covering order placed. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing short covering order:", error,cis);

        process.exit()
    }
}
