import { setTargetForTrade } from '../setTargetForTrade.js';

export async function placeTargetOrder(cis, order, kite) {
    let op = order.price;
    cis.order = order;

    // Default target calculation
    let targetPrice = order.buy_price + cis.averageRange;

    // Fallback if invalid range
    if (isNaN(targetPrice)) {
        targetPrice = order.average_price + 2;

        console.log('target is nan14 ')
    }

    // If target was pre-set by strategy
    if (cis.inbuiltTarget) {
        targetPrice = cis.targetPrice;

        console.log('target is built in ')
    }

    // Force overwrite for some conditions (e.g., STK)
    // if (global.speedSymbols.includes(cis.tradingsymbol)) {
    //     targetPrice = op + 2;
    // }

    let transaction_type = 'SELL';

    // STK logic
    // if (global.instrumentName === 'STK') {
    //     if (cis.shortTrading) {
    //         transaction_type = 'BUY';
    //         targetPrice = global.hours === 9
    //             ? order.average_price * 0.997
    //             : order.average_price * 0.999;
    //     } else {
    //         transaction_type = 'SELL';
    //         targetPrice = global.hours === 9
    //             ? order.average_price * 1.03
    //             : order.average_price * 1.01;
    //     }
    // }

    // Overwrite if custom logic needed
    targetPrice = op + 3; // This is safe since `op` is defined

    // Set values for the current CIS
    cis.order.inbuiltTarget = true;
    cis.order.inbuiltStopLoss = true;

    
    
    cis.order.stopLossPrice = op - 3;

    // Set to cis object
    cis.targetPrice = targetPrice;
    cis.stopLossPrice = op - 3;


    // if(op==0 || isNaN(op)){

    //    // cis.targetPrice=cis.tick.last_price+3
    //    // cis.stopLossPrice=cis.tick.last_price-3

    //     //console.log('target is built in 67 line')

    // }

    // Validate before order placement
    if (isNaN(cis.targetPrice)) {

        cis.targetPrice=cis.minuteData.slice(-1).high+3

        cis.stopLossPrice=cis.minuteData.slice(-1).low-3

       // process.exit();
        console.warn(`[❌] NaN targetPrice detected for ${cis.tradingsymbol}, using minute data for target order.`);
       // return;
    }

    if(!isNaN(cis.averageRange)){

        cis.targetPrice=order.price+(cis.averageRange)

        console.log('order placed from average range')
    }

    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: transaction_type,
        order_type: "LIMIT",
        quantity: order.quantity,
        price: Math.ceil(cis.targetPrice),
        product: "MIS",
        validity: "DAY",
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;

        // Log to DB
        await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), 'custom');

        console.log("✅ Target order placed successfully. Order ID:", orderId);
    } catch (error) {
        console.error("❌ Error placing target order for", cis.tradingsymbol, error);
        process.exit(); // or handle more gracefully
    }
}
