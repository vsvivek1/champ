
async function placeGTT(kc,tradingsymbol) {
    try {


        return;
        kc.setDebug(true);
        console.log('h1')
        const gtt = await kc.placeGTT({
            trigger_type: kc.GTT_TYPE_OCO,
            tradingsymbol: tradingsymbol,
            exchange: "NSE",
            trigger_values: [800, 840],
            last_price: 835,
            orders: [{
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 840
            }, {
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: 1,
                product: kc.PRODUCT_CNC,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: 800
            }]
        });
        console.log('GTT Placed:', gtt);

        console.log('h2')
    } catch (err) {
        console.error('Error placing GTT:', err);
    }
}


export async function placeGttOcoOrder(kc,ltp, tradingSymbol, exchange, slTriggerPrice, slPrice, tgtTriggerPrice, 
    tgtPrice, quantity,cis,order) {
    
    
        try {

          //  kc.setDebug(true);


            console.log(ltp, tradingSymbol, exchange, slTriggerPrice, slPrice, tgtTriggerPrice, 
                tgtPrice, quantity,)



               console.log(order,'order');


                //return;


        const gtt = await kc.placeGTT({
            trigger_type: kc.GTT_TYPE_OCO,
            tradingsymbol: tradingSymbol,
            exchange: cis.exchange,
            trigger_values: [slTriggerPrice, tgtTriggerPrice],
            last_price: ltp,
            orders: [{
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: order.quantity,
                product: order.product,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: slPrice
            }, {
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: order.quantity,
                product: order.product,
                order_type: kc.ORDER_TYPE_LIMIT,
                price: tgtPrice
            }]
        });
        console.log('GTT Placed:', gtt);

        console.log('h2')
    // } catch (err) {
    //     console.error('Error placing GTT:', err);
    // }






       //await placeGTT(kc,tradingSymbol);


        console.log('exiting b4')
       // process.exit();


       return;

       // console.log(tradingSymbol,'trading symbol');
        //let product= cis.product;;
       // console.log(tradingSymbol,'trading symbol',{product});

        let last_price= (slTriggerPrice + tgtTriggerPrice) / 2;

        last_price=ltp;


      let  product=order.product;

        // console.log('here2',ltp, tradingSymbol, exchange, slTriggerPrice, slPrice, tgtTriggerPrice, 
        //     tgtPrice, quantity,cis)


            let obj={
                trigger_type: 'single', // One Cancels the Other (OCO)
                trigger_values: [
                    
                    // slTriggerPrice,
                    
                    tgtTriggerPrice], // Separate triggers for SL & Target
                condition: {
                    exchange: exchange,
                    tradingsymbol: tradingSymbol,
                    trigger_values: [
                        
                        // slTriggerPrice,
                         tgtTriggerPrice
                        
                        ],
                    last_price: last_price, // Approximate last price
                },
                orders: [
                    // {
                    //     transaction_type: kc.TRANSACTION_TYPE_SELL, // Stop Loss Order
                    //     order_type: kc.ORDER_TYPE_LIMIT,
                    //     price: slPrice, // SL Price
                    //     quantity: quantity,
                    //     product: product,
                    //     exchange: exchange,
                    // }
                    
                   // ,
                    {
                        transaction_type: kc.TRANSACTION_TYPE_SELL, // Target Order
                        order_type: kc.ORDER_TYPE_LIMIT,
                        price: tgtPrice, // Target Price
                        quantity: quantity,
                        product: product,
                        exchange: exchange,
                    }
                ]
            };
        

            console.log(obj,'is obj')
        const gttOrder = await kc.placeGTT(
            
            obj
    
    );


    
        console.log("GTT OCO Order Placed Successfully:", gttOrder);
        return gttOrder;
    } catch (error) {
        console.error("Error placing GTT OCO order:", error)
        throw error;
    }
}

// // Example Usage:
// (async () => {
//     const tradingSymbol = "RELIANCE";
//     const exchange = "NSE";
//     const slTriggerPrice = 2450;  // Stop Loss Trigger Price
//     const slPrice = 2440;         // Stop Loss Execution Price
//     const tgtTriggerPrice = 2550; // Target Trigger Price
//     const tgtPrice = 2560;        // Target Execution Price
//     const quantity = 1;

//     await placeGttOcoOrder(kc, tradingSymbol, exchange, slTriggerPrice, slPrice, tgtTriggerPrice, tgtPrice, quantity);
// })();
