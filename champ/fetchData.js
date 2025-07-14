import moment from 'moment';
import { calculateVolatility } from './compareVolatility.js';

import { Instrument } from './InstrumentClass.js';

import calculateMovingAverage from './calculateMovingAverage.js';
import { findDemandZones } from './findDemadZones.js';
import { calculate20MA } from './calculate20Ma.js';
import { placeTargetIfNotTargetSet } from './placeTargetIfNotTargetSet.js';
import {RSI} from 'technicalindicators';

function setRSI(cis){

const closePrices = cis.minuteData.map(candle => candle.close);

// Step 2: Define RSI input
const rsiInput = {
  values: closePrices,
  period: 14,  // You can adjust this
};

// Step 3: Calculate RSI
const rsiValues = RSI.calculate(rsiInput);

// Step 4: Attach RSI values back to cis.minuteData
// The first (period - 1) entries won’t have RSI, so we align it properly

const offset = rsiInput.period - 1;

cis.minuteData.forEach((candle, index) => {
  if (index >= offset) {
    candle.rsi = rsiValues[index - offset];
  } else {
    candle.rsi = null; // Or leave undefined
  }
});


}

// Initialize variables for historical data
let hourlyHistoricalData = {};
let minuteHistoricalData = {};


export function aggregateOHLC(cis) {
    const minuteData = cis.minuteData; // The array of OHLC data (Open, High, Low, Close)

    const startMinuteIndex = 9 * 60 + 15; // 9:15 AM in minutes
    let dataAfter915 = minuteData.slice(startMinuteIndex);

    // Helper function to aggregate OHLC data
    function aggregateCandles(data) {
        const open = data[0].open;
        const close = data[data.length - 1].close;
        const high = Math.max(...data.map(candle => candle.high));
        const low = Math.min(...data.map(candle => candle.low));
        return { open, high, low, close };
    }

    // Function to group data into specified time frames
    function groupIntoTimeFrames(data, frameSize) {
        const grouped = [];
        for (let i = 0; i < data.length; i += frameSize) {
            const frameData = data.slice(i, i + frameSize);
            if (frameData.length === frameSize) { // Only complete frames
                grouped.push(aggregateCandles(frameData));
            }
        }
        return grouped;
    }

    // Aggregate data for each time frame and set it to cis object
    cis.ohlc15Min = groupIntoTimeFrames(dataAfter915, 15); // 15-minute candles
    cis.ohlc30Min = groupIntoTimeFrames(dataAfter915, 30); // 30-minute candles
    cis.ohlc1Hour = groupIntoTimeFrames(dataAfter915, 60); // 1-hour candles
}




async function placeReverseOrderWithTarget(pos,kite) {
  if (!pos || !pos.quantity || !pos.average_price) {
    console.error("Invalid position object");
    return;
  }

  const isShort = pos.quantity < 0;
  const reverseQuantity = Math.abs(pos.quantity) * 2;
  const transaction_type = isShort ? "BUY" : "SELL";

const targetPrice = isShort
    ? pos.average_price * 0.75
    : pos.average_price * 1.25;

  const order = {
    tradingsymbol: pos.tradingsymbol,
    exchange: pos.exchange,
    quantity: reverseQuantity,
    price: parseFloat(targetPrice.toFixed(2)),
    order_type: "LIMIT", // Or "MARKET" if desired
    product: "MIS",       // or "NRML", etc.
    transaction_type,
    validity: "DAY"
  };


 return await kite.placeOrder("regular",order)
 // placeOrder(order); // This function must be defined elsewhere
}


// Function to fetch orders and set CIS data
export async function fetchOrdersAndSetCis(kite) {
    try {
        global.orders = await kite.getOrders(); // Upglobal.date global variable

        orders.forEach(order => {
            const matchingInstrument =global.instrumentsForMining.
            
            find(instrument => instrument.instrument_token === order.instrument_token);
            
            if (matchingInstrument) {

                
                matchingInstrument.orderStatus = order.status;
                matchingInstrument.orderT = order.order_id;
                matchingInstrument.hasLiveOrder = order.status === "OPEN";
            } else {




                const instrument =global.instrumentsForMining.find(instrument => instrument.instrument_token === order.instrument_token);
                if (instrument) {
                    instrument.orderStatus = order.status;
                    instrument.orderT = order.order_id;
                    instrument.hasLiveOrder = order.status === "OPEN";
        
                    // Push the instrument toglobal.instrumentsForMining
                   global.instrumentsForMining.push(instrument);
                
                
                    if( matchingInstrument.hasLivePosition){


                        console.log('order status','liveorder',matchingInstrument.hasLiveOrder,'live pos',matchingInstrument.hasLivePosition)

                    }


                
                }
            }
        });






    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

// Function to fetch positions and set CIS data
export async function fetchPositionsAndSetCis(kite) {
    try {


      
    
    
        let i=  global.instrumentsCat.indexOf(process.argv[2]);
          const delayMs = (global.seconds) * 1000*i;
 await new Promise(resolve => setTimeout(resolve, delayMs));

  // console.log('fetch positions',global.instrumentName,process.argv[2],global.instrumentsCat,global.seconds);

// if(global.seconds%i==0){

//     console.log('fetch positions not in time',global.seconds,i,global.instrumentName,global.seconds)
//     return;
// }

        const response = await kite.getPositions();

        const orders=await kite.getOrders();
       

        global.positions = response.day; // Update global.positions with the fetched data

        global.orders=orders;

     global.instrumentsForMining.forEach(async instrument => {
    const pos = global.positions.find(p => p.tradingsymbol === instrument.tradingsymbol);

    const finalPos = pos || {
        tradingsymbol: instrument.tradingsymbol,
        quantity: 0,
        average_price: 0,
        instrument_token: instrument.instrument_token,
    };

    instrument.position = finalPos;
    instrument.hasLivePosition = finalPos.quantity !== 0;
    instrument.positionStatus = finalPos.quantity !== 0;

    if (finalPos.quantity !== 0) {
        instrument.buyPrice = finalPos.average_price;
        instrument.stopLossPrice = instrument.buyPrice - 5;

        const revorder = orders.filter(o =>
            o.status === 'OPEN' && o.instrument_token === finalPos.instrument_token
        );

        if (revorder.length === 0) {
            // Awaiting reverse order logic
            // await placeReverseOrderWithTarget(finalPos, kite);
        }
    }
});


    } catch (error) {
        console.error("Error fetching positions:", error,global.date,global.seconds);
    }
}


// Function to fetch hourly data and upglobal.date CIS
export async function fetchHourlyData(kite) {
    try {

        if(global.instrumentName=='STK'){

   // return
        }
        const now = moment();
        let fromTime = moment().startOf('day').subtract(1, 'days').add(13, 'global.hours').format('YYYY-MM-DD HH:mm:ss');
        let toTime = now.format('YYYY-MM-DD HH:mm:ss');
        const dataType = '60minute';
        const instrument_tokens = [...new Set(global.allInstruments.map(a => parseInt(a.instrument_token)))];



       // console.log('total instruments ',instrument_tokens .length)
       
       
       // await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType, hourlyHistoricalData);
       
       
       // console.time('Execution Time');

        
       global.instrumentsForMining.forEach(instrument => {

           
            instrument.hourlyHistoricalData = hourlyHistoricalData[instrument.instrument_token];
            if (instrument.hourlyHistoricalData) {
                const lastHourlyData = instrument.hourlyHistoricalData[instrument.hourlyHistoricalData.length - 1];

                if(lastHourlyData ){

                    instrument.hourlyHigh = lastHourlyData.high;
                    instrument.hourlyHighTime = convertToIndianTime(lastHourlyData.date);
                }
               
            }
        });
    } catch (error) {
        console.error("Error fetching hourly data:", error);
    }

  //  console.timeEnd('Execution Time');
}

// Function to fetch minute data and upglobal.date CIS
export async function fetchMinuteData(kite) {
    try {

        if(global.instrumentName=='STK'){

        return
                }
        const now = moment();
        const fromTime = moment().startOf('day').add(9, 'global.hours').add(15, 'global.minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss');
       
if(global.instrumentName=='STK'){

    var dataType = '5minute';
}else{

    var dataType = 'minute';
}
       
     
        const instrument_tokens = global.instrumentsForMining.map(a => parseInt(a.instrument_token));

        

       // console.log('fetch all data start');
        
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType, minuteHistoricalData);


      //  console.log('fetch all data stop','global.allInstruments len',global.allInstruments.length);
       
       var instrument;
        global.instrumentsForMining.forEach(instrument1 => {



        //  let a=   global.instrumentsForMining.find(i=>i.instrument_token==instrument1.instrument_token);


        //  if(typeof a=='undefined'){


        //     return;
        //  }
        //  console.log(a.tradingsymbol,'from fetch minute data')


        // process.exit();

            instrument=instrument1;
           /// console.log('instrument token',instrument.tradingsymbol,typeof instrument.minuteData,'=mindata len');   check later
            
            instrument.minuteData = minuteHistoricalData[instrument.instrument_token];


            if(instrument && instrument.minuteData && instrument.minuteData.length>0){
                setRSI(instrument);

            }


           // console.log('from minute data',instrument.minuteData )
            if (instrument.minuteData && instrument.minuteData.length>0) {

                //console.log('from here 2')
                instrument.highestPointAfter12PM = highestPointAfter12PM(instrument.minuteData);
                instrument.minuteCandleMedianRange = findMedianRange(instrument.minuteData);
                instrument.minuteCandleMeanRange = findMeanRange(instrument.minuteData);


                instrument.ma5high=calculateMovingAverage(instrument.minuteData, 5, 'high')
                instrument.ma5low=calculateMovingAverage(instrument.minuteData, 5, 'low')

                instrument.ma20=calculate20MA(instrument.minuteData);


                const lastFiveCandles = instrument.minuteData//.slice(-5);
                const lastFiveVolatility = calculateVolatility(lastFiveCandles);
            
                let averageRange=calculateVolatility(lastFiveCandles);

                instrument.averageRange=


                instrument.averageRange=isNaN(averageRange)?100: averageRange;


            findDemandZones(instrument);

           
;


                const targetPoints = 5; // Adjust target points as neede

                instrument.lastCandle = instrument.minuteData[instrument.minuteData.length - 1];
                if (instrument.lastCandle) {
                    instrument.lastCandle.range = instrument.lastCandle.high - instrument.lastCandle.low;
                }

                const aggregatedCandle = getCurrentHourlyCandleFromMinuteCandle(instrument.minuteData);
                instrument.liveHourCandle = aggregatedCandle;

                if( aggregatedCandle){

                    instrument.liveCandleRange = aggregatedCandle.high - aggregatedCandle.low;

                }



              
               // console.log(instrument.minuteData,'instrument.minuteData @132 new fetch');
                
                instrument.lastMinuteTime = convertToIndianTime(instrument.minuteData[instrument.minuteData.length - 1].date);
            }


            

        });


     

        
    } catch (error) {
        console.error("Error fetching minute datax:", error,instrument.tradingsymbol);
    }
}

// Helper function to fetch all data
async function fetchAllData(kite, instruments, fromTime, toTime, dataType, historicalData) {

//console.time('start fetching stok minute data1')
    if(global.instrumentName=='STK'){

        console.log(instruments,'instruments')

        return
            }
    let index = 0;


    let pvsinstrument_token=''

    const intervalId = setInterval(async () => {


        if (index >= instruments.length) {

          //  console.timeEnd('start fetching stok minute data1')
            clearInterval(intervalId); // Clear interval when all instruments are processed
            return;
        }

        let instrument = instruments[index];

        try {



            if(pvsinstrument_token==instrument) return;

      
            pvsinstrument_token=instrument;

            let i=new Instrument(instrument)

            let ts=i.getTradingSymbol()
//console.log('historic call',ts)
            const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);
// console.log(index,'minute data fetched',instrument,
//     global.instrumentName,global.allInstruments.find(i=>i.instrument_token==instrument).tradingsymbol)



            if (!data) {
                console.log('Issue in fetching historical data for', instrument);
            }

            let script =global.instrumentsForMining.find(i => i.instrument_token == instrument);
            if (script) {
                script.minuteData = data;

               /*  if(data){
               //     console.log(script.tradingsymbol, 'minutedata addded');

                }
                 */
            }

            historicalData[instrument] = data;

        
        } catch (error) {
            console.log(global.instrumentName,{instrument},'global.instrumentName')

            console.log(global.allInstruments.find(i=>i.instrument_token==instrument),'here')


            console.error(`Error fetching ${dataType} data for ${instrument}:`, error);
           // process.exit()
           
        }


        index++; 
      // Move to the next instrument
    }, 500
    
    
    // (1/2)*1000

); // Adjust interval duration as needed
}


// Convert UTC to Indian Time
function convertToIndianTime(utcTimeString) {
    const utcdate = new Date(utcTimeString);
    const options = { timeZone: 'Asia/Kolkata' };
    const indianTimeString = utcdate.toLocaleString('en-IN', options);
    return indianTimeString;
}

// Function to calculate the highest point after 12 PM
function highestPointAfter12PM(ohlcData) { 
    if (!ohlcData || ohlcData.length < 225) {
        return -1;
    } else {
        let strippedData = ohlcData.slice(225);
        let highestPoint = Math.max(...strippedData.map(entry => entry.high));
        return highestPoint;
    }
}

// Function to find the median range
function findMedianRange(ohlcData) {
    const ranges = ohlcData.map(data => data.high - data.low);
    ranges.sort((a, b) => a - b);
    const midIndex = Math.floor(ranges.length / 2);
    if (ranges.length % 2 === 0) {
        return (ranges[midIndex - 1] + ranges[midIndex]) / 2;
    } else {
        return ranges[midIndex];
    }
}

// Function to find the mean range
function findMeanRange(ohlcData) {
    const totalRange = ohlcData.reduce((sum, data) => sum + (data.high - data.low), 0);
    return totalRange / ohlcData.length;
}

// Function to get the current hourly candle from minute candles
function getCurrentHourlyCandleFromMinuteCandle(candles) {
    function getStartTime(date) {
        const start = new Date(date);
        start.setMinutes(0, 0, 0);
        const hour = start.getHours();
        if (start.getMinutes() > 15) {
            start.setHours(hour, 15, 0, 0);
        } else {
            start.setHours(hour, 0, 0, 0);
        }
        return start;
    }

    const currentTime = new Date();
    const startTime = getStartTime(currentTime);

    const relevantCandles = candles.filter(candle => candle.date >= startTime && candle.date <= currentTime);

    if (relevantCandles.length === 0) {
        return null;
    }

    const aggregatedCandle = relevantCandles.reduce((acc, candle) => {
        acc.open = acc.open === null ? candle.open : acc.open;
        acc.close = candle.close;
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
