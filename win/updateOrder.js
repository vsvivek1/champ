// updateOrder.js

//import kite from "./kite";

async function updateOpenOrderPrice(kite,orderId, instrumentToken, newPrice) {
    // Find the open order with the given instrument token


  


    // Update the order with the new price
    const orderParams = {
        price: newPrice
    };

    try {
        const updatedOrder = await kite.modifyOrder("regular", orderId, orderParams);
        console.log("Order updated successfully. Order ID:", updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
    }
}

export default updateOpenOrderPrice;
