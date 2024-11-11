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
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis, fetchHourlyData, fetchMinuteData,aggregateOHLC } from './fetchData.js';

import { handleOrderUpdates } from './orderUtils.js';
import { updateOpenOrderPrice } from './orderUtils.js';
import { displayScripts } from './displayScripts.js';
import moment from 'moment';

//import r


import addOrIncrementRejection from './addOrIncrementRejection.js';

//const socket = io('http://localhost:4000');

const socket = io('http://tradingsimham.in:4000');  // Using a domain


//import { startLogging } from './logger.js';

// Start the logging mechanism
//startLogging();


let con = connectToDatabase();
let kite, ticker;
 global.date, global.day, global.hours, global.minutes, global.seconds;

global.date = new Date();
global.day = global.date.getDay();
global.hours = global.date.getHours()
global.minutes = global.date.getMinutes();
global.seconds = global.date.getSeconds();

global.addOrIncrementRejection = addOrIncrementRejection;

// Declare global variables
global.positions = [];
global.orders = [];
global.instrumentsForMining=instrumentsForMining

global.allInstruments=allInstruments;

async function main() {
    try {



        const accessTokenDoc = await getTodaysAccessToken();
        kite = await getKiteConnectInstance();

        setInterval(async () => {
            global.date = new Date();
            global.day = global.date.getDay();
            global.hours = global.date.getHours()
            global.minutes = global.date.getMinutes();
            global.seconds = global.date.getSeconds();

            if (global.minutes % 5 === 0 && global.seconds === 10) {
                fetchHourlyData(kite);
            }

            if (global.seconds ==1) {

                console.log('@ seconds 1');
                
                await fetchOrdersAndSetCis(kite);
                await fetchPositionsAndSetCis(kite);
                await fetchMinuteData(kite);
                //aggregateOHLC(cis);

                console.log('@ seconds 1 end');
            }



          

        }, 1000);

let i=global.instrumentsForMining[0];

//console.log(i);


if(i.minuteData){

    regressionBreakoutTrading(i);
}






        initTicker();

       // console.log(instrumentsForMining);
        
        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        await fetchHourlyData(kite);
        await fetchMinuteData(kite);
        //aggregateOHLC(cis) 
        scheduleHourlyDataFetch();
        

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

function initTicker() {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.disconnect//();
    ticker.connect();
    ticker.on("connect", subscribe);
    ticker.on("ticks", onTicks);
    ticker.on("order_update", orderUpdates);
}

function onTicks(ticks) {

    //console.log('on ticks 86');
    
    extractTicks(ticks);
}

function extractTicks(ticks) {
    for (let i = 0; i < ticks.length; i++) {

       // console.log('extract ticks @94');
        
        processTicks(ticks[i]);
    }
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
        const instrument_tokens = global.instrumentsForMining.map(a => parseInt(a.instrument_token));

        ticker.unsubscribe([]);
        ticker.subscribe(instrument_tokens);

        ticker.setMode(ticker.modeFull, instrument_tokens);
    } catch (error) {
        console.error('Error subscribing to instruments:', error);
    }
}

function scheduleHourlyDataFetch() {
    const now = moment();
    const currentMinute = now.minute();

    if (currentMinute < 15) {
        const delayseconds = (15 - currentMinute) * 60 - now.seconds();
        setTimeout(() => fetchHourlyData(kite), delayseconds * 1000);
    } else {
        const nextHour = now.startOf('hour').add(1, 'hour').add(15, 'global.minutes');
        const delayseconds = nextHour.diff(now, 'global.seconds');
        setTimeout(() => fetchHourlyData(kite), delayseconds * 1000);
    }
}


setInterval(() => {
    const now = new Date();
    global.day = now.getDay();
    global.hours = now.getHours();
    global.minutes = now.getMinutes();

    // Define the time window: Weekdays from 9:15 AM to 3:30 PM
    const isWeekday = global.day >= 1 && global.day <= 5; // Monday to Friday
    const isWithinTimeWindow = (global.hours > 9 || (global.hours === 9 && global.minutes >= 15)) &&
                               (global.hours < 15 || (global.hours === 15 && global.minutes <= 30));

    if (isWeekday && isWithinTimeWindow) {
        if (!global.isMainRunning) {
            global.isMainRunning = true;
            console.log("Running main() within time window.");
            main();
        }
    } else {
        if (global.isMainRunning) {
            console.log("Time window ended or it's a weekend. Resetting flag.");
        }
        global.isMainRunning = false; // Reset the flag outside of the time window
    }
}, 1 * 60 * 1000); 
