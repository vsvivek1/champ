import moment from 'moment';

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


// Function to fetch orders and set CIS data
export async function fetchOrdersAndSetCis(kite) {
    try {
        global.orders = await kite.getOrders(); // Upglobal.date global variable

        orders.forEach(order => {
            const matchingInstrument = global.instrumentsForMining.find(instrument => instrument.instrument_token === order.instrument_token);
            
            if (matchingInstrument) {
                matchingInstrument.orderStatus = order.status;
                matchingInstrument.orderT = order.order_id;
                matchingInstrument.hasLiveOrder = order.status === "OPEN";
            } else {
                const instrument = global.allInstruments.find(instrument => instrument.instrument_token === order.instrument_token);
                if (instrument) {
                    instrument.orderStatus = order.status;
                    instrument.orderT = order.order_id;
                    instrument.hasLiveOrder = order.status === "OPEN";
        
                    // Push the instrument to global.instrumentsForMining
                    global.instrumentsForMining.push(instrument);
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
        const response = await kite.getPositions();
        global.positions = response.day; // Update global.positions with the fetched data

        global.positions.forEach(pos => {
            if (pos.quantity > 0) {
                let matchingInstrument = global.instrumentsForMining.find(instrument => instrument.tradingsymbol === pos.tradingsymbol);

                if (matchingInstrument) {
                    matchingInstrument.position = pos;
                    matchingInstrument.hasLivePosition = true;
                    matchingInstrument.buyPrice = pos.average_price;
                } else {
                    const instrument = global.allInstruments.find(instrument => instrument.tradingsymbol === pos.tradingsymbol);
                    if (instrument) {
                        instrument.position = pos;
                        instrument.hasLivePosition = true;
                        instrument.buyPrice = pos.average_price;

                        // Push the instrument to global.instrumentsForMining
                        global.instrumentsForMining.push(instrument);
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching positions:", error);
    }
}


// Function to fetch hourly data and upglobal.date CIS
export async function fetchHourlyData(kite) {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').subtract(1, 'days').add(13, 'global.hours').format('YYYY-MM-DD HH:mm:ss');
        let toTime = now.format('YYYY-MM-DD HH:mm:ss');
        const dataType = '60minute';
        const instrument_tokens = global.instrumentsForMining.map(a => parseInt(a.instrument_token));

        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType, hourlyHistoricalData);

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
}

// Function to fetch minute data and upglobal.date CIS
export async function fetchMinuteData(kite) {
    try {
        const now = moment();
        const fromTime = moment().startOf('day').add(9, 'global.hours').add(15, 'global.minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss');
        const dataType = 'minute';
        const instrument_tokens = global.instrumentsForMining.map(a => parseInt(a.instrument_token));

        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType, minuteHistoricalData);

        global.instrumentsForMining.forEach(instrument => {
            instrument.minuteData = minuteHistoricalData[instrument.instrument_token];
            if (instrument.minuteData && instrument.minuteData.length>0) {
                instrument.highestPointAfter12PM = highestPointAfter12PM(instrument.minuteData);
                instrument.minuteCandleMedianRange = findMedianRange(instrument.minuteData);
                instrument.minuteCandleMeanRange = findMeanRange(instrument.minuteData);

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
        console.error("Error fetching minute data:", error);
    }
}

// Helper function to fetch all data
async function fetchAllData(kite, instruments, fromTime, toTime, dataType, historicalData) {
    try {
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);

            if(!data){

                //console.log('issue in fetching historical data for'instrument.);
                
            }
            historicalData[instrument] = data;
            await new Promise(resolve => setTimeout(resolve, 333)); // Adjust delay as needed
        }
    } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
    }
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