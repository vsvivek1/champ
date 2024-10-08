// executeBuy.js

export async function executeBuy(cis, kite,price) {
    // Check if the order has already been placed
    if (cis.ordered) {
        return false;
    }

    // Upglobal.date the status to indicate that an order has been placed
    cis.ordered = true;

    // Execute the actual buy order placement
    await placeOrder(cis, kite,price);
}

async function placeOrder(cis, kite,price) {

   
    ; // Use the last tick price or some other logic to determine the price
    let multiplier = 5; // Default multiplier, adjust based on your needs

    const orderParams = {
        exchange: "NFO",
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: cis.lot_size * multiplier,
        price: price,
        product: "NRML",
        validity: "DAY"
    };

    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        console.log("Order placed successfully. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing order:", error, cis.tradingsymbol);
    }
}
