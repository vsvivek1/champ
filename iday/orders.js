export async function fetchOrdersAndSetCis(kite, instruAll) {
    try {
        const orders = await kite.getOrders();
        instruAll.forEach(instrument => {
            const matchingOrder = orders.find(order => order.instrument_token === instrument.instrument_token);
            if (matchingOrder) {
                instrument.orderStatus = matchingOrder.status;
                instrument.orderT = matchingOrder.order_id;
                instrument.hasLiveOrder = matchingOrder.status === "OPEN";
            } else {
                instrument.orderStatus = null;
                instrument.orderT = null;
                instrument.hasLiveOrder = false;
            }
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

export async function fetchPositionsAndSetCis(kite, instruAll) {
    const positions = await kite.getPositions();
    const positionsDay = positions.day;

    instruAll.forEach(instrument => {
        const matchingPosition = positionsDay.find(pos => pos.tradingsymbol === instrument.tradingsymbol && pos.quantity > 0);
        if (matchingPosition) {
            instrument.position = matchingPosition;
            instrument.hasLivePosition = true;
            instrument.buyPrice = matchingPosition.average_price;
        } else {
            instrument.position = null;
            instrument.hasLivePosition = false;
        }
    });
}
