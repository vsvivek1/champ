// handleHasPosition.js

import { squareOffBefore9Hrs, squareOffBetween9And12Hrs, squareOffAfter12Hrs } from './stopLossCriterias.js';
import updateOpenOrderPrice from "./updateOrder.js";
import {checkLowerLowsAndLowerHighs} from './checkLowerLowsAndLowerHighs.js';
import {checkLastPriceAgainstPreviousCandles} from './checkLastPriceAgainstPreviousCandles.js'; // Adjust the path based on file location
import checkColorWithFlags from './checkColorWithFlags.js'; // Adjust the path based on file location
import { checkPenultimateGreenAndLastSmallBodyOrLowerHigh } from './checkPenultimateGreenAndLastSmallBodyOrLowerHigh.js';
import { isMakingLowerLows, hasLargeUpperWick, isBearishAt50Sec, isOpenHighAtSpecificSeconds } from './criteriaFunctions.js';  // Import your criteria functions
import {redCandleStartAfterGreenCandles} from './redCandleStartAfterGreenCandles.js'

import { handleStopLossOrTarget } from './handleStopLossOrTarget.js';
import handleShortCoveringOfStocks from './handleShortCoveringOfStocks.js';
import handleLongCoveringOfStocks from './handleLongCoveringOfStocks.js';
import executeSquareOff from './executeSquareOff.js';

import { setTargetForTrade } from './setTargetForTrade.js';

import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './fetchData.js';
//import { colorPatternSquareOff} from './colorPatternSquareOff.js';


export async function handlePositionPresent(cis, kite) {

  
     cis.entryHealth='Inside Has Position'


     if(!cis.saidThat || cis.saidThat==false){

      console.log('from handle has position',cis.tradingsymbol, cis.stopLossPrice,'stop loss price',cis)
        cis.saidThat=true
     }




     if(global.seconds%19==0){
        cis.saidThat=false;

     }

   if(  global.seconds%20==0 && cis.hasPosition && !cis.saidThat){


   let a= global.orders.
   filter(a=>a.instrument_token==cis.instrument_token && a.status=='COMPLETE'  && a.transaction_type=='BUY').sort((a, b) =>
    new Date(b.exchange_update_timestamp) - new Date(a.exchange_update_timestamp)
  );
   
   


   //.sort((a,b)=>)


    if(a[0]){

        console.log(a[0].price,'is a0 buy price',cis.tradingsymbol);
    }


  

        // console.log('from handle has position',cis.tradingsymbol,'stop loss price=', cis.stopLossPrice,cis.stopLossPrice=='nill',

        //     cis.position,
        //     `$ cis.quantity =${cis.position.quantity}`
    
    
        //  )

         cis.saidThat=true;

     }

    

    


     if(cis.stopLossPrice=='nill'){

        cis.stopLossPrice=cis.position//.average_price+3;
     }

    // process.exit();
    
if(cis.inbuiltStopLoss)
     cis.entryHealth='has inbuiltStopLoss:'+cis.inbuiltStopLoss+"@ price "+cis.stopLossPrice+'Now @'+cis.price
else
cis.entryHealth='has inbuiltStopLoss:'+cis.inbuiltStopLoss

//return;
    let squareOff = false;
    if(cis.inbuiltStopLoss ){

if(cis.tick.last_price<=cis.stopLossPrice){


    console.log('executing inbuild stop loss',cis.inbuiltStopLoss,'cis.inbuiltStopLoss');
    executeSquareOff(squareOff, cis, kite);
}
        ///squareoff inbuilty
    
    

        return;
    
    }


    if(global.hours==9){


        if(cis.tick.last_price<cis.tick.ohlc.open) {

    
     
             cis.message='executing squareoff below open in the morning'
        
     
         executeSquareOff(squareOff, cis, kite);
     
        }
     
         return;
     }
     
     if(cis.tick.last_price<cis.tick.ohlc.open && cis.hasPosition){

        console.log('squareoff below open for ',cis.tradingsymbol);
        
    
        squareOff=true;
    
    
    }
    
    
    if(squareOff  && !cis.inbuiltStopLoss     ){
    
    
    
        /// squareofffgeneral
        console.log(cis.inbuiltStopLoss,'cis.inbuiltStopLoss', 'executing normal stop loss');
        
        executeSquareOff(squareOff, cis, kite);
    }
    
    


   // colorPatternSquareOff()


 

    let transactiontype;

    if(cis.position.quantity>0){

        transactiontype='SELL'
    }else{
 transactiontype='BUY'

    }
    
    let target_order = global.orders.find(i => i.tradingsymbol === cis.tradingsymbol && i.status === 'OPEN' 
        
        
        && i.transaction_type == transactiontype
    
    
    );
  

  
    if (!target_order && global.instrumentName=='STK') {






        cis.returnPoints='NO target order',cis.position;

       // console.log('NO target order',cis.position)

        global.placeAutoREverseOrder=true;

        if(cis.position.quantity!=0 && global.placeAutoREverseOrder && !cis.reverseAutoOrderPlaced){

            cis.reverseAutoOrderPlaced=true;

            let transaction_type,targetPrice;

            if(cis.position.quantity>0){

                transaction_type='SELL'

                targetPrice=cis.position.buy_price*1.05

            }else if(cis.position.quantity<0){

  transaction_type='BUY'

  targetPrice=cis.position.sell_price*.95

            }


const orderParams = {
        exchange: cis.exchange,
        tradingsymbol: cis.position.tradingsymbol,
        transaction_type: transaction_type,
        order_type: "LIMIT",
        quantity: Math.abs(cis.position.quantity),
        price: Math.ceil(targetPrice),
       // product: "NRML",
        product: "MIS",
        validity: "DAY",
    };





    //console.log('handle positoon presnet',orderParams)

    //process.exit();

    //console.log(order,'order');
    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        cis.hasPlacedTarget = true;


        let tgtStrategy='orderPrice+1Pc'

        const updatedOrderWithTarget = await setTargetForTrade(cis.tradingsymbol, Math.ceil(targetPrice), tgtStrategy);
       // console.log('Updated Order with Target:', updatedOrderWithTarget,global.clock);


       await fetchOrdersAndSetCis(kite);
       await fetchPositionsAndSetCis(kite);
        console.log("Target order placed successfully. Order ID:", orderId);



    } catch (error) {
        console.error("Error placing target order:", error);
    }


           // process.exit();  /// stop must have a target for all entries and so should have a stop loss
           // return;

        }

       
    }



    // Determine whether to square off the position based on the time of day
    


 
    
    //return; 





    squareOff =   global.hours<13 &&
 (
   
checkLowerLowsAndLowerHighs(cis)
|| 

checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis) /// lst cndle green with (lower highs or very small body)
||
isMakingLowerLows(cis) /// is making lower lows
||
checkLastPriceAgainstPreviousCandles(cis) //last price bewlow low of last three candles
||
checkColorWithFlags(cis) /// if current candle is red after 30 seconds
||redCandleStartAfterGreenCandles(cis) /// red candle start after atleawt 2 grenn candles after 5 sec
); /// no matter what squarewoff on lower lows

 /*    if(squareOff  && cis.minuteData && cis.tick &&
         cis.tick.last_price>cis.minuteData.slice(-1)[0].low
        
        
        ){
////  check later and re write for huge gap downs check later

if(global.seconds%30==0)            console.log('No sq off since signs of recovery',cis.tradingsymbol);

return;
    } */

///temp on oct 30

/* squareOff=false;

if(cis.tick.last_price<cis.tick.open 
    ||redCandleStartAfterGreenCandles(cis)

    || checkLowerLowsAndLowerHighs(cis.minuteData)

    || isMakingLowerLows(cis) 

){

    squareOff=true;
} */
///temp on oct 30]


if(global.instrumentName=='STK'){



    //console.log('has pos  from handle pos  line 220',cis.tradingsymbol,cis.position)

  

   // return;
    if(cis.position.quantity<0){

 
  handleShortCoveringOfStocks(cis,kite)  //empty

    }else if(cis.position.quantity>0){


 handleLongCoveringOfStocks(cis,kite) //empty

    }

    //console.log()



    return;
}




cis.entryHealth='stop loss health cehck'+cis.buyPrice;
//if(global.seconds%20==0 && global.minutes%5==0 && ["NFO","BFO"].includes(cis.exchange))console.log('stop loss health cehck',cis.buyPrice,cis.tradingsymbol);




  


}





