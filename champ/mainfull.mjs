// main.js

import { connectToDatabase } from '../connectToDatabase.js';
import instrumentsForMining from '../appv3/shared/instruments/instrumentsForMining.json' with { type: "json" };
import allInstruments from '../appv3/public/instruments/instrumentsAll.json' with { type: "json" };
import { KiteConnect, KiteTicker } from 'kiteconnect';
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';
import io from 'socket.io-client';
import { handlePositionPresent } from './handleHasPosition.js';
import { handleNoPosition } from './handleNoPosition.js';
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis, fetchHourlyData, fetchMinuteData } from './fetchData.js';
import { handleOrderUpdates } from './orderUtils.js';
import { updateOpenOrderPrice } from './orderUtils.js';

import { writeTickToDB } from './wrireToDb.js';

import { analyzeOHLCWithSlopeAndDegree, isRangeGreaterThanFive } from './ohlcUtils.js';


import addOrIncrementRejection from './addOrIncrementRejection.js';
import { Worker } from 'worker_threads';

import eventBus from './eventBus.js';
import { appendTPS } from './tps_logger.js';

//import  getAccessToken  from "../login.js";

//const fetchWorker = new Worker('./fetchWorker.js');



//const socket = io('http://tradingsimham.in:4000');  // Using a domain


//const socket = io('https://think-vivek-thinkpad-e14-gen-5.taild05309.ts.net:4000'); 

const socket = io('http://localhost'); 

//const WebSocket = require("ws");





process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

//c//onst socket = io('http:localhost

// const socket = io({
//   path: '/socket.io',
//   transports: ['websocket']
// });

//import niftyTrading from './intraday/niftyTrading.json' assert { type: "json" };
import setAboveOpenScripts from './setAboveOpenScripts.js';
import setLiveMinute from './setLiveMinute.js';
import updateClosePriceAt59thSecond from './updateClosePriceAt59thSecond.js';
import { setLastPriceStatusWithOpen } from './cisHelpers.js';
import { determineOperatorCandleFlags } from './determineOperatorCandles.js';
import { placeTargetIfNotTargetSet } from './placeTargetIfNotTargetSet.js';

import fs from "fs";
import { globalAgent } from 'http';
import { executeBuy } from './executeBuy.js';

// Load skip list from skip.json and assign to global
try {
  global.skip = JSON.parse(fs.readFileSync("skip.json", "utf-8")).skip || [];
 // console.log("✅ Global skip list loaded:", global.skip,global.clock);
} catch (e) {
  global.skip = [];
  console.warn("⚠️ Could not load skip.json, using empty skip list.");
}

global.instrumentsCat = ['BANKNIFTY', 'NIFTY','MIDCPNIFTY', 'FINNIFTY',  ];

// Get the instrument name from command line argument]]
const instrumentName = process.argv[2];   // from start instrument script , type is catched here



global.toOneDecimal = v => Math.trunc(v * 10) / 10;
global.instrumentName=instrumentName;

global.allInstruments=allInstruments;

global.margins=false;

global.stopLossPoints=20;
global.targetPoints=50

global.enableShortTrading=false;


global.mockTrading=false;

global.riskPerTradePct = 0.01;     // 1% of available capital risked per trade
global.maxDailyLossPct = 0.03;     // stop new entries once the day's loss hits 3%
global.dayStartEquity = null;
global.dailyLossLimitHit = false;
global.minProfitCushionPct = 0.10;  // peak profit must reach this % of capital before profit-lock arms
global.dayPeakPnL = 0;
global.profitLockTriggered = false;

var cis;
var instrumentData =[];

let niftyTrading=[]

// const token = await getAccessToken();
// console.log("Token for API calls:", token);
// process.exit();

 const checkAndSetExpiryDay = (cis) => {
  if (!cis?.expiry) {
    console.warn("No expiry field in cis.");
    cis.expiryDay = false;
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0]; // e.g., "2025-07-03"
  const expiryStr = new Date(cis.expiry).toISOString().split("T")[0];

  cis.expiryDay = (expiryStr == todayStr);

  return;
};

function updateTickCount(cis) {
  cis.count = (cis.count || 0) + 1;

  if (global.seconds == 59) {
    cis.tps = cis.count;
    //appendTPS(cis);

   // console.log(`${cis.tradingsymbol} at ${global.clock} -> TPS: ${cis.tps}, Final Count: ${cis.count}, Price: ${cis.ticklast_price}`);
    
    cis.count = 0;
  }
}




eventBus.on('hasLivePositionUpdated', ({ token, value }) => {


    setmarginCisOrdersAndPosition();

   // console.log('emit received @  hasLivePositionUpdated',value,token)
    const cis =global.instrumentsForMining.find(i => i.instrument_token == token);
    if (cis) {
      cis.hasLivePosition = value;
       cis.stopLossExecuted=value
       cis.ordered = false;
      cis.entryPrice = null;
      cis.buyPrice = null;
      cis.targetSet = false;
      cis.stopLossSet = false;
      cis.targetPrice = null;
      cis.stopLossPrice = null;
      cis.buyStrategy = null;
      cis.averageRange = null;
      cis.stockTrade = false;
      console.log(`Updated hasLivePosition for ${token} to ${value}, ${global.clock}`);
    }
  });

  eventBus.on('cisUpdated', ({ token, cis }) => {
  const index = global.instrumentsForMining.findIndex(item => item.instrument_token == token);
  if (index != -1) {
    instrumentsForMining[index] = { ...instrumentsForMining[index], ...cis };
    console.log(`cis updated for token ${token} , ${global.clock}`);
  } else {
    console.warn(`No cis found with token ${token} from tocken update ${global.clock}`);
  }
});





     instrumentData = instrumentsForMining//.filter(inst => inst.name == instrumentName);
    
    global.instrumentsForMining=instrumentsForMining//.filter(inst => inst.name == instrumentName);
    
    global.instrumentName =instrumentName ;
    
   global.allInstruments=allInstruments//.find(inst => inst.name == instrumentName);
    
  //  console.log('THread',instrumentName,global.clock);






global.targetPc=1.1;
global.stoplossPc=.95;

global.aboveOpens=[];

global.isAbove=[];

global.tradingMaxAmount=200000;



//what i this
global.speedSymbols=['NIFTY24D1224550PE', 'NIFTY24D1224900CE'];
global.speedSymbols= instrumentsForMining.map(a =>a.tradingsymbol)


//
if (!instrumentData) {
    console.error(`Instrument ${instrumentName} not found in instrumentsForMining`);
    
    //return;
    process.exit(1);
}

// Set global variables for the specified instrument
//global.instrumentName = instrumentName;
//global.instrumentData = instrumentData;
global.addOrIncrementRejection = addOrIncrementRejection;
global.positions = [];
global.orders = [];

// Initialize Kite Connect and database connection
let con = connectToDatabase();
let kite, ticker;

import WebSocket  from "ws";

import { sendNotification } from './mobileAlerts.js';

const wss  = new WebSocket.Server({ port: 5000 });

main();

// wss.on("connection", (ws) => {
//   console.log("Mac connected");
//    main(ws);

//   ws.send("Scale monitoring active");

//   // Example alert
//   // setTimeout(() => {
//   //   ws.send("Weight exceeded limit!");
//   // }, 5000);
// });

async function main(ws=null) {


    try {

       socket.emit('sendCis', cis);
        setClock();

      

        // if(global.hours>14|| global.hours<9 ||(global.hours==15 && global.minutes>30) ||(global.hours==9 && global.minutes<15)){

        //     console.log('Exiting the code out of time');

        //    //return 
        // }

      
        // if(global.instrumentName!='STK'){



        //     //// to prevent mis 
        //    // return;
        // }
        

       
        
   
        const accessTokenDoc = await getTodaysAccessToken();
        kite = await getKiteConnectInstance();

         await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);
    await fetchMinuteData(kite);

        global.margins = await kite.getMargins();
        global.dayStartEquity = global.margins?.equity?.net ?? null;

        setInterval(async () => {


            if(global.seconds%30==0){

   
               // placeTargetIfNotTargetSet(kite)
            }
           
           
            setClock() 

          /*   if (global.minutes % 15 == 0 && global.seconds == 10) {
                await fetchHourlyData(kite);
            } */




                //// not used chek why its here
            // if (global.minutes== 15 && global.seconds == 10 &&  instrumentName!='STK') {
                
            //    // fetchWorker.postMessage({ type: 'fetchHourly', kite });

            //    // await fetchHourlyData(kite);
            // }


           if(global.instrumentName=='STK'){


            /// for intraday scripts non index

            if (global.seconds == 1 && global.minutes%5==0) {
            
                     global.margins = await kite.getMargins();
                     await setmarginCisOrdersAndPosition(); 
 
              
          
             }

           }       
           
           else{

            if (
                
                
                global.seconds ==1) {

                /// to set orders and posions to 

                if(!(global.hours<9 || global.hours>15 ||(global.hours==9 && global.minutes<15 ) || 
                (global.hours==15 && global.minutes>30))){
                    
                    await setmarginCisOrdersAndPosition(); 
                   // await placeTargetIfNotTargetSet(kite);

                }
                

               
            
            
            
            }
           }

           

            if(global.seconds%2==0){


  
           global.margins=await kite.getMargins();

           const currentEquity = global.margins?.equity?.net;
           if (typeof currentEquity == 'number' && typeof global.dayStartEquity == 'number') {
             const dailyPnL = currentEquity - global.dayStartEquity;
             if (dailyPnL <= -global.maxDailyLossPct * global.dayStartEquity) {
               if (!global.dailyLossLimitHit) {
                 console.warn(`Daily loss limit hit: PnL ${dailyPnL.toFixed(0)}, dayStartEquity ${global.dayStartEquity.toFixed(0)}`);
               }
               global.dailyLossLimitHit = true;
             }

             if (dailyPnL > global.dayPeakPnL) {
               global.dayPeakPnL = dailyPnL;
             }

             const profitCushionArmed = global.dayPeakPnL >= global.minProfitCushionPct * global.dayStartEquity;
             if (profitCushionArmed && dailyPnL <= global.dayPeakPnL * 0.90) {
               if (!global.profitLockTriggered) {
                 console.warn(`Profit lock triggered: peak PnL ${global.dayPeakPnL.toFixed(0)}, current PnL ${dailyPnL.toFixed(0)}`);
               }
               global.profitLockTriggered = true;
             }
           }
            }



        }, 1000);

        // Start ticker and fetch initial data
       
        

             // Send an immediate fetch request to the worker on startup
             //fetchWorker.postMessage({ type: 'fetchData', kite });
            
//////////////////////////////////////////////////////////////       
            console.log('initializing ticker');
             initTicker(ws);   ///main entry point for ticker

//////////////////////////////////////////
           setTimeout(()=>{
                //fetchWorker.postMessage({ type: 'fetchHourly', kite });

             },15*1000)
                    

         
///first time


        await setmarginCisOrdersAndPosition(); 
       // await placeTargetIfNotTargetSet(kite);

 

       // scheduleHourlyDataFetch();
    } catch (error) {
        console.error(`Error in main function for ${instrumentName}:`, error);
    }

 
}



/**
 * Fetches orders, positions, hourly, and minute data,
 * and sets them into the global CIS structure.
 * Intended to be called during system setup or margin evaluation.
 */
async function setmarginCisOrdersAndPosition() {

    /**
 * Adds two numbers and returns the result.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 */
   // global.margins = await kite.getMargins();



   //if(!(global.hours<9 || global.hours>15 ||(global.hours==9 && global.minutes<15 ) || (global.hours==15 && global.minutes>30))){
    await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);
    await fetchHourlyData(kite);
    await fetchMinuteData(kite);

  // }
}

function setClock() {
    global.date = new Date();
    global.day = global.date.getDay();
    global.hours = global.date.getHours();
    global.minutes = global.date.getMinutes();
    global.seconds = global.date.getSeconds();
   // console.log(date.getMilliseconds(),'MSMS1',date.getMilliseconds()==5)\
  // date.getMilliseconds()
    if(date.getMilliseconds()==5){
//console.log(date.getMilliseconds(),'MSMS')
        global.msFlag=true
    }else{

        global.msFlag=false;
    }



    global.clock = ` Time:${global.hours}:${global.minutes}:${global.seconds} date :${global.date.toISOString().split('T')[0]} msFlag:${global.msFlag} `;
}
function initTicker(ws) {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.connect();
    ticker.on("connect", subscribe);
    
  //  ws.send(`Kite Ticker connected for ${global.instrumentName} at ${global.clock}`);
 ticker.on("ticks", (ticks) => onTicks(ticks, ws));
    
      ticker.on("order_update", orderUpdates);
   
}

function onTicks(ticks,ws) {

    

    var instrumentToken =global.instrumentsForMining.map(i=>parseInt(i.instrument_token));

  let b=  ticker.setMode(ticker.modeFull, [instrumentToken]);
  //ws.send(`Subscribed to ticks for ${global.instrumentName} at ${global.clock}`);

  //console.log(ticker.modeFull,'ticker mode')
    
    ticks.forEach(tick => processTicks(tick,ws));
}

function updateAvgPriceChangePerTick(cis) {
  
  const currentPrice = cis.last_price;

  cis.margin=global.margins?.equity?.available?.live_balance+global.margins?.equity?.available?.collateral || 0;

  cis.fullMargin=global.margins;
  
  // first tick becomes baseline
  

  // calculate change from previous tick
  const diff = currentPrice - cis.prevTickPrice;

  // accumulate
  cis.totalTickChange += diff;
  cis.tickCount++;

  // update avg change per tick
  cis.avgChangePerTick = cis.totalTickChange / cis.tickCount;

  // update prev price
  cis.prevTickPrice = currentPrice;
}


function updateTPM(cis, globalMinutes, globalSeconds) {

  if(cis.lp!=cis.tick.last_price){

    cis.tps=(cis.tps ||0)+1
  }


  if(cis.lp<cis.tick.last_price){
cis.up=cis.up+1 ||1
  }else if(cis.lp>cis.tick.last_price){
cis.down=cis.down+1 ||1

  }
  cis.lp=cis.tick.last_price



  if(global.seconds==0){
    cis.tps=0;

   cis.strength= cis.up/cis.down*100
    cis.up=1;
    cis.down=1;

  }
  // Initialize once per cis
  if (typeof cis.startMinute === 'undefined') {
    cis.startMinute    = globalMinutes;
    cis.startSecond    = globalSeconds;
    cis.ticksInWindow  = 0;
    cis.tpm            = 0;   // ticks per minute for last completed window
  }


  if(typeof cis.strength=='undefined') cis.strength=0;

  if(global.seconds>58){

  //        console.log(
  //   cis.tps.toFixed(2),
  //   'tps', 'strength',cis.up,cis.down,
  //   cis.tradingsymbol,global.hours,":",global.minutes,
  // );
 

}


if(global.seconds%30){
  if(cis.up>cis.down*2){

  //  console.log('strong up trend detected for',cis.tradingsymbol,cis.up,cis.down,'cis.tick.last_price',cis.tick.last_price);
  }else if ((cis.down>cis.up*2)){

    // console.log('strong down trend detected for',cis.tradingsymbol,cis.up,cis.down,'cis.tick.last_price',cis.tick.last_price);
  }
}


// if(global.seconds%55==0){

//  // console.log('last price is now',cis.tick.last_price,'for',cis.tradingsymbol,'at',global.clock);

// }
  // Count this tick
  cis.ticksInWindow++;

  // How many seconds passed since start
  const elapsedSeconds =
    (globalMinutes - cis.startMinute) * 60 +
    (globalSeconds - cis.startSecond);

  // If 2 minutes or more have passed
  if (elapsedSeconds >= 60) {
    const elapsedMinutes = elapsedSeconds / 60;    // usually ~2.0
    cis.tpm = cis.ticksInWindow / elapsedMinutes;  // update TPM

    // Reset for new 2-min window

 
    cis.startMinute   = globalMinutes;
    cis.startSecond   = globalSeconds;
    cis.ticksInWindow = 0;
  }
}

let count=0;
let tickCount=0
async function processTicks(tick,ws) {




   // if(global.seconds%2==0)return;///suspected slowing solution
  
   if(count>0){

    ticker.setMode('full',global.instrumentsForMining.map(i=>parseInt(i.instrument_token)))
   }

    count=count+1;



    


  //const currentMinute = global.minutes; 


    const cis = global.instrumentsForMining.find(
      (i) => i.instrument_token == tick.instrument_token
    );
    if (!cis){

console.warn('CIS not found for tick instrument_token',tick.instrument_token);
      return
    } /// /safety


     // console.log(global.clock,'tick received for',cis.tradingsymbol,'last price',tick.last_price,'open',tick.ohlc.open)

    // console.log(cis.margins)

    cis.hours=global.hours;
cis.minutes=global.minutes;
cis.seconds=global.seconds;
 socket.emit('sendCis', cis);

  cis.tick = tick; 



setLiveMinute(cis);

//sendNotification(`Tick received for ${cis.tradingsymbol} at ${global.clock}`, `Last Price: ${cis.tick.last_price}, Open: ${cis.tick.ohlc.open}, Live Minute Color: ${cis.liveMinute.color}`);
  
    updateClosePriceAt59thSecond(cis)

//console.log(global.clock,'tick received for',cis.tradingsymbol,'last price',cis.tick.last_price,'open',cis.tick.ohlc.open,'live minute color',cis.liveMinute.color)
    if (cis.tick.last_price > cis.tick.ohlc.open && cis.liveMinute.color=='green' && global.hours==9 &&
      (global.minutes<20 )  ) {
  
    
          cis.buyStrategy = 'day start open  break';
          cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
          cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
          cis.inbuiltTarget = true;
          cis.inbuiltStopLoss = true;
  
          cis.deployedStrategies.dayHighBreak = 'Activated';
          cis.signals.handleDayHighBreak = true;
          cis.entryHealth = 'Day High Break triggered';
          console.log(global.clock, 'Executing Open green candle ', cis.tradingsymbol, cis.entryHealth);

         // executeBuy
          executeBuy(cis, kite, Math.ceil(cis.tick.last_price- cis.liveMinute.range));
  
          return true; // Indicates a trade was executed
      }
//console.log(global.clock,'tick received for',cis.tradingsymbol,cis.js)

updateTPM(cis, global.minutes, global.seconds);
updateAvgPriceChangePerTick(cis);

//ws.send(`TPS for ${cis.tradingsymbol}: ${cis.tps.toFixed(2)} at ${global.clock}`);


if(ws&& cis.tps>100 && !cis.highTPSAlert){

  cis.highTPSAlert=true;
  ws.send(`High TPS alert for ${cis.tradingsymbol}: ${cis.tps.toFixed(2)} TPS at ${global.clock}`);
}
 

//console.log(cis.avgChangePerTick,'avg price change per tick for',cis.tradingsymbol);
    // count this tick in the ongoing minute
  

   // console.log(cis.tradingsymbol)

 // console.log(cis.tpm,'ticks per minute for',cis.tradingsymbol,'cis.ticksInThisMinute',cis.ticksInThisMinute);

  //nreturn;

     //updateTickCount(cis);

  



  if (global.skip.includes(cis.tradingsymbol)) {
  console.log(`⛔ Skipping ${cis.tradingsymbol}`);
  return;
}

  
   
   if(!cis.minuteData){
    cis.returnPoints="minute data not found"
   // console.log('minute data not found for',cis.tradingsymbol)
   
   return}
    
   if(!cis.ma20){

    cis.ma20=cis.minuteData.map(m => m.close).slice(-20).reduce((a, b) => a + b, 0) / 20;
   }
   
    



  

   
    // cis.entryHealth=''
    // cis.returnPoints=[]
    // cis.buyCriteria=''
    
    if (!cis) return;

  




        

   // }
       


   // Increment or reset tickCount
tickCount = (tickCount == 10) ? 0 : tickCount + 1;

// Store the current tick in cis



    findHugeTick(cis,tickCount);



    cis.price=tick.last_price

    if(cis.tick.oi && cis.minuteData && global.seconds==1 && cis.minuteData.length>0){


        if(typeof cis.ois=='undefined'){

            cis.ois={}
        }


        cis.oi=cis.tick.oi;
        cis.ois[cis.minuteData.length]=cis.tick.oi
    }


   setLastPriceStatusWithOpen(cis);


  

if(ws&& cis.oiDropStrength != "NONE"&& !cis.oiDropAlerted){
   cis.oiDropAlerted=true;
   ws.send(`OI Drop Alert for ${cis.tradingsymbol}: ${cis.oiDropStrength} at ${global.clock}`);
}
 

 


   //anal
   // analyzeCandlestickPatterns(cis)
   // analyzeLastCandle() /// to determine last candle for patterns

    setLastPriceStatusWithOpen(cis)// set status with respect to open


    analyzeOHLCWithSlopeAndDegree(cis);

    // Check if range is greater than 5%
    isRangeGreaterThanFive(cis);


   // if(cis.pricePoints.d1)
    
   // console.log(socket,'socket')


   determineOperatorCandleFlags(cis)

   //if(cis.operatorBuyCandles.)


   //if(["NFO","BFO"].includes(cis.exchange))    
 
   

    // if(global.minutes==30 && global.seconds==1){

    //    // console.log('Tick Health',cis.tradingsymbol)
    // }
    
    


    // if(cis.tradingsymbol.includes('NXT')){

    //     //block niftyt nxt
    //     return;
    // }
//console.log('process ticks @107');

  
    
    

    
    


 
    



  //  import {set}



  setAboveOpenScripts(cis)

    let tempHigh = tick.ohlc.high;



   // writeTickToDB(cis);

    setTimeout(() => {
        // After 3 minutes, set the stored high value to cis.highBeforeThreeMinutes
        cis.highBeforeThreeMinutes = tempHigh;

      //  console.log(cis.highBeforeThreeMinutes,'cis.highBeforeThreeMinutes',cis.tradingsymbol,'tick.ohlc.high',tick.ohlc.high,'tick lastprice',tick.last_price);
        
    }, 1 * 60 * 1000);



    cis.entryHealth='health near hanldle emit cis'
   //if(global.seconds%20==0) console.log('health near hanldle posistion',cis.tradingsymbol,'cis.hasLivePosition',cis.hasLivePosition)


   //console.log(cis.hasLivePosition,cis.tradingsymbol,'has pos')

  // return;

//console.log('is here', cis.tradingsymbol,'has live position',cis.hasLivePosition,'entry health',cis.entryHealth,'at',global.clock);
//console.log(socket)
  socket.emit('sendCis', cis);


  //console.log(global.margins.equity.available.live_balance,'live balance @ 130')
 // console.log('cis.hasLivePos',cis.hasLivePosition)




 checkAndSetExpiryDay(cis);




 
    cis.entryHealth='health has live positio'+cis.hasLivePosition
    if (!cis.hasLivePosition) {

      
      // console.log('expiry day',cis.tradingsymbol,cis.expiryDay);

        handleNoPosition(cis, kite)

    }

    if(cis.hasLivePosition==true) {

       // console.log('terst 573 live position true why  for?',cis.tradingsymbol,cis.hasLivePosition)
        handlePositionPresent(cis, kite);
       // console.log('cis has no position @130');
        ;
    }
    
    

    function findHugeTick(cis,tickCount) {
        cis[`t${tickCount}`] = tick;

        // Log the last price of the current tick and the tickCount
       // console.log(cis[`t${tickCount}`]?.last_price, tickCount);

        // Compare the current tick with the last tick
        if (tickCount > 0 && // Ensure there is a previous tick (not the first tick)
            cis[`t${tickCount}`] &&
            cis[`t${tickCount - 1}`] &&
            cis[`t${tickCount}`].last_price !== undefined &&
            cis[`t${tickCount - 1}`].last_price !== undefined) {
            // Calculate percentage variation
            const percentVariation = ((cis[`t${tickCount}`].last_price - cis[`t${tickCount - 1}`].last_price) * 100) /
                cis[`t${tickCount - 1}`].last_price;

            // Log the result
            //// console.log(cis.tradingsymbol,`Tick-to-tick variation: ${percentVariation.toFixed(2)}%`);
            // Check if the variation exceeds 1%
            if (percentVariation > 1) {

                cis.hugeLastTick = true;
                // console.log(cis.tradingsymbol, 'huge tick');
            } else {

                cis.hugeLastTick = false;
                // console.log(cis.tradingsymbol, 'small tick');
            }
        } else {
            // console.warn(`Tick data not available or invalid for tickCount: ${tickCount}`);
        }
    }
}


async function orderUpdates(order) {

    if(order.status!='COMPLETE') return;
  //console.log('order update received for',order.tradingsymbol,'status',order.status,'transaction_type',order.transaction_type  );





   let cisx= global.allInstruments.find(cis => cis.tradingsymbol == order.tradingsymbol);

  // console.log('cisx found for order update',cisx?cisx.tradingsymbol:'not found',order.tradingsymbol)
    await handleOrderUpdates(order, kite,cisx,global.instrumentsForMining);
}

 async function subscribe() {

    //console.log(global.allInstruments.map(i=>i.tradingsymbol));
    
    try {
        const instrumentToken = global.instrumentsForMining.map(i=>parseInt(i.instrument_token));
        ticker.unsubscribe([]);
       


    


      
       let a=await  ticker.subscribe(instrumentToken);

       //console.log(a,'tick wait ')

    


    
       if(a){

        ticker.setMode(ticker.modeFull, [instrumentToken]);
       }

      // console.log(a,'tick wait  over')


        
    } catch (error) {
        console.error(`Error subscribing to ${global.instrumentData.name}:`, error);
    }
}





   
    


