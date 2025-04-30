// orderUtils.js

import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './fetchData.js';

import { calculateVolatility } from './compareVolatility.js';
import { setTargetForTrade } from './setTargetForTrade.js';
import { placeGttOcoOrder } from './placeOCOGTTorder.js';
import instrumentsForMining from '../appv3/public/instruments/instrumentsForMining.json' assert { type: "json" };


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


    let cis1= global.allInstruments.find(a=>a.instrument_token==order.instrument_token);


    if(!cis1){


        console.log('NO cis found in order part 37 order utils')
        return ;
    }

    let name=cis1.name;



    console.log(name,global.instrumentName,'here os the check');

    if(
        
        ! name.includes(global.instrumentName) 
    
    
    ){

        return;
    }
    console.log(order.tradingsymbol.includes(global.instrumentName),'is the instriment');
   // process.exit();
    



    let cis=-1 ;
 try {
        cis = global.allInstruments.    /// filter(inst => inst.name === global.instrumentName).
        
        find(i => i.instrument_token == order.instrument_token);
 } catch (error) {
    

    cis=-1;
    console.log(error,cis,'line 40 order util --ERROR','length',global.instrumentName);
    
 }

 if( !cis || cis==-1)
 {

console.log('order update issue @51 cis  is order utils 51 ',cis,'cis undefined some other script')
   // process.exit()
    return;
 }
  


    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {

        //return;
        cis.sellPrice = order.price;
        cis.noBuy = true;  // Ensure noBuy is initially false

        // Set noBuy to true after 2 seconds
        setTimeout(() => {
            cis.noBuy = false;


            console.log('no buy locl released',cis.tradingsymbol,cis.noBuy)
        }, 1 * 60*  1000);

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


if(cis.shortTrading){


    /// sell is complete check whther its short trading

   // placeShortCovering(cis, order, kite) 
}


    }

    if (
        order.status == 'COMPLETE'   &&
        
        order.transaction_type == 'BUY' ) { 


    //   global.instrumentName=='STK'

        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);



   

        // console.log(cis,order)

        // process.exit();



        let price=order.average_price;
       cis.last_price=price;

       cis.slTriggerPrice=price*.95;

       cis.slPrice=price*.94;


       cis.tgtTriggerPrice=price*1.06;
       cis.tgtPrice=price*1.05;




    //    placeGttOcoOrder(
    //     kite, 
    //     Number(price.toFixed(2)),   // Convert back to number
    //     cis.tradingsymbol, 
    //     cis.exchange,
    //     Number(cis.slTriggerPrice.toFixed(1)),   // Convert back to number
    //     Number(cis.slPrice.toFixed(1)), 
    //     Number(cis.tgtTriggerPrice.toFixed(1)), 
    //     Number(cis.tgtPrice.toFixed(1)), 
    //     order.quantity, 
    //     cis, 
    //     order
    // );


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


let op=order.price;

 


cis.order=order;

    //console.log(global.instrumentName,'placed order line 85',order,'order');
    

    if(!cis){

console.log('No CIS sell reverse orderutils 144');

process.exit();

    }

let tgtStrategy='';
    
let averageRange=cis.averageRange;
   
  //  var targetPrice = order.price + targetPoints;
   // var targetPrice = order.price +averageRange/4  ///2//*2
    //var targetPrice = order.price *1.2  ///2//*2
    var targetPrice = order.price *1.5  ///2//*2
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


   
    // if(cis.colorTrading==true){

    //    // targetPrice=order.sprice+ Math.ceil(order.price*.01);
    //    // targetPrice=order.price   *1.2;//Math.ceil(order.price+1);
    //    // targetPrice=order.price  + averageRange/2//*2;//Math.ceil(order.price+1);
    // }
    


    ////// temp change on oct 30

    //targetPrice = order.price + Math.min(parseFloat(averageRange),2)  ///2
    targetPrice =Math.ceil(order.price + cis.minuteCandleMeanRange*2) ///2  /// some issue here check

    targetPrice =order.price*1.01;

    if(isNaN(targetPrice)){

    console.log('isue in target price ',{targetPrice},{averageRange});
        

       // targetPrice=order.price*1.05

       
    }


    targetPrice=order.price*1.2;
    targetPrice=order.price*1.05;
    targetPrice=order.price*2
    targtStrategy='order+2*averageRange'


    ////// temp change on oct 30


    if(cis.inbuiltTarget){

        targetPrice=cis.targetPrice;
    }

    cis.exitType='target';

    if(global.speedSymbols.includes(cis.tradingsymbol)){

        targetPrice=op+2
    }
    
    targetPrice=order.average_price+cis.averageRange

    if(isNaN(targetPrice)){

        targetPrice=order.average_price+2

    }

    if(global.hours==9 || global.oneAndHalfTarget){

        order.average_price*1.5

    }

    //cis.averageRange==== now undefined pls check
   // console.log(order.average_price,cis.averageRange,'is.averageRange target calculatioon')


let transaction_type='SELL';


    if(global.instrumentName=='STK' ){

if(cis.shortTrading){


    transaction_type='BUY'

    if(global.hours==9){

        targetPrice=
        
        order.average_price*.997
       }else{

        targetPrice=
        
        order.average_price*.999
       }


}else{

     transaction_type='SELL';

     if(global.hours==9){

        targetPrice=
        
        order.average_price*1.03
       }else{

        targetPrice=
        
        order.average_price*1.01
       }
       
}


       
       
        
        
        ;  

    }


    if(isNaN(targetPrice)){



        if(order.quantity<0){


            targetPrice=order.sell_price*.99

        }else if (order.quantity>0){

            targetPrice=order.sell_price*1.2

        }


        console.log('target price issue',cis.tradingsymbol,cis.order,'order',order)
      
    }


    targetPrice=order.sell_price*1.2

   if(cis.inbuiltTarget ) targetPrice=cis.targetPrice;

   if(isNaN(cis.targetPrice)){
    targetPrice=cis.buyPrice*1.2


    cis.error='inbuilt target order price issue '
    //console.log('',cis.tradingsymbol,cis.order,'order',order)
   }
    //targetPrice=op+cis.averageRange/2


    cis.targetPrice=order.price+5;
    cis.stopLossPrice=order.price-5;

    
    const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: order.tradingsymbol,
        transaction_type: transaction_type,
        order_type: "LIMIT",
        quantity: order.quantity,
        price: Math.ceil(targetPrice),
       // product: "NRML",
        product: "MIS",
        validity: "DAY",
    };



    //console.log(order,'order');
    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;


        const updatedOrderWithTarget = await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), tgtStrategy);
       // console.log('Updated Order with Target:', updatedOrderWithTarget,global.clock);
        console.log("Target order placed successfully. Order ID:", orderId);
    } catch (error) {

       

        console.log(cis)
        console.error("Error placing target order:", error);

        process.exit()
    }
}



async function placeShortCovering(cis, order, kite) {


 let  targetPrice;
    
        if(global.instrumentName=='STK' ){
    
           if(global.hours==9){
    
            targetPrice=
            
            order.average_price*.997
           }else{
    
            targetPrice=
            
            order.average_price*99
           }
           
           
            
            
            ;  
    
        }
    
    
        //targetPrice=op+cis.averageRange/2
        const orderParams = {
            exchange: cis.exchange,
            tradingsymbol: order.tradingsymbol,
            transaction_type: "BUY",
            order_type: "LIMIT",
            quantity: order.quantity,
            price: Math.floor(targetPrice),
           // product: "NRML",
            product: "MIS",
            validity: "DAY",
        };
    
    
    
        //console.log(order,'order');
        try {
            const orderId = await kite.placeOrder("regular", orderParams);
            cis.hasPlacedTarget = true;
    
    
            cis.shortTrading=false;
            const updatedOrderWithTarget = await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), tgtStrategy);
           // console.log('Updated Order with Target:', updatedOrderWithTarget,global.clock);
            console.log("short covering placed order placed successfully. Order ID:", orderId);
        } catch (error) {
            console.error("Error placing target order:", error);
        }
    }
    