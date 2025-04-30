// main.js

import { connectToDatabase } from '../connectToDatabase.js';
import instrumentsForMining from '../appv3/public/instruments/instrumentsForMining.json' assert { type: "json" };
import allInstruments from '../appv3/public/instruments/instrumentsAll.json' assert { type: "json" };
import { KiteTicker } from 'kiteconnect';
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
const fetchWorker = new Worker('./fetchWorker.js');



//const socket = io('http://tradingsimham.in:4000');  // Using a domain


const socket = io('http://localhost:4000'); 
//import niftyTrading from './intraday/niftyTrading.json' assert { type: "json" };
import setAboveOpenScripts from './setAboveOpenScripts.js';
import setLiveMinute from './setLiveMinute.js';
import updateClosePriceAt59thSecond from './updateClosePriceAt59thSecond.js';
import { setLastPriceStatusWithOpen } from './cisHelpers.js';
import { determineOperatorCandleFlags } from './determineOperatorCandles.js';

// Get the instrument name from command line argument]]
const instrumentName = process.argv[2];   // from start instrument script , type is catched here




global.instrumentName=instrumentName;

global.margins=false;


const instrumentData =[];

let niftyTrading=[]

if(instrumentName=='STK'){

   // instrumentData= instrumentsForMining

   console.log({instrumentName},'stk')

    global.instrumentsForMining=niftyTrading
    global.instrumentName=instrumentName;
    global.allInstruments=niftyTrading;
    console.log('THread',instrumentName);

}else{



    const instrumentData = instrumentsForMining.filter(inst => inst.name === instrumentName);
    
    global.instrumentsForMining=instrumentsForMining.filter(inst => inst.name === instrumentName);
    
    global.instrumentName =instrumentName ;
    
    global.allInstruments=allInstruments//.find(inst => inst.name === instrumentName);
    
    console.log('THread',instrumentName);

}




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

async function main() {


    try {
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

        global.margins = await kite.getMargins();

        setInterval(async () => {
           
           
            setClock() 

          /*   if (global.minutes % 15 === 0 && global.seconds === 10) {
                await fetchHourlyData(kite);
            } */




                //// not used chek why its here
            // if (global.minutes=== 15 && global.seconds === 10 &&  instrumentName!='STK') {
                
            //    // fetchWorker.postMessage({ type: 'fetchHourly', kite });

            //    // await fetchHourlyData(kite);
            // }


           if(global.instrumentName=='STK'){


            /// for intraday scripts non index

            if (global.seconds === 1 && global.minutes%5==0) {
            
                     global.margins = await kite.getMargins();
                     await setmarginCisOrdersAndPosition(); 
 
              
          
             }

           }
           
           else{

            if (global.seconds %5==0) {

                /// to set orders and posions to 
                await setmarginCisOrdersAndPosition(); 
             }
           }

           

            if(global.seconds%2==0){


  
           global.margins=await kite.getMargins();
            }



        }, 1000);

        // Start ticker and fetch initial data
       
        

             // Send an immediate fetch request to the worker on startup
             //fetchWorker.postMessage({ type: 'fetchData', kite });
            
//////////////////////////////////////////////////////////////       
            
             initTicker();   ///main entry point for ticker

//////////////////////////////////////////
           setTimeout(()=>{
                //fetchWorker.postMessage({ type: 'fetchHourly', kite });

             },15*1000)
                    

         
///first time


        await setmarginCisOrdersAndPosition(); 

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
    await fetchOrdersAndSetCis(kite);
    await fetchPositionsAndSetCis(kite);
    await fetchHourlyData(kite);
    await fetchMinuteData(kite);
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



    global.clock = ` Time:${global.hours}:${global.minutes}:${global.seconds}`;
}
function initTicker() {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.connect();
    ticker.on("connect", subscribe);
    ticker.on("ticks", onTicks);
    ticker.on("order_update", orderUpdates);
}

function onTicks(ticks) {

    var instrumentToken = global.instrumentsForMining.map(i=>parseInt(i.instrument_token));

  let b=  ticker.setMode(ticker.modeFull, [instrumentToken]);

  //console.log(ticker.modeFull,'ticker mode')
    
    ticks.forEach(tick => processTicks(tick));
}


let count=0;
let tickCount=0
function processTicks(tick) {

   if(count>0){

    ticker.setMode('full', global.instrumentsForMining.map(i=>parseInt(i.instrument_token)))
   }

    count=count+1;








    var cis = global.instrumentsForMining.find(i => i.instrument_token == tick.instrument_token);
    


  

   
    // cis.entryHealth=''
    // cis.returnPoints=[]
    // cis.buyCriteria=''
    
    if (!cis) return;

    cis.tick = tick; 


   // Increment or reset tickCount
tickCount = (tickCount === 10) ? 0 : tickCount + 1;

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


   if(!cis.signal){

    cis.signals={}
   }



   cis.signals.fifteenMinuteBreakout=false;
   cis.signals.crossedYesterdayHighFromBelow=false;
   cis.signals.crossedDayOpenFromBelow=false;
   cis.signals.crossedDayHighFromBelow=false;
   cis.signals.lastCandleTouchedDaysLowAndRejected=false;
   cis.signals.reversa30=false;
   cis.signals.openAboveAndGreenCandleBefore920=false;
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



   if(["NFO","BFO"].includes(cis.exchange))    socket.emit('sendCis', cis);
 

    if(global.minutes==30 && global.seconds==1){

       // console.log('Tick Health',cis.tradingsymbol)
    }
    
    


    if(cis.tradingsymbol.includes('NXT')){

        //block niftyt nxt
        return;
    }
//console.log('process ticks @107');

    cis.returnPoints = [];
    cis.location = {};
    
    

    setLiveMinute(cis);
  
    updateClosePriceAt59thSecond(cis)
    


 
    



  //  import {set}



  setAboveOpenScripts(cis)

    let tempHigh = tick.ohlc.high;



   // writeTickToDB(cis);

    setTimeout(() => {
        // After 3 minutes, set the stored high value to cis.highBeforeThreeMinutes
        cis.highBeforeThreeMinutes = tempHigh;

      //  console.log(cis.highBeforeThreeMinutes,'cis.highBeforeThreeMinutes',cis.tradingsymbol,'tick.ohlc.high',tick.ohlc.high,'tick lastprice',tick.last_price);
        
    }, 1 * 60 * 1000);



    cis.entryHealth='health near hanldle NO posistion'
   //if(global.seconds%20==0) console.log('health near hanldle posistion',cis.tradingsymbol,'cis.hasLivePosition',cis.hasLivePosition)


   //console.log(cis.hasLivePosition,cis.tradingsymbol,'has pos')

  // return;
    if (!cis.hasLivePosition) {

        handleNoPosition(cis, kite)
       
        
    } else {
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
    await handleOrderUpdates(order, kite);
}

 async function subscribe() {

    //console.log(global.instrumentsForMining.map(i=>i.tradingsymbol));
    
    try {
        const instrumentToken = global.instrumentsForMining.map(i=>parseInt(i.instrument_token));
        ticker.unsubscribe([]);
       


    


      
       let a=await  ticker.subscribe(instrumentToken);

       console.log(a,'tick wait ')

    


    
       if(a){

        ticker.setMode(ticker.modeFull, [instrumentToken]);
       }

       


        
    } catch (error) {
        console.error(`Error subscribing to ${global.instrumentData.name}:`, error);
    }
}



main();
