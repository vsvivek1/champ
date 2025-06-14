export async function updateOpenOrderPrice(kite, order_id, instrument_token, last_price) {
    const updatedPrice = last_price;

    try {
        const orderParams = {
            order_id: order_id,
            price: updatedPrice,
        };


        
        await kite.modifyOrder("regular", orderParams);
        console.log(`Order ${order_id} updated successfully to price ${updatedPrice}`);
    } catch (error) {
        console.error(`Error updating order ${order_id}:`, error);
    }
}
