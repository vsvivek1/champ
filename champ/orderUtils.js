// orderUtils.js

import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './fetchData.js';

import { calculateVolatility } from './compareVolatility.js';
import { setTargetForTrade } from './setTargetForTrade.js';


export async function updateOpenOrderPrice(kite, order_id, instrument_token, last_price) {
    const updatedPrice = last_price; // Modify as per your logic

    try {
        const orderParams = {
            order_id: order_id,
            price: updatedPrice,
            // Additional parameters as required
        };

        await kite.modifyOrder("regular", orderParams);
        console.log(`Order ${order_id} updated successfully to price ${updatedPrice}`);
    } catch (error) {
        console.error(`Error updating order ${order_id}:`, error);
    }
}

export async function handleOrderUpdates(order, kite) {

    //console.log(order.tradingsymbol.includes(global.instrumentName));

   // process.exit();
    



    let cis=-1 ;
 try {
        cis = global.instrumentsForMining. filter(inst => inst.name === global.instrumentName).
        
        find(i => i.instrument_token == order.instrument_token);
 } catch (error) {
    

    cis=-1;
    console.log(error,cis,'line 40 order util --ERROR','length',global.instrumentName);
    
 }

 if(cis==-1) return;
   // global.instrumentsForMining
    if (!cis) return;

    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
        cis.sellPrice = order.price;
        cis.noBuy = true;  // Ensure noBuy is initially false

        // Set noBuy to true after 2 seconds
        setTimeout(() => {
            cis.noBuy = false;


            console.log('no buy locl released',cis.tradingsymbol,cis.noBuy)
        }, 2 * 60*  1000);

        /* let dt = new Date();
        cis.noBuyTime = dt.getTime() + (1 * 60 * 1000); */

        cis.lastSeenHigh = 0;
        cis.lastSeenHighForPosition = 0;
        cis.ordered = false;
        cis.hasLivePosition = false;
        cis.updated = false;
        cis.placedTarget = false;
        cis.hasPlacedTarget = false;
        cis.updated = false;
        cis.highestProfit = 0;

        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        placeTargetOrder(cis, order, kite);
    }

    if (order.status == 'REJECTED' && order.transaction_type == 'BUY') {
        //await fetchOrdersAndSetCis(kite);
       //// await fetchPositionsAndSetCis(kite);
        //placeTargetOrder(cis, order, kite);


        let temp=cis;
        setTimeout(()=>{
          
temp.ordered=false;
        },30*1000)
       // cis.ordered=false;
    }
}


async function placeTargetOrder(cis, order, kite) {

    console.log(global.instrumentName,'placed order line 85');
    

    if(!cis){

console.log('No CIS sell reverse');

    }

let tgtStrategy='';
    
    const lastFiveCandles = cis.minuteData//.slice(-5);
    const lastFiveVolatility = calculateVolatility(lastFiveCandles);

    let averageRange=calculateVolatility(lastFiveCandles);
    const targetPoints = 5; // Adjust target points as needed
   
  //  var targetPrice = order.price + targetPoints;
   // var targetPrice = order.price +averageRange/4  ///2//*2
    //var targetPrice = order.price *1.2  ///2//*2
    var targetPrice = order.price *1.2  ///2//*2
    let targtStrategy='order*1.2'
   if(global.hours==9){

    //targetPrice=order.price+averageRange/4
   // targetPrice=order.price *1.2
    targetPrice=order.price +1.1

   }
   else if(global.hours==10){

    var targetPrice = order.price +averageRange/2

    targtStrategy='order+averageRange/2'
   // var targetPrice = order.price +averageRange/4
   }

   else if(global.hours>10 && global.hours<14 ){

    var targetPrice = order.price +averageRange/2

    targtStrategy='order+averageRange/2'
   }else if(global.hours>=14 ){

    var targetPrice = order.price +averageRange/2

    targtStrategy='order+averageRange/2'
   }
   
    if(cis.colorTrading==true){

       // targetPrice=order.sprice+ Math.ceil(order.price*.01);
       // targetPrice=order.price   *1.2;//Math.ceil(order.price+1);
       // targetPrice=order.price  + averageRange/2//*2;//Math.ceil(order.price+1);
    }
    


    ////// temp change on oct 30

    targetPrice = order.price + Math.min(parseFloat(averageRange/2),2)  ///2

    

    if(isNaN(targetPrice)){

    console.log('isue in target price ',{targetPrice},{averageRange});
        

        targetPrice=order.price*1.05

       
    }

    targtStrategy='order+2*averageRange'


    ////// temp change on oct 30


    if(cis.inbuiltTarget){

        targetPrice=cis.targetPrice;
    }

    cis.exitType='target';
    const orderParams = {
        exchange: "NFO",
        tradingsymbol: order.tradingsymbol,
        transaction_type: "SELL",
        order_type: "LIMIT",
        quantity: order.quantity,
        price: Math.ceil(targetPrice),
        product: "NRML",
        validity: "DAY",
    };



    console.log(order,'order');
    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;


        const updatedOrderWithTarget = await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), tgtStrategy);
        console.log('Updated Order with Target:', updatedOrderWithTarget,global.clock);
        console.log("Target order placed successfully. Order ID:", orderId);
    } catch (error) {
        console.error("Error placing target order:", error);
    }
}
