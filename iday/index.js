// Import necessary modules at the top
import { connectToDatabase } from '../connectToDatabase.js';
import { KiteTicker } from 'kiteconnect';
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';
import moment from 'moment';
import instruAll from '../appv3/shared/instruments/instrumentsForMining.json' assert { type: "json" };
import { detectBuySignal } from './candleStickSignals.js';
import upglobal.dateOpenOrderPrice from "./upglobal.dateOrder.js";
import terminalLink from 'terminal-link';
import chalk from 'chalk';
import open from 'open';
import notifyWithSound from  './notifier.js'
//import { createSocketServer } from './socketServer.js'; // Adjust the path as necessary
//import express from 'express'

//import a from './socketServer.js'


/* a(); */




import io from 'socket.io-client';
const socket = io('http://localhost:4000');

console.log('a above');



var msg=[];
// Connect to database
let con = connectToDatabase();
let targetPoint=1.15

// Initialize variables for historical data
let hourlyHistoricalData = {};
let minuteHistoricalData = {};

let dayPositions=[];
let orders=[];

// Initialize variable for KiteConnect instance
let kite;

// Initialize ticker variable
let ticker;

let global.date,day,global.hours,global.minutes,global.seconds;
global.date=new Date();
day=global.date.getDay();
global.hours=global.date.hours();
global.minutes=global.date.minutes();
global.seconds=global.date.seconds();

//let text=fs.readFileSync('./last_time.text');
//console.log(text);

 //process.exit();


// Function to initialize KiteConnect instance and fetch data


async function main() {
    try {

        const accessTokenDoc = await getTodaysAccessToken();
        /* console.log('Access Token:', accessTokenDoc); */

       

        // Initialize KiteConnect instance
        kite = await getKiteConnectInstance();
       

setInterval(async ()=>{
global.date=new Date();
day=global.date.getDay();
global.hours=global.date.hours();
global.minutes=global.date.minutes();
global.seconds=global.date.seconds();


if(global.minutes%5==0 && global.seconds==10){

    fetchHourlyData();
}

if(global.seconds==1){
    await fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();
    await fetchMinuteData();
}

},1000)

        // Get today's access token
        
       // console.log('Kite Instance:', kite);

        // Initialize ticker instance
        
        initTicker();

        // Call functions to fetch historical data

     await fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();

        await fetchHourlyData();
        

       // console.log('here',kite)
     
        
        

      //  return;
        await fetchMinuteData();



        // Schedule minute data fetch every second
       // setInterval(fetchMinuteData, 500);

        // Schedule hourly data fetch at :15th minute
        scheduleHourlyDataFetch();
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

let lastPrice = null; // To store the last price of the previous tick
let lowerLowsCount = 0; // Counter for consecutive lower lows

function isMakingLowerLows(tick, cis) {
    if (lastPrice === null) {
        // Initialize the last price on the first tick
        lastPrice = tick.last_price;
        return false; // Not enough data to determine lower lows
    }

    // Check if the current tick's last_price is lower than both lastSeenHigh and lastPrice
    const isLowerLow = tick.last_price < cis.lastSeenHigh && tick.last_price < lastPrice;
    
    // Upglobal.date the counter based on the condition
    lowerLowsCount = isLowerLow ? lowerLowsCount + 1 : 0;

    // Upglobal.date lastPrice for the next comparison
    lastPrice = tick.last_price;

    // Return true if we have at least 3 consecutive lower lows
    return lowerLowsCount >= 3;
}


async function fetchPositionsAndSetCis(){
    const positions = await kite.getPositions();
    const positionsDay=positions.day;
   
   
    instruAll.forEach(instrument => {


        const matchingPosition = positionsDay.find(pos => pos.tradingsymbol === instrument.tradingsymbol 


            && pos.quantity!=0
        );

        if (matchingPosition) {
            instrument.position = matchingPosition
            instrument.hasLivePosition =true;


            instrument.buyPrice=matchingPosition.average_price;

        } else {
            instrument.position = null
            instrument.hasLivePosition =false;
        }
    });


}
async function fetchOrdersAndSetCis() {
    try {
        // Fetch orders
         orders = await kite.getOrders();


        // process.exit()

        // Iterate over instruAll and set orderStatus, orderT, and hasLiveOrder
        instruAll.forEach(instrument => {
            const matchingOrder = orders.find(order => order.instrument_token === instrument.instrument_token);
            if (matchingOrder) {
                instrument.orderStatus = matchingOrder.status;
                instrument.orderT = matchingOrder.order_id;
                instrument.hasLiveOrder = matchingOrder.status === "OPEN";

                ///instrument.buyPrice=
            } else {
                instrument.orderStatus = null;
                instrument.orderT = null;
                instrument.hasLiveOrder = false;
            }
        });

        // Log the result
       
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

// Function to initialize KiteTicker instance
function initTicker() {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    // Connect to ticker
    ticker.disconnect;//()
    ticker.connect();
    ticker.on("connect", subscribe);

    // Subscribe to ticks and set tick mode
    ticker.on("ticks", onTicks);
   
    ticker.on("order_upglobal.date", orderupdates);
}

// Function to handle ticks from ticker
function onTicks(ticks) {
    // Handle incoming ticks data here

    extractTicks(ticks)
    
    // Add your logic to process ticks data as needed
}

function extractTicks(ticks){

    for(var i=0;i<ticks.length;i++){

        processTicks(ticks[i]);

    }

}

function processTicks(tick){

   

/* if(global.date.seconds()%3!=0){

    return;
} */



    var cis=instruAll.find(i=>i.instrument_token==tick.instrument_token)

    cis.returns=[];

    cis.location={}
    if(!cis.liveMinute)  cis.liveMinute={};
    if(global.seconds==1 ){

       

        

        cis.liveMinute.open=tick.last_price;  
        cis.liveMinute.high=tick.last_price;
    }



  
    cis.liveMinute.high=cis.liveMinute.high<tick.last_price?tick.last_price:cis.liveMinute.high;

    cis.liveMinute.body=Math.abs(cis.liveMinute.open-tick.last_price);
   
    cis.liveMinute.upperShadow=cis.liveMinute.high-Math.max(cis.liveMinute.open,tick.last_price);
    //cis.liveMinute.lowerShadow=cis.liveMinute.high-Math.max(cis.liveMinute.open,tick.last_price);
    
    cis.liveMinute.hasLongUpperShadow=cis.liveMinute.body<cis.liveMinute.upperShadow/2
    cis.liveMinute.last_price=tick.last_price;

    

    cis.tick=tick;
    if(!cis) {
        
        cis.returns.push('NO CIS')
        return ;
    }

    var hasPosition=cis.hasLivePosition
    

    if(hasPosition){


        if(typeof cis.lastSeenHigh!='undefined'){
            if(cis.lastSeenHighT1==undefined) cis.lastSeenHighT1
            if(cis.lastSeenHigh)
         if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')   console.log('last seen high',cis.lastSeenHigh,cis.tradingsymbol,"LP:",cis.tick.last_price ,"BP:",cis.buyPrice,'prof:',(cis.tick_size.last_price-cis.buyPrice)*cis.lot_size);

        }
        
        handlePositionPresent(cis)

    }else{
        
        //cis.location.reachedNoPos=true;

        if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('handle no position b4',cis.tradingsymbol)
        handleNoPosition(cis)
    }
    
    socket.emit('sendCis',cis); 
    


    

  


}
async function squareOffAfter13Hrs(cis, orders, global.date) {

    if(cis.minuteData){
        pv0=cis.minuteData[cis.minuteData.length-1]
        pv1=cis.minuteData[cis.minuteData.length-2]
   
   
   }else{

    console.log('some issue in 411',cis.tradingsymbol);
    
   }
    let squareOff = false;

    // Assume highestPointAfter12PM is an async function that returns highAfter12
    let highAfter12 = await highestPointAfter12PM(cis.minuteData);

    switch (true) {
        case (cis.lastSeenHigh > cis.buyPrice + 13 && cis.tick.last_price < cis.lastSeenHigh - 3):
            squareOff = true;
            cis.msg = `profit booking`;
            console.log(cis.msg);
            break;

        case (isMakingLowerLows(cis.tick, cis) && cis.tick.last_price > cis.buyPrice + 2):
            squareOff = true;
            cis.msg = `lower ticks `;
            console.log(cis.msg);
            break;

        case (cis.tick.last_price < cis.stoploss):
            squareOff = true;
            cis.msg = `candle low stop loss triggered`;
            console.log(cis.msg);
            break;

        case (cis.minuteData && pv0.close < pv1.close && pv0.high < pv1.high && pv0.low < pv1.low):
            squareOff = true;
            cis.msg = `Lower lows (${pv0.close},${pv1.close} ) and Lower Highs for ${cis.tradingsymbol}`;
            console.log(cis.msg);
            break;

        case (cis.position.buy_price - 2 * cis.minuteCandleMedianRange > cis.tick.last_price):
            squareOff = true;
            cis.msg = `last tick below 2 candles  ${cis.position.buy_price - 2 * cis.minuteCandleMedianRange} is less than ${cis.tick.last_price}`;
            console.log(cis.msg);
            break;

        case (cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.low && !cis.upglobal.dated):
            squareOff = true;
            console.log(`Danger ${cis.tradingsymbol} is below live candle low @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`);
            cis.msg = `Danger ${cis.tradingsymbol} is below live candle low @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`;
            break;

        case (
            cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.high * 0.8 &&
            !cis.upglobal.dated 
          
        ):
            squareOff = false;
            console.log(`Danger ${cis.tradingsymbol} is below half of live hour sq off @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`);
            break;

        case (cis.tick.last_price < highAfter12 && !cis.upglobal.dated):
            squareOff = true;
            console.log(`last price less than high after 12 for ${cis.tradingsymbol}`);
            cis.message = `last price less than high after 12 for ${cis.tradingsymbol}`;
            break;

        case (cis.tick.last_price < cis.hourlyHigh && !cis.upglobal.dated && global.date.hours() != 9):
            squareOff = false;
            cis.message = `last price less than hourly high ${cis.tradingsymbol}`;
            break;
    }

    return squareOff;
}


function squareOffBefore13Hrs(cis, orders, global.date) {
    let   pv0;
    let pv1
    if(cis.minuteData){
      pv0=cis.minuteData[cis.minuteData.length-1]
    pv1=cis.minuteData[cis.minuteData.length-2]
   
   
   }else{

    console.log('some issue in 411',cis.tradingsymbol);
    
   }
    let squareOff = false;

    switch (true) {
        case (cis.lastSeenHigh > cis.buyPrice + 13 && cis.tick.last_price < cis.lastSeenHigh - 3):
            squareOff = true;
            cis.msg = `profit booking`;
            console.log(cis.msg);
            break;

        case (isMakingLowerLows(cis.tick, cis) && cis.tick.last_price > cis.buyPrice + 2):
            squareOff = true;
            cis.msg = `lower ticks `;
            console.log(cis.msg);
            break;

        case (cis.tick.last_price < cis.stoploss):
            squareOff = true;
            cis.msg = `candle low stop loss triggered`;
            console.log(cis.msg);
            break;

        case (pv0 && pv1 && cis.minuteData && pv0.close < pv1.close && pv0.high < pv1.high && pv0.low < pv1.low):
            squareOff = true;
            cis.msg = `Lower lows (${pv0.close},${pv1.close} ) and Lower Highs for ${cis.tradingsymbol}`;
            console.log(cis.msg);
            break;

        case (cis.position.buy_price - 2 * cis.minuteCandleMedianRange > cis.tick.last_price):
            squareOff = true;
            cis.msg = `last tick below 2 candles  ${cis.position.buy_price - 2 * cis.minuteCandleMedianRange} is less than ${cis.tick.last_price}`;
            console.log(cis.msg);
            break;

        case (cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.low && !cis.upglobal.dated && !(cis.belowOpenTrade == 'false' || typeof cis.belowOpenTrade == 'undefined')):
            squareOff = true;
            console.log(`Danger ${cis.tradingsymbol} is below live candle low @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`);
            cis.msg = `Danger ${cis.tradingsymbol} is below live candle low @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`;
            break;

        case (
            cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.high * 0.8 &&
            !cis.upglobal.dated && !(cis.belowOpenTrade == 'false' || typeof cis.belowOpenTrade == 'undefined') &&
            (cis.entryBelowHourlyCandle == undefined || cis.entryBelowHourlyCandle == false)
        ):
            squareOff = false;
            console.log(`Danger ${cis.tradingsymbol} is below half of live hour sq off @ ${cis.tick.last_price}, order id is ${orders.find(o => o.tradingsymbol == cis.tradingsymbol).order_id}`);
            break;

        case (cis.tick.last_price < cis.tick.ohlc.open && !cis.upglobal.dated && (!cis.belowOpenTrade)):
            squareOff = true;
            console.log(`last price less than open for ${cis.tradingsymbol}`);
            cis.message = `last price less than open for ${cis.tradingsymbol}`;
            break;

        case (cis.tick.last_price < cis.hourlyHigh && !cis.upglobal.dated && global.date.hours() != 9 && (!cis.belowOpenTrade)):
            squareOff = false;
            cis.message = `last price less than hourly high ${cis.tradingsymbol}`;
            break;
    }

    return squareOff;
}


function handlePositionPresent(cis){

   let squareOff=false;
cis.lastSeenHighForPosition=cis.tick.last_price>cis.lastSeenHighForPosition?cis.tick.last_price:cis.lastSeenHighForPosition;

cis.lastSeenHigh=cis.tick.last_price>cis.lastSeenHigh?cis.tick.last_price:cis.lastSeenHigh;

let prof=cis.lot_size*cis.tick.last_price;
cis.highestProfit=prof>cis.highestProfit?prof:cis.highestProfit;
/// checkForTargetOrder

let target_order=orders.
find((i)=>i.tradingsymbol==cis.tradingsymbol && 
i.status=='OPEN' && i.transaction_type=='SELL'
);



if(!target_order){
    cis.returns.push('NO target order')
    return;
}
//console.log(target_order,'to');


// else  placetargetOrder//

if(!target_order && cis.hasLivePosition && (!cis.hasPlacedTarget)){

    console.log('is there a live postion without target?',cis.tradingsymbol,cis.hasLiveOrder,cis.hasLivePosition,cis.hasPlacedOrder,cis.hasBuySignal);
    mag('is there a live postion without target?',cis.tradingsymbol,cis.hasLiveOrder,cis.hasLivePosition,cis.hasPlacedOrder,cis.hasBuySignal);
    

  //process.exit();
  
//placeTargetOrderForScript(cis);
cis.hasPlacedTarget=true

cis.returns.push('No live position')
    return false;
}




 if(cis.liveHourCandle)  {

    let x=chalk.blue(`last price,${cis.tick.last_price}, hourly high ${cis.liveHourCandle.high} for ${cis.tradingsymbol}`)
   // console.log(x);
    
 }




if(cis.buyPrice<cis.tick.ohlc.open){
    cis.belowOpenTrade=true;


    cis.message=
    `'below open trade manual ',cis.tradingsymbol,'cis.buyPrice:',${cis.buyPrice},'cis.tick.ohlc.open:',${cis.tick.ohlc.open}`;
    
    
    //msgx('below open trade manual ',cis.tradingsymbol,'cis.buyPrice:',cis.buyPrice,'cis.tick.ohlc.open:',cis.tick.ohlc.open);



    cis.returns.push('Position below open')
    return;
    

}

let pv0=0;
let pv1=0
if(cis.minuteData){
     pv0=cis.minuteData[cis.minuteData.length-1]
     pv1=cis.minuteData[cis.minuteData.length-2]


}






//console.log(cis.highestProfit,'cis.highestProfit',cis.tradingsymbol);


cis.msg='Reached SL switch';


if(global.hours<=12){

    squareOff=squareOffBefore13Hrs(cis, orders, global.date);
}else{

squareOff=squareOffAfter13Hrs(cis, orders, global.date)

}




    if(squareOff){
//console.log('after sq off');

        if(!cis.upglobal.dated){

            //console.log('danger ',orders)
        
            if(orders.length!=0){
        
               let order= orders.find(o=>o.tradingsymbol==cis.tradingsymbol && o.status=='OPEN')

               if(order){

                let order_id=order.order_id;
                upglobal.dateOpenOrderPrice(kite,order_id, cis.instrument_token, cis.tick.last_price);
                cis.upglobal.dated=true;
               }
                
        
            }
          
        
        }
    }

}

async function placeTargetOrderForScript(cis){
    await  fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();
    

    if(cis.placedTarget){
        cis.returns.push('CIS placeed target')
return;
    }
    

    cis.placedTarget=true;

    if(!cis.position){

        console.log(chalk.blue('positon not found in order updates'));
       //msgx(chalk.blue('positon not found in order updates'));
        return
    }
    const orderParams = {
        exchange: "NFO", // or other exchanges as per requirement
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "SELL", // or "SELL"
        order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
        quantity: cis.position.quantity, // specify the quantity
       price: Math.ceil(cis.position.buy_price*targetPoint),
       // price: Math.ceil(cis.position.buy_price+5),
        product: "NRML", // or "CNC", "NRML"
        validity: "DAY", // or "IOC"
    };
    
    try {

        console.log('order price',Math.ceil(cis.position.buy_price)+ targetPoint);
     mag('order price',Math.ceil(cis.position.buy_price)+ targetPoint);
        

        const orderId = await kite.placeOrder("regular", orderParams);
        console.log("Order placed successfully. Order ID:", orderId);
        //msgx("Order placed successfully. Order ID:", orderId);
        //cis.ordered=false;
      //  cis.hasLivePosition=false;
    } catch (error) {
        console.log(orderParams );
        console.error("Error placing order:", error);
        
        
    }


}

function isBodyIncreasing(ohlcData, cis) {
    if (!ohlcData || ohlcData.length < 3) {

        cis.returns.push('ohlc data less @569')
   // console.log('Not enough data. Need at least 3 candles. is body incfreasing ',ohlcData);
    return;
    }

    //console.log(ohlcData);
    
    // Extract the last three candles
    const last3Candles = ohlcData.slice(-3);

    // Calculate the body (absolute value of close - open) of each of the last three candles
    const bodies = last3Candles.map(candle => Math.abs(candle.close - candle.open));

    // Check if the body of the last three candles is increasing
    const bodiesIncreasing = bodies[0] < bodies[1] && bodies[1] < bodies[2];

    if (bodiesIncreasing) {
        // Set targets and stop loss
        const totalBodiesHeight = bodies.reduce((a, b) => a + b, 0);
        const highOfLastCandle = Math.max(last3Candles[2].close, last3Candles[2].open);
        cis.target = highOfLastCandle + totalBodiesHeight;

        const lowOfLastThreeCandles = Math.min(...last3Candles.map(candle => candle.low));
        cis.stopLoss = lowOfLastThreeCandles;
    }

    return bodiesIncreasing;
}

function isCloseOf3AboveEachOther(ohlcData, cis) {
    if (!ohlcData || ohlcData.length < 3) {


        return;
        throw new Error('Not enough data. Need at least 3 candles.');
    }

    // Extract the last three candles
    const last3Candles = ohlcData.slice(-3);

    // Check if the closing prices of the last three candles are increasing
    const closesIncreasing = last3Candles[0].close < last3Candles[1].close && last3Candles[1].close < last3Candles[2].close;

    if (closesIncreasing) {
        // Set targets and stop loss
        const highOfLastCandle = Math.max(last3Candles[2].close, last3Candles[2].open);
        const totalBodiesHeight = last3Candles.reduce((sum, candle) => sum + Math.abs(candle.close - candle.open), 0);
        cis.target = highOfLastCandle + totalBodiesHeight;

        const lowOfLastThreeCandles = Math.min(...last3Candles.map(candle => candle.low));
        cis.stopLoss = lowOfLastThreeCandles;
    }

    return closesIncreasing;
}
function handleNoPosition(cis){

    let proceedToTrade=false;
    if(!cis.minuteData){

        return;
    }
    

    if(cis.noBuy &&  cis.noBuyTime && global.date<cis.noBuyTime ){


        cis.message ='NO RE -ENTRY COLLING TIME TILL ' +cis.noBuyTime ;
if(global.seconds==15){

    if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')   console.log('NO RE -ENTRY COLLING TIME FOR ',cis.tradingsymbol,'till',cis.noBuyTime ,cis.noBuyTime)

}


       cis.returns.push('No re entry time till'+cis.noBuyTime,cis.tradingsymbol )
        return;
    }
    
    if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('after no buy cis handleNo pos',cis.tradingsymbol)

    if( (cis.tick.last_price>=cis.tick.ohlc.open && global.hours<=12) ){

        proceedToTrade=true;
        if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('hrs less than 12 and tick less than open return',cis.tradingsymbol)
        ///no buy below open in the moring session 
            cis.location.ohlcBewlowcheck=false;
            cis.returns.push('LTP less than open')
            //return false;
          }
 

         
          let h2= highestPointAfter12PM(cis.minuteData);

        

        
          if( (cis.tick.last_price>h2 && global.hours>12) ){
            if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('hrs lgreater   h2 and tick less tha h2 return',cis.tradingsymbol)
       
       
                cis.afterNoonTrade=true;
                proceedToTrade=true;
          ///no buy below open in the moring session 
              cis.location.ohlcBewlowcheck=true;
              cis.returns.push('LTP less than open')
             // return false;
            }
            
          

  

   cis.msg='Handle No pos';

  







  cis.location.ohlcBewlowcheck=true

  
  if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('763',cis.tradingsymbol)




//if(global.seconds<30) return;
if(cis.liveMinute.hasLongUpperShadow){

cis.message='Live minute has long upper shadow\nNot Entering'
//console.log('liveMinuteHAsLargeUpper shadow no Entry',cis.tradingsymbol);
//return;
;

   }

   if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('778',cis.tradingsymbol)

/* else{
    //console.log('cis is ok',cis.tradingsymbol);
    
} */

    let pv1=cis.minuteData[cis.minuteData.length-1];
    let pv2=cis.minuteData[cis.minuteData.length-2];
 
    if(proceedToTrade){
    //if(pv1.close>pv2.high){
        if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('b4 execute buy',cis.tradingsymbol)
        //cis.ordered=true;
  if(pv1)   cis.target=pv1.close+4;
     cis.message
     executeBuy(cis);
     return;
    }

    if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')    console.log('803',cis.tradingsymbol,pv1.close,pv1.high)





  



if(
  
    
    cis.minuteData && isLastPriceAboveMaxOfPrev15(cis.minuteData,cis) 
    
    
    
    
    )

{

cis.msg='max 15 cnadle ';
    cis.belowOpenTrade=true

    cis.message='15 min high entry for'+cis.tradingsymbol
//console.log('15 min high entry for',cis.tradingsymbol)
//msgx('15 min high entry for',cis.tradingsymbol)
  
var x=isTickAboveHourlyHistoricalValueChkFn(cis);

console.log('reached 834',x,cis.highestPointAfter12PM,cis.tick.last_price,cis.tradingsymbol);

if(x){
    executeBuy(cis)
    cis.returns.push('after exe buy')
    return;

}

}

   // console.log(cis.tradingsymbol);
    if(cis.tick.last_price>cis.tick.ohlc.open){

        cis.msg='handle Tick above Open ';
        handleTickAboveOpen(cis)
        //console.log(cis.tradingsymbol);
      

    }

   
}
async function handleTickAboveOpen(cis){
    

    ///if current tick has long upper wick dont buy

   /*  if(global.seconds<55){

       // return;
    } */

  var x=isTickAboveHourlyHistoricalValueChkFn(cis)



 


  if(x){

    
    
    cis.msg='tick above Hrly';



    




    if(cis.last_candle){
        //cis.last_candle=last_candle;
        
      let ti=  convertToIndianTime(cis.last_candle.global.date)
      cis.lastCandleTime=ti
       

      const hasBuySignal = detectBuySignal(cis);


         
  

      cis.msg='has Buy signal'+hasBuySignal;

      //console.log('above historic',x,cis.tradingsymbol,{hasBuySignal});


     // console.log(hasBuySignal,'hasBuySignal',cis.tradingsymbol,cis.ordered);

      if(hasBuySignal &&  (!cis.ordered)  
        
      

       // && (cis.tick.last_price>cis.liveHourCandle)



   




        






        ) /// added new condtion only if it breaks last candle high
    
    
     {
//debugger;

cis.belowOpenTrade=false;
executeBuy(cis)

      }

      //console.log(cis.tradingsymbol, ti)

    }
   

    
  

}




}

function highestPointAfter12PM(ohlcData) {
    if (!ohlcData || ohlcData.length < 225) {
        return -1
    } else {
        // Strip the first 225 entries

       
        
        let strippedData = ohlcData.slice(225);

        // Find the highest "High" value in the remaining data
        let highestPoint = Math.max(...strippedData.map(entry => entry.high));

        return highestPoint;
    }
   // return highestPoint;
}

function findMeanRange(ohlcData) {
    // Step 1: Calculate the sum of ranges for each candle (high - low)
    const totalRange = ohlcData.reduce((sum, data) => sum + (data.high - data.low), 0);

    // Step 2: Calculate the mean by dividing the total range by the number of data points
    return totalRange / ohlcData.length;
}

function findMedianRange(ohlcData) {
    // Step 1: Calculate the range for each candle
    const ranges = ohlcData.map(data => data.high - data.low);

    // Step 2: Sort the ranges in ascending order
    ranges.sort((a, b) => a - b);

    // Step 3: Find the median of the ranges
    const midIndex = Math.floor(ranges.length / 2);

    if (ranges.length % 2 === 0) {
        // If even, median is the average of the two middle values
        return (ranges[midIndex - 1] + ranges[midIndex]) / 2;
    } else {
        // If odd, median is the middle value
        return ranges[midIndex];
    }
}
async function executeBuy(cis) {

    ///notifyWithSound(true,cis);
  // return;
 /*    if(!cis.minuteData){

        return
    }
 */


    
    if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('1024',cis.tradingsymbol,cis.ordered)

if(cis.ordered){

    return false;
}
if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('1026',cis.tradingsymbol)
cis.ordered=true
  /*  let h= highestPointBeforeLast5global.minutes(cis.minuteData);

   if(cis.tick.last_price<h && global.hours<12){

cis.message='not above  highest point before last 5 min of '+cis.tradingsymbol;

console.log(cis.message);
    return;
   } */

 /*  let h2= highestPointAfter12PM(cis.minuteData);

  if(cis.tick.last_price<h2 && (global.hours>12 )){

    cis.message='not above last 5 min candle'+cis.tradingsymbol;

    console.log(cis.message);
        return;

  }else{


    cis.aboveNoonOpening=true;
    console.log('highest price after 12 pm for  ',cis.tradingsymbol);
    
  } */


    let pv2=cis.minuteData.slice(-2, -1)[0]
    let pv1=cis.minuteData.slice( -1)[0];
   


    if(typeof pv2=='undefined' || typeof pv1=='undefined') return;
     pv2.candle=getCandle(pv2)
     pv1.candle=getCandle(pv1)

     if(pv1.close<pv2.close){

        cis.message='candles are closiing in bearishh no entry'
        //console.log('candles are closiing in bullish no entry pv1c<pv2c')

        return;
        
     }
    
     if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('1072',cis.tradingsymbol)
     if(cis.tick.last_price<pv1.candle.low){

cis.message='last tick is bewlow signal low'
        
        return;
     }

     if(pv1.candle.upperShadow>pv1.candle.body*.75){

cis.message='candle has a upper wick not entering now'
        return false;
     }
    
let price=pv1.close
    cis.msg='EXE buy';
    //console.log(price,'price 1')


    console.log('cis.minuteCandleMedianRange',cis.minuteCandleMedianRange,cis.minuteCandleMeanRange)
  // if (cis.last_candle) console.log('entry condition',"cis.tick.last_price",cis.tick.last_price,(cis.last_candle.high+.5),'(cis.last_candle.high+.5)',cis.tradingsymbol,'is.liveHourCandle=',cis.liveHourCandle)
    

    
/* if(cis.lastCandle.high>cis.tick.last_price*1.1){ */


//if(pv1.close<cis.tick.last_price*.33 || pv2.close<pv1.high*.33){

let liveRange=Math.abs(cis.tick.last_price-pv1.close)

if(pv1.range<liveRange*.5 || pv2.candle.range<pv1.candle.range*.33){
  
  
    cis.message='some kida shooting star'+ cis.tradingsymbol;
    console.log(cis.message);
    cis.returns.push('shooting star it seems for ',cis.tradingsymbol)
    return false;
}
if(cis.tradingsymbol=='MIDCPNIFTY2481912625CE')      console.log('1111',cis.tradingsymbol)
if(true){

///proiceding for actual buy
   // price=cis.tick.last_price-((pv1.high-pv1.low)/2)
    price=pv1.close

    //console.log(price,'price4 ',price)






    //open(cis.chart, {app: {name: 'chrome'}}).catch(console.error);
    //process.exit();
  /*   if( global.hours!=9 && ( !cis.liveHourCandle || cis.liveHourCandle.high>cis.tick.last_price+10)){
    
        console.log('NOT ENTERING BELOW HIGH OF CURRENT CANDLE FOR ',cis.tradingsymbol,'last price',cis.tick.last_price, 'current high :', );
        //msgx('NOT ENTERING BELOW HIGH OF CURRENT CANDLE FOR ',cis.tradingsymbol,'last price',cis.tick.last_price, 'current high :', cis.liveHourCandle.high);
       return false;
    } */
    //console.log('Aggregated Candle:', cis.liveHourCandle,cis.tradingsymbol,'last price',cis.tick.last_price);
           
    

    
            let obj={
                
                "NIFTY":36,//72,
                
               // "BANKNIFTY":60,
                "BANKNIFTY":30,//,
                'MIDCPNIFTY':20,//,
                "FINNIFTY":20,//40
              }
    let multiplier;
    
    Object.keys(obj).forEach(key => {
        if (cis.tradingsymbol.includes(key)) {
          multiplier = obj[key];
        }
      });
      
      
      if(typeof multiplier =='undefined'){
      
        multiplier =40
      } ;
     // multiplier =4
      //multiplier=1;
      //99176
    
      //multiplier=2;


      multiplier=multiplier

     // multiplier=10;

multiplier=5
/// pv5,pv4,pv3,pv2,pv1  --->> if pv3 and 2 are higher high do not entry water has flown 

var noLots=2;///max 10


var priceDecrement=0;

for(let i=0;i<noLots;i++)

    {

            const orderParams = {
                exchange: "NFO", // or other exchanges as per requirement
                tradingsymbol:cis.tradingsymbol,
                transaction_type: "BUY", // or "SELL"
                order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
                quantity: cis.lot_size* multiplier, // specify the quantity
                price: Math.min(price-(priceDecrement*i),cis.tick.last_price),
                product: "NRML", // or "CNC", "NRML"
                validity: "DAY", // or "IOC"
            };
        
            try {

                cis.msg='placing orders at '+pv1.close;


                const orderId = await kite.placeOrder("regular", orderParams);


                console.log("Order placed successfully. Order ID:", orderId);
            } catch (error) {
                console.error("Error placing order:", error,cis.tradingsymbol);
            }
        }
           // console.log(cis.tradingsymbol,'has buy signal',hasBuySignal);
}
}

function highestPointBeforeLast5global.minutes(data) {
    if (data.length < 6) {

        return true;
        throw new Error("Insufficient data. The array must have at least 6 elements.");
    }

    // Slice the array to exclude the last 5 global.minutes
    const relevantData = data.slice(0, data.length - 5);

    // Find the highest point in the remaining data
    let highestPoint = relevantData[0].high;
    for (let i = 1; i < relevantData.length; i++) {
        if (relevantData[i].high > highestPoint) {
            highestPoint = relevantData[i].high;
        }
    }

    return highestPoint;
}
function getCurrentHourlyCandleFromMinuteCandle(candles) {
    // Function to get the start time of the nearest 15-minute interval from the completed hour
    function getStartTime(global.date) {
        const start = new global.date(global.date);
        start.setglobal.minutes(0, 0, 0); // Reset global.minutes and global.seconds to 0
        const hour = start.getglobal.hours();
        if (start.getglobal.minutes() > 15) {
            start.setglobal.hours(hour, 15, 0, 0); // Set to the nearest 15-minute interval after the completed hour
        } else {
            start.setglobal.hours(hour, 0, 0, 0); // Set to the completed hour
        }
        return start;
    }


    
    const currentTime = new Date();
    const startTime = getStartTime(currentTime);

    

    // Filter candles within the time range
    const relevantCandles = candles.filter(candle =>{

       
       // console.log(startTime<candle.global.date ,currentTime>candle.global.date,candle.global.date >= startTime && candle.global.date <= currentTime)
      //  console.log('candle global.date',candle.global.date);
        

       return candle.global.date >= startTime && candle.global.date <= currentTime;

    }) ;


   
    

    if (relevantCandles.length === 0) {

        console.log(candles.length,'No relevant candles found within the specified time range ',startTime,currentTime)
        //msgx(candles.length,'No relevant candles found within the specified time range ',startTime,currentTime)
        //throw new Error('No relevant candles found within the specified time range.');
    }

    // Aggregate OHLC values
    const aggregatedCandle = relevantCandles.reduce((acc, candle) => {
        acc.open = acc.open === null ? candle.open : acc.open; // Use the first open price
        acc.close = candle.close; // Use the last close price
        acc.high = Math.max(acc.high, candle.high);
        acc.low = Math.min(acc.low, candle.low);
        acc.volume += candle.volume;
        return acc;
    }, {
        open: null,
        high: -Infinity,
        low: Infinity,
        close: null,
        volume: 0
    });


    //console.log(aggregatedCandle,'aggregatedCandle')
    return aggregatedCandle;
}



function getCandle(ohlc){


if(!ohlc){

    return
}

    let {open,close,high,low}=ohlc;

    let body=Math.abs(close-open);
    let upperShadow=high-Math.max(open,close);
    let lowerShadow=Math.min(open,close)-low;
    let range=high-low;
    let color=close-open>=0?'green':'red';
    let isHammer=lowerShadow>body*4&& lowerShadow>upperShadow*2

    return {open,high,low,close,body,upperShadow,lowerShadow,range,color,isHammer}


}


function isTickAboveHourlyHistoricalValueChkFn(cis){

    
    
let tick=cis.tick;


const lnk = terminalLink('Chart', cis.chart); // Replace with your actual URL

    
let a1=  hourlyHistoricalData[tick.instrument_token]


if(!a1){


    cis.returns.push('no hourly historical data')
    return false;
}
let a=a1.map(a1=>a1.high)

.sort((a2,b2)=>a2-b2);


//console.log(a,'a');


 if(global.date.hours()>12 && cis.highestPointAfter12PM<cis.tick.last_price){

    let m=chalk.green('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk} @ ${global.date}`);
    console.log(m)
    return true

 }
    
    else if(global.date.hours()==9){

   // cis.liveHourCandle && cis.tick.last_price <cis.liveHourCandle.high*.8 
    let z=chalk.yellowBright('The breath morning',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price}  ) ohlc high:${tick.ohlc.high},Chart :${lnk} @ ${global.date} `);
    cis.isTickAboveHourlyHistoricalValue=true;

    cis.entryBelowHourlyCandle=true;
    if(!msg.includes(z)){

       // console.log(z);
        
    }

    return true
    
}
/* console.log(a,);
console.log(a[a.length-1],tick.last_price,//cis.tradingsymbol); */


//console.log(cis.hourlyHigh,'cis.hourlyHigh')
//process.exit();


let x=chalk.green('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk} @ ${global.date}`);


//console.log(a,'a')
    if(a && (tick.last_price>a[a.length-1]))

      {
        let x=chalk.green('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk} @ ${global.date} `);
        cis.isTickAboveHourlyHistoricalValue=true
        if(!msg.includes(x) && [46].includes(global.seconds)){

            console.log(x);
            
        }

    return true
      }
    
    
      else   {

        //console.log(chalk.red('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk}`))

        let y=chalk.red('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk}`);
        cis.isTickAboveHourlyHistoricalValue=false;
        if(!msg.includes(y) && [46].includes(global.seconds)){

          console.log(y);
            
        }

        if([30].includes(global.seconds)){
           // process.stdout.write('\x1Bc');
            console.log(chalk.bgYellow('---------------------------------------------'))
           // console.clear();
        }

       // cis.returns.push('return at 1122')

       // return true/// trial
        return false;
      }


      return false;
    
//console.log(chalk.red('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk}`))

  
        
        console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        
        
   



//console.log(a,'hourly high pri es sorted',a[0]);


if(a && (a[a.length-1]<tick.last_price)){


       cis.isTickAboveHourlyHistoricalValue=true
       
       
       return true
    }else{

       // let ti=  convertToIndianTime(a[a.length-1])



        cis.isTickAboveHourlyHistoricalValue=false;
      

return false
    }

}


function convertToIndianTime(utcTimeString) {
    // Create a global.date object from the UTC time string
    const utcglobal.date = new global.date(utcTimeString);

    // Set the time zone to Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata' };

    // Format the global.date and time using IST
    const indianTimeString = utcglobal.date.toLocaleString('en-IN', options);

    return indianTimeString;
}






// Function to subscribe to instruments for ticker
async function subscribe() {
    try {
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));

        var ts= instruAll.map(a =>a. tradingsymbol);
       // console.log('Subscribing to instruments:', instrument_tokens);

        // Subscribe to instruments

        ticker.unsubscribe([]);
        ticker.subscribe(instrument_tokens);

        console.log('NUMBER OF TOKSN',instrument_tokens.length,ts);
        
        ticker.setMode(ticker.modeFull, instrument_tokens);
    } catch (error) {
        console.error('Error subscribing to instruments:', error);
    }
}

// Function to fetch hourly historical data
async function fetchHourlyData() {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').subtract(1,'days').
        
        
        add(13, 'global.hours').add(0, 'global.minutes').format('YYYY-MM-DD HH:mm:ss');
        
        let toTime;

        if (now.hour() === 9) {
            toTime = now.subtract(0,'minute').
            
         format('YYYY-MM-DD HH:mm:ss');
        } else {

//console.log(now.minute(),'now.minute');

/* if(now.minute()>=15){
    toTime = now.startOf('hour').add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');

}else{

    toTime = now.startOf('hour').subtract(1,'hour').add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');
} */
           
toTime = now.format('YYYY-MM-DD HH:mm:ss');   

console.log('totime',toTime,'now.minute',now.minute());

      
        }

        const dataType = '60minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));

        //console.log('Fetching hourly data for instruments:', instrument_tokens.length,'from ',fromTime,'To :',toTime);

        // Fetch all hourly historical data
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);

        Object.keys(hourlyHistoricalData).forEach((key)=>{

            let  cis=instruAll.find(i=>i.instrument_token==key);
            cis.location={}
            cis.hourlyHistoricalData=hourlyHistoricalData[key];

      
            
            hourlyHistoricalData[key].forEach((h)=>{

h.time=convertToIndianTime(h.global.date);
            });

            //console.log(hourlyHistoricalData[key]);

            //process.exit();




           // console.log(hourlyHistoricalData[key][ hourlyHistoricalData[key].length-1]);
            

            if(!hourlyHistoricalData[key][ hourlyHistoricalData[key].length-1]){


                cis.returns.push('return at 1267')
                return;
            }
           // process.exit()

            cis.hourlyHigh= hourlyHistoricalData[key][ hourlyHistoricalData[key].length-1 ].high
            
            cis.hourlyHighTime= convertToIndianTime(
                
                hourlyHistoricalData[key][ hourlyHistoricalData[key].length-1 ].global.date
               
             
            );             
            
            
           
        })

       // console.log('Hourly Historical Data:', hourlyHistoricalData);
    } catch (error) {
        console.error('Error fetching hourly data:', error);
    }
}


function getCandleTimesGreaterThanMedian(ohlcData, medianRange) {
    const rangeThreshold = 3 * medianRange;

    // Helper function to convert TZ time to Indian Standard Time (IST)
    function convertToIST(isoglobal.date) {
        const global.date = new global.date(isoglobal.date);
        // IST is UTC+5:30
        const istOffset = 5 * 60 + 30; // Offset in global.minutes
        const utcOffset = global.date.getTimezoneOffset();
        const istTime = new global.date(global.date.getTime() + (istOffset + utcOffset) * 60000);
        return istTime.toISOString().replace('T', ' ').split('.')[0]; // Convert to local time and format
    }

    // Filter the candles and extract their times
    const timesInIST = ohlcData
        .filter(data => (data.high - data.low) > rangeThreshold)
        .map(data => convertToIndianTime(data.global.date));

    return timesInIST;
}

function calculateBollingerBands(ohlcData, period = 20, stdDevMultiplier = 2) {
    const movingAverages = [];
    const bollingerBands = [];

    for (let i = 0; i < ohlcData.length; i++) {
        if (i >= period - 1) {
            const slicedData = ohlcData.slice(i - period + 1, i + 1);
            const closingPrices = slicedData.map(data => data.close);

            const sum = closingPrices.reduce((acc, price) => acc + price, 0);
            const average = sum / period;
            movingAverages.push(average);

            const variance = closingPrices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) / period;
            const stdDev = Math.sqrt(variance);

            const upperBand = average + stdDevMultiplier * stdDev;
            const lowerBand = average - stdDevMultiplier * stdDev;

            bollingerBands.push({ middle: average, upper: upperBand, lower: lowerBand });
        } else {
            movingAverages.push(null);
            bollingerBands.push({ middle: null, upper: null, lower: null });
        }
    }

    return bollingerBands;
}

function findSupportsUsingBollingerBands(ohlcData, bollingerBands) {
    const supports = [];

    for (let i = 1; i < ohlcData.length; i++) {
        const { close } = ohlcData[i];
        const { lower } = bollingerBands[i];

        if (close < lower) {
            supports.push({ index: i, value: lower });
        }
    }

    return supports;
}

// Function to fetch minute historical data
async function fetchMinuteData() {
    try {
        const now = moment();
        const fromTime = moment().startOf('day').add(9, 'global.hours').add(15, 'global.minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss');
        const dataType = 'minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));

      // console.log('Fetching minute data for instruments:', instrument_tokens);

        // Fetch all minute historical data
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);

        Object.keys(minuteHistoricalData).forEach((key)=>{

            let  cis=instruAll.find(i=>i.instrument_token==key);


            cis.minuteData=minuteHistoricalData[key];

            cis.highestPointAfter12PM=highestPointAfter12PM(cis.minuteData);

            const period = 5; // Period for Bollinger Bands
const bollingerBands = calculateBollingerBands(cis.minuteData, period);

cis.bollingerBands=bollingerBands;

const supports = findSupportsUsingBollingerBands(cis.minuteData, bollingerBands);
cis.bollingerSupport=supports;
           
           
            cis.lastCandle=cis.minuteData.slice(-1)[0];
         if(cis.lastCandle)   cis.lastCandle.range=cis.lastCandle.high-cis.lastCandle.low


            cis.minuteCandleMedianRange=findMedianRange(cis.minuteData);
            cis.minuteCandleMedianRange=findMeanRange(cis.minuteData);

            //let a=getCandleTimesGreaterThanMedian(cis.minuteData, cis.minuteCandleMedianRange)


            //console.log(cis.tradingsymbol,a)
           // console.log(cis.tradingsymbol,cis.minuteCandleMedianRange);



            let minuteCandle=cis.minuteData
            if(!minuteCandle)
            {
                
                cis.returns.push('no minte data')
                return;
            }
              
                let last_candle=minuteCandle[minuteCandle.length-1];
                cis.last_candle=last_candle;

            //console.log(cis.minuteData);

           // process.exit();
            
            try {


                if(cis.minuteData.length<1){

                    cis.message='No minute candle data from 1163 line'
                    cis.returns.push('No minute candle data from 1163 line')
                    return;
                }
                const aggregatedCandle = getCurrentHourlyCandleFromMinuteCandle(cis.minuteData);
            
                cis.liveHourCandle=aggregatedCandle

                cis.liveCandleRange=(cis.liveHourCandle.high-cis.liveHourCandle.low)
            
            
               // process.exit()
            } catch (error) {
                console.error(error.message);
            }

            //cis.hourlyHigh= hourlyHistoricalData[key][hourlyHistoricalData[key].length-1].high

        if(!minuteHistoricalData[key][minuteHistoricalData[key].length-1] || minuteHistoricalData[key][minuteHistoricalData[key].length-1]<1){
            cis.returns.push('No minute candle data from 1385')
            return false;
        }
            cis.lastMinuteTime= convertToIndianTime(
                
                minuteHistoricalData[key][minuteHistoricalData[key].length-1].global.date
               
            );             
            
           
           
        })



       // console.log('Minute Historical Data:', minuteHistoricalData);
    } catch (error) {
        console.error('Error fetching minute data:', error);
    }
}

// Function to fetch historical data for given instruments and time range
async function fetchAllData(kite, instruments, fromTime, toTime, dataType) {
    try {

        
        
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
           // console.log(`Fetching ${dataType} data for instrument ${instrument}`);

            // Fetch historical data for each instrument
            const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);
           // console.log(data,'datatype');
            // Store data in respective historical data object
            if (dataType === '60minute') {
                hourlyHistoricalData[instrument] = data;
            } else if (dataType === 'minute') {
                minuteHistoricalData[instrument] = data;
            }

            // Delay before fetching next instrument data (if needed)
            await new Promise(resolve => setTimeout(resolve, 333)); // Adjust delay as needed
        }
    } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
    }
}


function isLastPriceAboveMaxOfPrev15(ohlcData, cis) {

    if (!ohlcData || ohlcData.length<1) {
        cis.message='no ohlc minute data';
        console.log('no ohlast candle not aboue 15 1439')
        return false;
    }

    // Check if there are at least 16 candles
    if (ohlcData.length < 16) {
      //  console.log('ohlc less than 16')

       /* console.log(
       'Not enough data. Need at least 16 candles.'); */
       return false;
    }

    // Extract the previous 15 candles
    const prev15Candles = ohlcData.slice(-16, -1);

    const prev120Candles = ohlcData.slice(-120, -1);

    // Find the maximum high value in the previous 15 candles
    const maxHigh = Math.max(...prev15Candles.map(candle => candle.high));
    const maxHigh120 = Math.max(...prev120Candles.map(candle => candle.high));

    // Extract the last (16th) candle
    const lastCandle = ohlcData[ohlcData.length - 1];

    const lastCandle120 = ohlcData[ohlcData.length - 1];

    // Find the minimum low value in the previous 15 candles
    const minLow = Math.min(...prev15Candles.map(candle => candle.low));

    // Calculate the difference and percentage
    const diff = maxHigh - minLow;
    const diffPc = diff / maxHigh;

    // Calculate target and stop loss
    const target = maxHigh * 1.9 * (1 + diffPc);
    cis.target = target;

    const sl = minLow;
    cis.stopLoss = sl;

    if(cis.lastCandle120>cis.maxHigh120){

      cis.message='120 candle break out';
    }

    // Compare the closing price of the 16th candle with the maximum high

  /*   console.log('no ohlast candle not aboue 15 1487')
    cis.returns.push('no ohlast candle not aboue 15 1487') */
    return lastCandle.close > maxHigh;
}

// Function to handle order updates from ticker
async function orderupdates(order) {
    //console.log('completed',order)
    let cis=instruAll.find(i=>i.instrument_token==order.instrument_token)

if(!cis) {
   //cis.returns.push('no cis at 1498')
   return;
}

  if(order.status=='COMPLETE' && order.transaction_type=='SELL'){


    cis.order=order;

    cis.sellPrice=order.price;

  /*   cis.noBuy=true;

    let dt=new global.date()
    cis.noBuyTime=dt.setglobal.minutes(dt.getglobal.minutes()+1); */


    cis.noBuy = true;

let dt = new Date();
dt.setglobal.minutes(dt.getglobal.minutes() + 1); // Modifies the global.date object

cis.noBuyTime = dt.getTime();


    cis.lastSeenHigh=0;
    cis.lastSeenHighForPosition=0;
cis.ordered=false;


  cis.hasLivePosition=false;

  cis.upglobal.dated=false;
  cis.placedTarget=false;
  cis.hasPlacedTarget=false;
  cis.upglobal.dated=false;
  
  cis.highestProfit=0;

  //open(cis.chart, {app: {name: 'chrome'}}).catch(console.error);

  await  fetchOrdersAndSetCis();
  await fetchPositionsAndSetCis();
  }

    if(order.status=='COMPLETE' && order.transaction_type=='BUY'){

     await  fetchOrdersAndSetCis();
await fetchPositionsAndSetCis();


//let targetPoints=Math.floor(cis.minuteCandleMedianRange*1)
let targetPoints=12;
cis.buyPrice=order.price;
cis.order=order;

cis.lastSeenHighForPosition=order.price;

cis.lastSeenHigh=order.price;
cis.upglobal.dated=false;


let target;
console.log(cis.target,'is the cis.target')
if(cis.target){

    target=cis.target;
}
else{

    target=order.average_price * targetPoint
}

targetPoints=10
target=order.average_price + targetPoints
target=order.price + targetPoints

let targetE=cis.target?cis.target:target;



const orderParams = {
    exchange: "NFO", // or other exchanges as per requirement
    tradingsymbol: order.tradingsymbol,
    transaction_type: "SELL", // or "SELL"
    order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
    quantity: order.quantity, // specify the quantity
  // price: Math.ceil(targetE ),
    price: Math.ceil( order.average_price + 5),
    product: "NRML", // or "CNC", "NRML"
    validity: "DAY", // or "IOC"
};


/* console.log('order price',Math.ceil(cis.position.buy_price)+ targetPoint,order);
process.exit(); */
try {
    const orderId = await kite.placeOrder("regular", orderParams);
    cis.hasPlacedTarget=true;
    console.log("Order placed successfully. Order ID:", orderId);
    //cis.ordered=false;
  //  cis.hasLivePosition=false;
} catch (error) {
    console.error("Error placing order:", error);
}
    }
    // Handle order updates here
   // console.log('Order Upglobal.date:', order);
    // Add your logic to process order updates as needed
}

// Function to schedule hourly data fetch at :15th minute
function scheduleHourlyDataFetch() {
    const now = moment();
    const currentMinute = now.minute();

    if (currentMinute < 15) {
        const delayglobal.seconds = (15 - currentMinute) * 60 - now.global.seconds();
        setTimeout(fetchHourlyData, delayglobal.seconds * 1000);
    } else {
        const nextHour = now.startOf('hour').add(1, 'hour').add(15, 'global.minutes');
        const delayglobal.seconds = nextHour.diff(now, 'global.seconds');
        setTimeout(fetchHourlyData, delayglobal.seconds * 1000);
    }
}



//import { io4200 } from '../server.js';

// Create a writable stream
//const logFile = fs.createWriteStream(`app${global.date('dd-mm-yy')}.log`, { flags: 'a' });

// Override console methods

/*
 console.log = (...message) => {

    console.log(...message);
    
    let m=[...message].join(' ');

  logFile.write(`[LOG] ${m}\n`);
}; 

console.error = (message) => {
  logFile.write(`[ERROR] ${message}\n`);
};

console.warn = (message) => {
  logFile.write(`[WARN] ${message}\n`);
};

console.info = (message) => {
  logFile.write(`[INFO] ${message}\n`);
};

*/

// Start the main process
main();
