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
import moment from 'moment';

import addOrIncrementRejection from './addOrIncrementRejection.js';
import { Worker } from 'worker_threads';
const fetchWorker = new Worker('./fetchWorker.js');


const socket = io('http://tradingsimham.in:4000');  // Using a domain

// Get the instrument name from command line argument
const instrumentName = process.argv[2];
const instrumentData = instrumentsForMining.find(inst => inst.name === instrumentName);

global.instrumentsForMining=instrumentsForMining

global.allInstruments=allInstruments//.find(inst => inst.name === instrumentName);

console.log(global.allInstruments,instrumentName);


if (!instrumentData) {
    console.error(`Instrument ${instrumentName} not found in instrumentsForMining`);
    process.exit(1);
}

// Set global variables for the specified instrument
global.instrumentName = instrumentName;
global.instrumentData = instrumentData;
global.addOrIncrementRejection = addOrIncrementRejection;
global.positions = [];
global.orders = [];

// Initialize Kite Connect and database connection
let con = connectToDatabase();
let kite, ticker;

async function main() {
    try {
        const accessTokenDoc = await getTodaysAccessToken();
        kite = await getKiteConnectInstance();

        setInterval(async () => {
            global.date = new Date();
            global.day = global.date.getDay();
            global.hours = global.date.getHours();
            global.minutes = global.date.getMinutes();
            global.seconds = global.date.getSeconds();

          /*   if (global.minutes % 15 === 0 && global.seconds === 10) {
                await fetchHourlyData(kite);
            } */

            if (global.minutes=== 15 && global.seconds === 10) {
                
                fetchWorker.postMessage({ type: 'fetchHourly', kite });

                //await fetchHourlyData(kite);
            }

            if (global.seconds === 1) {
                console.log(`@ seconds 1 for ${instrumentName}`);
                
                     // Schedule fetches every minute
   
                     fetchWorker.postMessage({ type: 'fetchData', kite });
            /*     await fetchOrdersAndSetCis(kite);
                await fetchPositionsAndSetCis(kite);
                await fetchMinuteData(kite);
                 */
                console.log(`@ seconds 1 end for ${instrumentName}`);
            }



        }, 1000);

        // Start ticker and fetch initial data
       
        

             // Send an immediate fetch request to the worker on startup
             fetchWorker.postMessage({ type: 'fetchData', kite });
             initTicker();

             setTimeout(()=>{
                fetchWorker.postMessage({ type: 'fetchHourly', kite });

             },15*1000)
                    

         

     /*    await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        await fetchHourlyData(kite);
        await fetchMinuteData(kite); */

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
    


    if(cis.tradingsymbol.includes('NXT')){

        //block niftyt nxt
        return;
    }
//console.log('process ticks @107');

    cis.returns = [];
    cis.location = {};
    if (!cis.liveMinute) cis.liveMinute = {};

    if (global.seconds == 1) {
        cis.liveMinute.open = tick.last_price;
        cis.liveMinute.high = tick.last_price;
    }

    cis.liveMinute.high = Math.max(cis.liveMinute.high, tick.last_price);
    cis.liveMinute.body = Math.abs(cis.liveMinute.open - tick.last_price);
    cis.liveMinute.upperShadow = cis.liveMinute.high - Math.max(cis.liveMinute.open, tick.last_price);
    cis.liveMinute.hasLongUpperShadow = cis.liveMinute.body < cis.liveMinute.upperShadow / 2;
    
    
    cis.liveMinute.color =(tick.last_price-cis.liveMinute.open)<0?'bearish':'bullish'
    
    
    cis.liveMinute.last_price = tick.last_price;

    cis.currentMinute=cis.liveMinute;
    cis.tick = tick;


    let tempHigh = tick.ohlc.high;

    setTimeout(() => {
        // After 3 minutes, set the stored high value to cis.highBeforeThreeMinutes
        cis.highBeforeThreeMinutes = tempHigh;

       // console.log(cis.highBeforeThreeMinutes,'cis.highBeforeThreeMinutes',cis.tradingsymbol);
        
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
    try {
        const instrumentToken = parseInt(global.instrumentData.instrument_token);
        ticker.unsubscribe([]);
        ticker.subscribe([instrumentToken]);
        ticker.setMode(ticker.modeFull, [instrumentToken]);
    } catch (error) {
        console.error(`Error subscribing to ${global.instrumentData.name}:`, error);
    }
}

/* function scheduleHourlyDataFetch() {
    const now = moment();
    const currentMinute = now.minute();

    if (currentMinute < 15) {
        const delaySeconds = (15 - currentMinute) * 60 - now.seconds();
        setTimeout(() => fetchHourlyData(kite), delaySeconds * 1000);
    } else {
        const nextHour = now.startOf('hour').add(1, 'hour').add(15, 'minutes');
        const delaySeconds = nextHour.diff(now, 'seconds');
        setTimeout(() => fetchHourlyData(kite), delaySeconds * 1000);
    }
} */

main();
