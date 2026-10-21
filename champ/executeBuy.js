// executeBuy.js
import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';

import { getFreezeLimit } from './getFreezeLimit.js';

import { logNewEntry } from './logNewEntry.js';
import { sendBuySignalEmail } from './emailAlerts.js';



export async function executeBuy(cis, kite,price) {

    // if(cis.name!== global.instrumentName) {
    //     console.log('executeBuy: Instrument name mismatch:', cis.name, '!=', global.instrumentName);
    //     return;
    // }


cis.entryHealth='inside execute buy'

//console.log(cis.ordered,cis.tradingsymbol,'inside execute buy')
    // Check if the order has already been placed


    // Upglobal.date the status to indicate that an order has been placed
    cis.ordered = true;

    // Execute the actual buy order placement
    cis.entryHealth='near place order'
    await placeOrder(cis, kite,price);
}


async function placeOrder(cis, kite,price1) {

cis.entryHealth='inside place order'
//console.log(cis.tradingsymbol,'place order',price1)
let price=  price1;// Math.floor(price1-cis.minuteCandleMeanRange/4);

   let liveCash=global.margins.equity.available.live_balance

   // Risk-based sizing: qty is derived from how far the protective stop is,
   // not from how much capital is available. Two trades with different stop
   // distances should never end up with the same position size.
   const riskPct = global.riskPerTradePct || 0.01;
   const riskAmount = riskPct * liveCash;

   const stopDistance = (cis.liveMinute && cis.liveMinute.range > 0)
     ? cis.liveMinute.range
     : price * 0.05; // fallback if the live candle range isn't available yet

   const numberOfLots = Math.floor(riskAmount / (stopDistance * cis.lot_size));

   let qty = Math.min(numberOfLots * cis.lot_size, getFreezeLimit(cis.tradingsymbol));

      cis.entryPrice=price;
      cis.riskAmount = riskAmount;
      cis.stopDistanceUsedForSizing = stopDistance;

console.log(`Risk-based sizing for ${cis.tradingsymbol}: risk=${riskAmount.toFixed(0)}, stopDistance=${stopDistance}, lots=${numberOfLots}, qty=${qty}`);

if(qty<=0){
    // Risking less than one lot at this stop distance would mean trading
    // beyond the risk budget -- skip rather than force a minimum-lot trade.
    cis.entryHealth=`Risk-sized qty is 0 (risk=${riskAmount.toFixed(0)}, stopDistance=${stopDistance}, lot_size=${cis.lot_size}) - skipping trade`;
    cis.ordered = false;
    console.log(cis.entryHealth, cis.tradingsymbol);
    return;
}


    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: qty,
        price: cis.tick.last_price,
        //product: "NRML",
        product: "NRML",
        validity: "DAY"
    };


    //return;

// if(global.instrumentName=='STK'){
// console.log(orderParams)

// }


    try {

        if(cis.placedOrder==true){

            cis.returnPoints=`Order already placed for ${cis.tradingsymbol}, not placing again. Order ID: ${cis.orderId}, Price: ${price}, Quantity: ${qty}`;
           // console.log(cis.returnPoints);

           // console.log('Order already placed for',cis.tradingsymbol,'not placing again');

            return;
        }



logNewEntry({
  cis,
  qty,
  price,
  global
});
                   const orderId = await kite.placeOrder("regular", orderParams);
sendBuySignalEmail(cis, qty, price);
cis.entryHealth='inside place order'

cis.message = `${global.clock} Order placed successfully. Order ID: ${orderId}, ${cis.buyStrategy} for ${cis.tradingsymbol} at ${cis.entryPrice}, instrument.averageRange=${cis.averageRange},ordered=${cis.ordered},qty=${qty},price=${price}



`;


//console.log(cis.message);

cis.ordered=true;
cis.placedOrder=true;


       // const buyOrder = await savePlaceOrder('AAPL', 'breakout', 100, 150, 'fixed target');
        const buyOrder = await savePlaceOrder(cis.tradingsymbol, cis.buyStrategy, qty, price, 'fixed target');





    } catch (error) {
        console.error("Error placing order:", error, cis.tradingsymbol,orderParams);

        process.exit();
    }

    if(cis.stockTrade==true) {

        //process.exit()
       };
}
