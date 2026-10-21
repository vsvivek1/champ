// upglobal.dateOrder.js

/**
 * Trails the resting SL order's trigger_price (and limit price) as price
 * action turns bearish, instead of only nudging the limit price while the
 * trigger stays put.
 *
 * @param {Object} kite - The Kite Connect instance used to interact with the API.
 * @param {string} orderId - The ID of the order to be updated.
 * @param {number} instrumentToken - The token of the instrument being traded.
 * @param {number} newPrice - The last traded price (fallback reference if cis.last3CandleLow is unavailable).
 * @param {Object} cis - The instrument's tracked state, used for last3CandleLow.
 */
export default async function updateOpenOrderPrice(kite, orderId, instrumentToken, newPrice, cis) {
    // Stop-loss trailing is now handled by the separate stopLossGuard.js
    // pm2 process; disabled here to avoid conflicting SL modifications.
    return;

    try {
        const referenceLow = cis?.last3CandleLow ?? newPrice;

        const triggerPrice = Math.round(referenceLow * 0.99 * 10) / 10;
        const updatedPrice = Math.round(triggerPrice * 0.985 * 10) / 10;

        const orderParams = {
            order_id: orderId,
            order_type: "SL",
            trigger_price: triggerPrice,
            price: updatedPrice,
        };

        const response = await kite.modifyOrder('regular', orderId, orderParams);

        console.log(`Order ${orderId} trailed - trigger ${triggerPrice}, price ${updatedPrice}`, global.clock);
        return response;
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error, global.clock);

       return;
        //throw error; // Re-throw the error for further handling if needed
    }
}
