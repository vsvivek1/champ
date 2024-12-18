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

import addOrIncrementRejection from './addOrIncrementRejection.js';
import { Worker } from 'worker_threads';
const fetchWorker = new Worker('./fetchWorker.js');



const socket = io('http://tradingsimham.in:4000');  // Using a domain

import niftyTrading from './intraday/niftyTrading.json' assert { type: "json" };
import setAboveOpenScripts from './setAboveOpenScripts.js';
import setLiveMinute from './setLiveMinute.js';

// Get the instrument name from command line argument]]
const instrumentName = process.argv[2];   // from start instrument script , type is catched here


global.instrumentName=instrumentName;




const instrumentData =[];

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


        if(global.instrumentName!='STK'){



            //// to prevent mis 
           // return;
        }
        

        if(global.hours>14|| global.hours<9 ||(global.hours==15 && global.minutes>30) ||(global.hours==9 && global.minutes<15)){

            console.log('Exiting the code out of time');

           // return 
        }
        
   
        const accessTokenDoc = await getTodaysAccessToken();
        kite = await getKiteConnectInstance();

        setInterval(async () => {
            global.date = new Date();
            global.day = global.date.getDay();
            global.hours = global.date.getHours();
            global.minutes = global.date.getMinutes();
            global.seconds = global.date.getSeconds();

         global.clock=   ` Time:${global.hours}:${global.minutes}:${global.seconds}`

          /*   if (global.minutes % 15 === 0 && global.seconds === 10) {
                await fetchHourlyData(kite);
            } */

            if (global.minutes=== 15 && global.seconds === 10 &&  instrumentName!='STK') {
                
               // fetchWorker.postMessage({ type: 'fetchHourly', kite });

                await fetchHourlyData(kite);
            }

            if (global.seconds === 1) {
               // console.log(`@ seconds 1 for ${instrumentName}`);
                
                     // Schedule fetches every minute
   
                    // fetchWorker.postMessage({ type: 'fetchData', kite });
                 await fetchOrdersAndSetCis(kite);
                await fetchPositionsAndSetCis(kite);
                await fetchMinuteData(kite);
                 
             //   console.log(`@ seconds 1 end for ${instrumentName}`);
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
         await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        await fetchHourlyData(kite);
        await fetchMinuteData(kite); 

       // scheduleHourlyDataFetch();
    } catch (error) {
        console.error(`Error in main function for ${instrumentName}:`, error);
    }
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

    
    
    ticks.forEach(tick => processTicks(tick));
}



function processTicks(tick) {

   
    var cis = global.instrumentsForMining.find(i => i.instrument_token == tick.instrument_token);
    


   
   
    
    if (!cis) return;

    cis.tick = tick; 

    if(global.minutes==30 && global.seconds==1){

        console.log('Tick Health',cis.tradingsymbol)
    }
    
    


    if(cis.tradingsymbol.includes('NXT')){

        //block niftyt nxt
        return;
    }
//console.log('process ticks @107');

    cis.returns = [];
    cis.location = {};
    
    

    setLiveMinute(cis);
  
    
    if(cis.tradingsymbol=="MIDCPNIFTY24DEC13050CE"){


        //// for any logs or chek 
        console.log(cis.tradingsymbol,'is now',cis.liveMinute.color,'cis.liveMinute.t1',cis.liveMinute.t1,'tick.last_price=',tick.last_price,global.seconds)
    }
    



  //  import {set}



  setAboveOpenScripts()

    let tempHigh = tick.ohlc.high;



   // writeTickToDB(cis);

    setTimeout(() => {
        // After 3 minutes, set the stored high value to cis.highBeforeThreeMinutes
        cis.highBeforeThreeMinutes = tempHigh;

      //  console.log(cis.highBeforeThreeMinutes,'cis.highBeforeThreeMinutes',cis.tradingsymbol,'tick.ohlc.high',tick.ohlc.high,'tick lastprice',tick.last_price);
        
    }, 1 * 60 * 1000);

    if (cis.hasLivePosition) {
       // console.log('cis has position @126');
        handlePositionPresent(cis, kite);
    } else {

       // console.log('cis has no position @130');
        handleNoPosition(cis, kite);
    }
    
    socket.emit('sendCis', cis);
}


async function orderUpdates(order) {
    await handleOrderUpdates(order, kite);
}

async function subscribe() {

    console.log(global.instrumentsForMining.map(i=>i.tradingsymbol));
    
    try {
        const instrumentToken = global.instrumentsForMining.map(i=>parseInt(i.instrument_token));
        ticker.unsubscribe([]);
       
       
      //  ticker.setMode('full', [instrumentToken]);

     let a= ticker.setMode('full', [instrumentToken]);


      ticker.setMode(ticker.modeFull, [instrumentToken]);


      
        ticker.subscribe(instrumentToken);


        
    } catch (error) {
        console.error(`Error subscribing to ${global.instrumentData.name}:`, error);
    }
}



main();
