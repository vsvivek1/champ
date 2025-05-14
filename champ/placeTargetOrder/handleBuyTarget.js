import { setTargetForTrade } from '../setTargetForTrade.js';
import { ceilPrice } from './utils.js';

export async function handleBuyTarget(cis, order, kite) {
    let targetPrice = global.hours === 9
        ? order.buy_price * 0.997
        : order.buy_price * 0.999;

    cis.order = order;
    cis.exitType = 'target';
    cis.targetPrice = targetPrice;
    cis.stopLossPrice = order.price + 5;

    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: 'BUY',
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
        console.log('Buy target order placed. Order ID:', orderId);
    } catch (error) {
        console.error('Error placing buy target:', error);
        process.exit();
    }
}
