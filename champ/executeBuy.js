// executeBuy.js
import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';

async function getMargins(kite){

    return await kite.getMargins();

}

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


function calculateLots(amount, lotSize) {
    if (lotSize <= 0) {
        throw new Error("Invalid lot size");
    }

    const numberOfLots = Math.floor(amount / lotSize);
    return numberOfLots;
}

function getMultiplier(cis) {
    let multiplier = 10; // Default multiplier

    let obj = {
        "NIFTY": 36, //72,
        "BANKNIFTY": 30, //60,
        "MIDCPNIFTY": 20, //,
        "FINNIFTY": 20 //40
    };

    if (obj.hasOwnProperty(cis.name)) {
        multiplier = obj[cis.name]; // Use the value from the object if it exists
    }

//return 

    return multiplier;
}
async function placeOrder(cis, kite,price) {

   
    ; // Use the last tick price or some other logic to determine the price
    let multiplier = getMultiplier(cis)  // Default multiplier, adjust based on your needs


   // multiplier=calculateLots(30000, cis.lot_size);

   let m=await getMargins(kite);
   let m2=m.equity.net;
    multiplier=Math.floor(Math.min(m2*.8,50000)/(price*cis.lot_size));
                
 /*        "NIFTY":36,//72,
        
       // "BANKNIFTY":60,
        "BANKNIFTY":30,//,
        'MIDCPNIFTY':20,//,
        "FINNIFTY":20,//40
      }
 */ 


      const buyOrder = await savePlaceOrder('AAPL', 'breakout', 100, 150, 'fixed target');

      cis.entryPrice=price;


      let qty=cis.lot_size * multiplier;
    const orderParams = {
        exchange: "NFO",
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: qty,
        price: price,
        product: "NRML",
        validity: "DAY"
    };




    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        console.log("Order placed successfully. Order ID:", orderId);


        const buyOrder = await savePlaceOrder(cis.tradingsymbol, cis.buyStrategy, qty, price, 'fixed target');




    } catch (error) {
        console.error("Error placing order:", error, cis.tradingsymbol);
    }
}
