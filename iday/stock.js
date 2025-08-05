// Import necessary modules at the top
import { connectToDatabase } from '../connectToDatabase.js';
import { KiteTicker } from 'kiteconnect';
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';
import moment from 'moment';
import instruAll1 from '../appv3/public/instruments/instrumentsAll.json' assert { type: 'json' };
import { detectBuySignal } from './candleStickSignals.js';
import updateOpenOrderPrice from "./updateOrder.js";
import terminalLink from 'terminal-link';
import chalk from 'chalk';
// Connect to database
let con = connectToDatabase();

const nifty50InstrumentTokens = [
    738561,  // RELIANCE
    341249,  // HDFCBANK
    895745,  // INFY
    779521,  // ICICIBANK
    408065,  // TCS
    3677697, // KOTAKBANK
    2815745, // HINDUNILVR
    951809,  // ITC
    2714625, // LT
    3465729, // AXISBANK
    1346049, // SBIN
    779369,  // HDFC
    340481,  // BHARTIARTL
    60417,   // ASIANPAINT
    7712001, // MARUTI
    897537,  // HCLTECH
    4774913, // TITAN
    3126017, // ULTRACEMCO
    2714625, // NESTLEIND
    3365633, // WIPRO
    1195009, // M&M
    633601,  // BAJFINANCE
    872961,  // ADANIENT
    2889473, // BAJAJFINSV
    1723649, // DIVISLAB
    134657,  // SUNPHARMA
    160769,  // NTPC
    4467969, // ADANIPORTS
    348929,  // TATASTEEL
    3050241, // JSWSTEEL
    112129,  // UPL
    784129,  // TECHM
    3837697, // SBILIFE
    744961,  // TATAMOTORS
    2714625, // GRASIM
    2730497, // EICHERMOT
    173057,  // BPCL
    3838721, // HEROMOTOCO
    3024129, // POWERGRID
    3060993, // ONGC
    2799361, // HDFCLIFE
    2714625, // APOLLOHOSP
    225537,  // HINDALCO
    81153,   // BRITANNIA
    4268801, // COALINDIA
    2911489, // CIPLA
    140033,  // SHREECEM
    2763265, // SBICARD
    2977281, // DRREDDY
    969473,  // INDUSINDBK
  ];
  




let instruAll=nifty50InstrumentTokens;

console.log(instruAll);




// Initialize variables for historical data
let hourlyHistoricalData = {};
let minuteHistoricalData = {};

let dayPositions=[];
let orders=[];

// Initialize variable for KiteConnect instance
let kite;

// Initialize ticker variable
let ticker;

let date,day,hours,minutes,seconds;
date=new Date();
day=date.getDay();
hours=date.getHours();
minutes=date.getMinutes();
seconds=date.getSeconds();


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
date=new Date();
day=date.getDay();
hours=date.getHours();
minutes=date.getMinutes();
seconds=date.getSeconds();


if(minutes%5==0 && seconds==10){

    //fetchHourlyData();
}

if(seconds==1){
   /*  await fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();
    await fetchMinuteData(); */
}

},1000)

        // Get today's access token
        
       // console.log('Kite Instance:', kite);

        // Initialize ticker instance
        
        initTicker();

        // Call functions to fetch historical data

/*      await fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();

        await fetchHourlyData(); */
        


     
        
        

      //  return;
        //await fetchMinuteData();



        // Schedule minute data fetch every second
       // setInterval(fetchMinuteData, 500);

        // Schedule hourly data fetch at :15th minute
        //scheduleHourlyDataFetch();
    } catch (error) {
        console.error('Error in main function:', error);
    }
}



async function fetchPositionsAndSetCis(){
    const positions = await kite.getPositions();
    const positionsDay=positions.day;
   
   
    instruAll.forEach(instrument => {
        const matchingPosition = positionsDay.find(pos => pos.tradingsymbol == instrument.tradingsymbol 


            && pos.quantity>0
        );
        if (matchingPosition) {
            instrument.position = matchingPosition
            instrument.hasLivePosition =true;
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
            const matchingOrder = orders.find(order => order.instrument_token == instrument.instrument_token);
            if (matchingOrder) {
                instrument.orderStatus = matchingOrder.status;
                instrument.orderT = matchingOrder.order_id;
                instrument.hasLiveOrder = matchingOrder.status == "OPEN";
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
    ticker.connect();

    // Subscribe to ticks and set tick mode
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);

return;
    ///process.exit();
    ticker.on("order_update", orderUpdates);
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
    

if(date.getSeconds()%3!=0){

    return;
}



if( (tick.ohlc.open>tick.last_price ||
    
    tick.total_buy_quantity<tick.total_sell_quantity )

    || tick.last_price<tick.average_traded_price


){
return

}

let cix=instruAll1.find(i=>i.instrument_token==tick.instrument_token).tradingsymbol
console.clear();
console.log('------------------');
console.log(cix);

console.log('------------------');

process.exit()

return;

    var cis=instruAll.find(i=>i.instrument_token==tick.instrument_token)

    cis.tick=tick;
    if(!cis) return;

    var hasPosition=cis.hasLivePosition
    

    if(hasPosition){
        handlePositionPresent(cis)

    }else{

        handleNoPosition(cis)
    }
    
    



   


}

function handlePositionPresent(cis){


/// checkForTargetOrder

let target_order=orders.
find((i)=>i.tradingsymbol==cis.tradingsymbol && 
i.status=='OPEN' && i.transaction_type=='SELL'
);



if(!target_order){

    return;
}
//console.log(target_order,'to');


// else  placetargetOrder//

if(!target_order && cis.hasLivePosition && (!cis.hasPlacedTarget)){

    console.log('is there a live postion without target?',cis.tradingsymbol,cis.hasLiveOrder,cis.hasLivePosition,cis.hasPlacedOrder,cis.hasBuySignal);
    

  //process.exit();
  
//placeTargetOrderForScript(cis);
cis.hasPlacedTarget=true


    return;
}



let squareOff=false;
   

switch (true){

    case (cis.tick.ohlc.open>cis.tick.last_price && !cis.updated):
        squareOff=true;
        console.log(`Danger ${cis.tradingsymbol} is below opening price, order id is ${orders.find(o=>o.tradingsymbol==cis.tradingsymbol).order_id}`);
    
    break;

    case (cis.hourlyHigh<cis.tick.last_price  &&  !cis.updated && date.getHours()!=9):
        squareOff=true;
        console.log(`Danger ${cis.tradingsymbol} is below last hourly high, order id is ${orders.find(o=>o.tradingsymbol==cis.tradingsymbol).order_id}`);
    
    break;


}




    if(squareOff){
//console.log('after sq off');

        if(!cis.updated){

            //console.log('danger ',orders)
        
            if(orders.length!=0){
        
               let order= orders.find(o=>o.tradingsymbol==cis.tradingsymbol && o.status=='OPEN')

               if(order){

                let order_id=order.order_id;
                updateOpenOrderPrice(kite,order_id, cis.instrument_token, cis.tick.last_price);
                cis.updated=true;
               }
                
        
            }
          
        
        }
    }

}

async function placeTargetOrderForScript(cis){
    await  fetchOrdersAndSetCis();
    await fetchPositionsAndSetCis();
    

    if(cis.placedTarget){

return;
    }
    

    cis.placedTarget=true;

    if(!cis.position){

        console.log(chalk.blue('positon not found in order updates'));
        return
    }
    const orderParams = {
        exchange: "NFO", // or other exchanges as per requirement
        tradingsymbol: cis.tradingsymbol,
        transaction_type: "SELL", // or "SELL"
        order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
        quantity: cis.position.quantity, // specify the quantity
        price: Math.ceil(cis.position.buy_price)+6,
        product: "NRML", // or "CNC", "NRML"
        validity: "DAY", // or "IOC"
    };
    
    try {
        const orderId = await kite.placeOrder("regular", orderParams);
        console.log(global.clock+ " Order placed successfully. Order ID:", orderId);
        //cis.ordered=false;
      //  cis.hasLivePosition=false;
    } catch (error) {
        console.error("Error placing order:", error);
    }


}
function handleNoPosition(cis){



    if(cis.tick.last_price>cis.tick.ohlc.open){

        handleTickAboveOpen(cis)
      

    }

   
}
async function handleTickAboveOpen(cis){
    

  var x=isTickAboveHourlyHistoricalValue(cis)

  try {


    const aggregatedCandle = getCurrentHourlyCandleFromMinuteCandle(cis.minuteData);

    cis.liveHourHandle=aggregatedCandle;
    console.log('Aggregated Candle:', aggregatedCandle);

   // process.exit()
} catch (error) {
    console.error(error.message);
}


  if(x){

    
    




    

    let minuteCandle=cis.minuteData
if(!minuteCandle) return;
    let last_candle=minuteCandle[minuteCandle.length-1];

   

    if(last_candle){
        cis.last_candle=last_candle;
        
      let ti=  convertToIndianTime(last_candle.date)
      cis.lastCandleTime=ti
       

      const hasBuySignal = detectBuySignal(cis.minuteData);

      if(hasBuySignal && (cis.ordered==undefined || cis.ordered==false && 
        
        cis.tick.last_price>(cis.last_candle.high*1.005) /// added new condtion only if it breaks last candle high
    
    
    ) ){
//debugger;
        cis.ordered=true;

        let obj={
            
            "NIFTY":72,
            
           // "BANKNIFTY":60,
            "BANKNIFTY":60,
            'MIDCPNIFTY':56,
            "FINNIFTY":40
          }
let multiplier;

Object.keys(obj).forEach(key => {
    if (cis.tradingsymbol.includes(key)) {
      multiplier = obj[key];
    }
  });
  
  
  if(typeof multiplier =='undefined'){
  
    multiplier =10
  } ;
  
  //multiplier=1;
  //99176

  multiplier=2;
        const orderParams = {
            exchange: "NFO", // or other exchanges as per requirement
            tradingsymbol:cis.tradingsymbol,
            transaction_type: "BUY", // or "SELL"
            order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
            quantity: cis.lot_size* multiplier, // specify the quantity
            price: cis.tick.last_price,
            product: "NRML", // or "CNC", "NRML"
            validity: "DAY", // or "IOC"
        };
    
        try {
            const orderId = await kite.placeOrder("regular", orderParams);
            console.log(global.clock+ " Order placed successfully. Order ID:", orderId);
        } catch (error) {
            console.error("Error placing order:", error);
        }

        console.log(cis.tradingsymbol,'has buy signal',hasBuySignal);

      }

      //console.log(cis.tradingsymbol, ti)

    }
   

    
  

}




}

function getCurrentHourlyCandleFromMinuteCandle(candles) {
    // Function to get the start time of the nearest 15-minute interval from the completed hour
    function getStartTime(date) {
        const start = new Date(date);
        start.setMinutes(0, 0, 0); // Reset minutes and seconds to 0
        const hour = start.getHours();
        if (start.getMinutes() > 15) {
            start.setHours(hour, 15, 0, 0); // Set to the nearest 15-minute interval after the completed hour
        } else {
            start.setHours(hour, 0, 0, 0); // Set to the completed hour
        }
        return start;
    }

    const currentTime = new Date();
    const startTime = getStartTime(currentTime);

    // Filter candles within the time range
    const relevantCandles = candles.filter(candle => candle.date >= startTime && candle.date <= currentTime);

    if (relevantCandles.length == 0) {
        throw new Error('No relevant candles found within the specified time range.');
    }

    // Aggregate OHLC values
    const aggregatedCandle = relevantCandles.reduce((acc, candle) => {
        acc.open = acc.open == null ? candle.open : acc.open; // Use the first open price
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

    return aggregatedCandle;
}



function isTickAboveHourlyHistoricalValue(cis){
let tick=cis.tick;
const lnk = terminalLink('Chart', cis.chart); // Replace with your actual URL

    
let a1=  hourlyHistoricalData[tick.instrument_token]
if(!a1){

    return false;
}
let a=a1.map(a1=>a1.high)

.sort((a,b)=>a-b);

//console.log(a);

//process.exit();


   

    if(a && (a[a.length-1]<tick.last_price))
        console.log(chalk.green('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk}`))
    else
console.log(chalk.red('The breath',cis.tradingsymbol,`open= ${tick.ohlc.open}    last price hourly ( ${tick.last_price} ,  ${a[a.length-1]} ) ohlc high:${tick.ohlc.high},Chart :${lnk}`))

  
        
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
    // Create a Date object from the UTC time string
    const utcDate = new Date(utcTimeString);

    // Set the time zone to Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata' };

    // Format the date and time using IST
    const indianTimeString = utcDate.toLocaleString('en-IN', options);

    return indianTimeString;
}






// Function to subscribe to instruments for ticker
async function subscribe() {
    try {
        const instrument_tokens = instruAll//.map(a => parseInt(a.instrument_token));
       // console.log('Subscribing to instruments:', instrument_tokens);

        // Subscribe to instruments
        ticker.subscribe(instrument_tokens);
        ticker.setMode(ticker.modeFull, instrument_tokens);
    } catch (error) {
        console.error('Error subscribing to instruments:', error);
    }
}

// Function to fetch hourly historical data
async function fetchHourlyData() {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let toTime;

        if (now.hour() == 9) {
            toTime = now.subtract(5,'minute').
            
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
        const instrument_tokens = instruAll//.map(a => parseInt(a.instrument_token));

        //console.log('Fetching hourly data for instruments:', instrument_tokens.length,'from ',fromTime,'To :',toTime);

        // Fetch all hourly historical data
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);

        Object.keys(hourlyHistoricalData).forEach((key)=>{

            let  cis=instruAll.find(i=>i.instrument_token==key);
            cis.hourlyHistoricalData=hourlyHistoricalData[key];

      
            
            hourlyHistoricalData[key].forEach((h)=>{

h.time=convertToIndianTime(h.date);
            });

            //console.log(hourlyHistoricalData[key]);

            //process.exit();


            

            cis.hourlyHigh= hourlyHistoricalData[key][hourlyHistoricalData[key].length-1].high
            
            cis.hourlyHighTime= convertToIndianTime(
                
                hourlyHistoricalData[key][hourlyHistoricalData[key].length-1].date
               
             
            );             
            
            
           
        })

       // console.log('Hourly Historical Data:', hourlyHistoricalData);
    } catch (error) {
        console.error('Error fetching hourly data:', error);
    }
}

// Function to fetch minute historical data
async function fetchMinuteData() {
    try {
        const now = moment();
        const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss');
        const dataType = 'minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));

      // console.log('Fetching minute data for instruments:', instrument_tokens);

        // Fetch all minute historical data
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);

        Object.keys(minuteHistoricalData).forEach((key)=>{

            let  cis=instruAll.find(i=>i.instrument_token==key);
            cis.minuteData=minuteHistoricalData[key];

            //cis.hourlyHigh= hourlyHistoricalData[key][hourlyHistoricalData[key].length-1].high
            cis.lastMinuteTime= convertToIndianTime(
                
                minuteHistoricalData[key][minuteHistoricalData[key].length-1].date
               
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
            if (dataType == '60minute') {
                hourlyHistoricalData[instrument] = data;
            } else if (dataType == 'minute') {
                minuteHistoricalData[instrument] = data;
            }

            // Delay before fetching next instrument data (if needed)
            await new Promise(resolve => setTimeout(resolve, 333)); // Adjust delay as needed
        }
    } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
    }
}

// Function to handle order updates from ticker
async function orderUpdates(order) {

    let cis=instruAll.find(i=>i.instrument_token==order.instrument_token)

if(!cis) return;

  if(order.status=='COMPLETE' && order.transaction_type=='SELL'){
cis.ordered=false;
  cis.hasLivePosition=false;
  cis.updated=false;
  cis.placedTarget=false;
  cis.hasPlacedTarget=false;
  

  await  fetchOrdersAndSetCis();
  await fetchPositionsAndSetCis();
  }

    if(order.status=='COMPLETE' && order.transaction_type=='BUY'){

     await  fetchOrdersAndSetCis();
await fetchPositionsAndSetCis();


const orderParams = {
    exchange: "NFO", // or other exchanges as per requirement
    tradingsymbol: order.tradingsymbol,
    transaction_type: "SELL", // or "SELL"
    order_type: "LIMIT", // or "MARKET", "SL", "SL-M"
    quantity: order.quantity, // specify the quantity
    price: order.price+6,
    product: "NRML", // or "CNC", "NRML"
    validity: "DAY", // or "IOC"
};

try {
    const orderId = await kite.placeOrder("regular", orderParams);
    cis.hasPlacedTarget=true;
    console.log(global.clock+ " Order placed successfully. Order ID:", orderId);
    //cis.ordered=false;
  //  cis.hasLivePosition=false;
} catch (error) {
    console.error("Error placing order:", error);
}
    }
    // Handle order updates here
   // console.log('Order Update:', order);
    // Add your logic to process order updates as needed
}

// Function to schedule hourly data fetch at :15th minute
function scheduleHourlyDataFetch() {
    const now = moment();
    const currentMinute = now.minute();

    if (currentMinute < 15) {
        const delaySeconds = (15 - currentMinute) * 60 - now.seconds();
        setTimeout(fetchHourlyData, delaySeconds * 1000);
    } else {
        const nextHour = now.startOf('hour').add(1, 'hour').add(15, 'minutes');
        const delaySeconds = nextHour.diff(now, 'seconds');
        setTimeout(fetchHourlyData, delaySeconds * 1000);
    }
}


import fs from 'fs';
import { time } from 'console';

// Create a writable stream
//const logFile = fs.createWriteStream(`app${Date('dd-mm-yy')}.log`, { flags: 'a' });

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
