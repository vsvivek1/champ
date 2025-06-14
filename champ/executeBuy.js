// executeBuy.js
import { savePlaceOrder } from './savePlaceOrder.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';

import { getFreezeLimit } from './getFreezeLimit.js';





export async function executeBuy(cis, kite,price) {


cis.entryHealth='inside execute buy'

//console.log(cis.ordered,cis.tradingsymbol)
    // Check if the order has already been placed
    if (cis.ordered) {


       // console.log(cis.ordered,'cis.ordered',cis.tradingsymbol);
        

        return false;
    }

    // Upglobal.date the status to indicate that an order has been placed
    cis.ordered = true;

    // Execute the actual buy order placement
    cis.entryHealth='near place order'
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
async function placeOrder(cis, kite,price1) {

cis.entryHealth='inside place order'
let price=  price1;// Math.floor(price1-cis.minuteCandleMeanRange/4);

   
    ; // Use the last tick price or some other logic to determine the price
    let multiplier = getMultiplier(cis)  // Default multiplier, adjust based on your needs


   // multiplier=calculateLots(30000, cis.lot_size);

  



   let m=global.margins;
   let m2=m.equity.net;

   let liveCash=m.equity.available.live_balance



   //console.log(liveCash,'margin');
   
  
                
 /*        "NIFTY":36,//72,
        
       // "BANKNIFTY":60,
        "BANKNIFTY":30,//,
        'MIDCPNIFTY':20,//,
        "FINNIFTY":20,//40
      }
 */ 





      cis.entryPrice=price;




      let qty=Math.min(cis.lot_size * multiplier,getFreezeLimit(cis.tradingsymbol));


      if(global.instrumentName=='STK'){

       // console.log(m.equity,'margin')

        qty=Math.floor(50000/cis.tick.last_price);
        qty=Math.max(Math.floor(100000/cis.tick.last_price),2);
      }else{

        multiplier=Math.floor(Math.min(liveCash,50000)/(price*cis.lot_size));

        qty=cis.lot_size*20;

       qty =Math.min(cis.lot_size * multiplier,getFreezeLimit(cis.tradingsymbol));
      }


      if(qty==0){

        cis.entryHealth='quantity zero issue and margin is '+liveCash;

        return;
      }
      //qty=cis.lot_size*5;

   /*    if(global.speedSymbols.includes(cis.tradingsymbol)){

        cis.buyStrategy='speedbuying'
qty=250;
      } */



qty=20*cis.lot_size;
    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "BUY",
        order_type: "LIMIT",
        quantity: qty,
        price: price+4,
        //product: "NRML",
        product: "MIS",
        validity: "DAY"
    };


    //return;

if(global.instrumentName=='STK'){
console.log(orderParams)

}


    try {
        const orderId = await kite.placeOrder("regular", orderParams);
cis.entryHealth='inside place order'

cis.message = `Order placed successfully. Order ID: ${orderId}, ${cis.buyStrategy} for ${cis.tradingsymbol} at ${cis.entryPrice}, instrument.averageRange=${cis.averageRange}`;
console.log(cis.message);
       
    
       // const buyOrder = await savePlaceOrder('AAPL', 'breakout', 100, 150, 'fixed target');
        const buyOrder = await savePlaceOrder(cis.tradingsymbol, cis.buyStrategy, qty, price, 'fixed target');



      

    } catch (error) {
        console.error(multiplier,"Error placing order:", error, cis.tradingsymbol,orderParams);

        process.exit();
    }

    if(cis.stockTrade==true) {

        //process.exit()
       };
}
