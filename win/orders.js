export async function fetchPositionsAndSetCis(kite, instruAll) {
    const positions = await kite.getPositions();
    const positionsDay = positions.day;
    instruAll.forEach(instrument => {
        const matchingPosition = positionsDay.find(pos => pos.tradingsymbol == instrument.tradingsymbol && pos.quantity > 0);
        if (matchingPosition) {
            instrument.position = matchingPosition;
            instrument.hasLivePosition = true;
        } else {
            instrument.position = null;
            instrument.hasLivePosition = false;
        }
    });
}

export async function fetchOrdersAndSetCis(kite, instruAll, orders) {
    try {
        orders = await kite.getOrders();
        instruAll.forEach(instrument => {
            const matchingOrder = orders.find(order => order.instrument_token == instrument.instrument_token);
            if (matchingOrder) {
                instrument.orderStatus = matchingOrder.status;
                instrument.orderT = matchingOrder.order_id;
                instrument.hasLiveOrder = matchingOrder.status == "OPEN";
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

export async function orderUpdates(order, kite, instruAll) {
    let cis = instruAll.find(i => i.instrument_token == order.instrument_token);
    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
        cis.ordered = false;
        cis.hasLivePosition = false;
        cis.updated = false;
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);

        const orderParams = {
            exchange: "NFO",
            tradingsymbol: order.tradingsymbol,
            transaction_type: "SELL",
            order_type: "LIMIT",
            quantity: order.quantity,
            price: order.price + 10,
            product: "NRML",
            validity: "DAY",
        };

        try {
            const orderId = await kite.placeOrder("regular", orderParams);
            console.log(global.clock+ " Order placed successfully. Order ID:", orderId);
        } catch (error) {
            console.error("Error placing order:", error);
        }
    }
}