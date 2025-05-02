import { handleSellTarget } from './handleSellTarget.js';
import { handleBuyTarget } from './handleBuyTarget.js';

export async function placeTargetOrder(cis, order, kite) {
    const isSTK = global.instrumentName === 'STK';

    if (isSTK && cis.shortTrading) {
        await handleBuyTarget(cis, order, kite);
    } else {
        await handleSellTarget(cis, order, kite);
    }
}
