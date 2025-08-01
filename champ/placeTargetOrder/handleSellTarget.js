import { setTargetForTrade } from '../setTargetForTrade.js';
import { ceilPrice } from './utils.js';

export async function handleSellTarget(cis, order, kite) {
    let targetPrice;

    if (cis.inbuiltTarget && cis.inbuiltTarget==true ) {
        targetPrice = cis.targetPrice;
    } else {
        targetPrice = order.buy_price + 5;
    }

    if (isNaN(targetPrice)) targetPrice = order.buy_price + 2;

    // if (global.speedSymbols.includes(cis.tradingsymbol)) {
    //     targetPrice = order.price + 2;
    // }

    if (global.instrumentName == 'STK') {
        targetPrice = global.hours == 9
            ? order.buy_price * 1.03
            : order.buy_price * 1.01;
    }

    cis.order = order;
    cis.exitType = 'target';
    cis.targetPrice = targetPrice;
    cis.stopLossPrice = order.price - 5;

    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: 'SELL',
        order_type: 'LIMIT',
        quantity: order.quantity,
        price: ceilPrice(targetPrice),
        product: 'MIS',
        validity: 'DAY',
    };

    try {
        const orderId = await kite.placeOrder('regular', orderParams);
        cis.hasPlacedTarget = true;
        await setTargetForTrade(cis.tradingsymbol, ceilPrice(targetPrice), 'custom');
        console.log('Sell target order placed. Order ID:', orderId);
    } catch (error) {
        console.error('Error placing sell target:', error);
        process.exit();
    }
}
