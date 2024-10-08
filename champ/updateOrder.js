// upglobal.dateOrder.js

/**
 * updates the price of an open order.
 * 
 * @param {Object} kite - The Kite Connect instance used to interact with the API.
 * @param {string} orderId - The ID of the order to be upglobal.dated.
 * @param {number} instrumentToken - The token of the instrument being traded.
 * @param {number} newPrice - The new price to upglobal.date the order to.
 */
export default async function updateOpenOrderPrice(kite, orderId, instrumentToken, newPrice) {
    try {
        // Define the parameters for updating the order


       // console.log(orderId,'order id');
        
        const orderParams = {
            order_id: orderId,
            price: newPrice,
        };

        // Send the request to modify the order

       // kite.modifyOrder()

       //console.log(kite);
       
        const response = await  kite.modifyOrder('regular',orderId, orderParams);

        console.log(`Order ${orderId} upglobal.dated successfully to new price ${newPrice}.`);
        return response;
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
        throw error; // Re-throw the error for further handling if needed
    }
}
