export async function updateOpenOrderPrice(kite, order_id, instrument_token, last_price, cis) {
    try {
        const referenceLow = cis?.last3CandleLow ?? last_price;

        const triggerPrice = Math.round(referenceLow * 0.99 * 10) / 10;
        const updatedPrice = Math.round(triggerPrice * 0.997 * 10) / 10;

        const orderParams = {
            order_id: order_id,
            order_type: "SL",
            trigger_price: triggerPrice,
            price: updatedPrice,
        };

        await kite.modifyOrder("regular", orderParams);
        console.log(`Order ${order_id} trailed - trigger ${triggerPrice}, price ${updatedPrice}`);
    } catch (error) {
        console.error(`Error updating order ${order_id}:`, error);
    }
}
