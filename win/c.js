const fs = require('fs');
const path = require('path');

const files = {
  'database.js': `
import { connectToDatabase } from '../connectToDatabase.js';

export const con = connectToDatabase();
`,

  'kiteConnect.js': `
import { getTodaysAccessToken } from '../getTodaysAccessToken.js';
import getKiteConnectInstance from '../getKiteConnectInstanceRequire.js';

export let kite;

export async function initializeKiteConnect() {
    const accessTokenDoc = await getTodaysAccessToken();
    kite = await getKiteConnectInstance();
    return kite;
}
`,

  'historicalData.js': `
import moment from 'moment';

export let hourlyHistoricalData = {};
export let minuteHistoricalData = {};

export async function fetchAllData(kite, instruments, fromTime, toTime, dataType) {
    try {
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);
            if (dataType == '60minute') {
                hourlyHistoricalData[instrument] = data;
            } else if (dataType == 'minute') {
                minuteHistoricalData[instrument] = data;
            }
            await new Promise(resolve => setTimeout(resolve, 333));
        }
    } catch (error) {
        console.error(\`Error fetching \${dataType} data:\`, error);
    }
}

export async function fetchHourlyData(kite, instruAll) {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let toTime;
        if (now.hour() == 9) {
            toTime = now.startOf('hour').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
        } else {
            toTime = now.startOf('hour').add(15, 'minute').format('YYYY-MM-DD HH:mm:ss');
        }
        const dataType = '60minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);
        Object.keys(hourlyHistoricalData).forEach((key) => {
            let cis = instruAll.find(i => i.instrument_token == key);
            cis.hourlyHistoricalData = hourlyHistoricalData[key];
            cis.hourlyHigh = hourlyHistoricalData[key][hourlyHistoricalData[key].length - 1].high;
            cis.hourlyHighTime = convertToIndianTime(hourlyHistoricalData[key][hourlyHistoricalData[key].length - 1].date);
        });
    } catch (error) {
        console.error('Error fetching hourly data:', error);
    }
}

export async function fetchMinuteData(kite, instruAll) {
    try {
        const now = moment();
        const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(0, 'minute').format('YYYY-MM-DD HH:mm:ss');
        const dataType = 'minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));
        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);
        Object.keys(minuteHistoricalData).forEach((key) => {
            let cis = instruAll.find(i => i.instrument_token == key);
            cis.minuteData = minuteHistoricalData[key];
            cis.lastMinuteTime = convertToIndianTime(minuteHistoricalData[key][minuteHistoricalData[key].length - 1].date);
        });
    } catch (error) {
        console.error('Error fetching minute data:', error);
    }
}
`,

  'ticker.js': `
import { KiteTicker } from 'kiteconnect';
import { extractTicks } from './ticks.js';

let ticker;

export function initTicker(kite, onTicks, subscribe, orderUpdates) {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.connect();
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);
    ticker.on("order_update", orderUpdates);
}

export function subscribe() {
    const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));
    ticker.subscribe(instrument_tokens);
    ticker.setMode(ticker.modeFull, instrument_tokens);
}
`,

  'orders.js': `
export async function fetchPositionsAndSetCis(kite, instruAll) {
    const positions = await kite.getPositions();
    const positionsDay = positions.day;
    instruAll.forEach(instrument => {
        const matchingPosition = positionsDay.find(pos => pos.tradingsymbol == instrument.tradingsymbol && pos.quantity > 0);
        if (matchingPosition) {
            instrument.position = matchingPosition;
            instrument.hasLivePosition = true;
        } else {
            instrument.position = null;
            instrument.hasLivePosition = false;
        }
    });
}

export async function fetchOrdersAndSetCis(kite, instruAll, orders) {
    try {
        orders = await kite.getOrders();
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
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

export async function orderUpdates(order, kite, instruAll) {
    let cis = instruAll.find(i => i.instrument_token == order.instrument_token);
    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
        cis.ordered = false;
        cis.hasLivePosition = false;
        cis.updated = false;
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);

        const orderParams = {
            exchange: "NFO",
            tradingsymbol: order.tradingsymbol,
            transaction_type: "SELL",
            order_type: "LIMIT",
            quantity: order.quantity,
            price: order.price + 10,
            product: "NRML",
            validity: "DAY",
        };

        try {
            const orderId = await kite.placeOrder("regular", orderParams);
            console.log("Order placed successfully. Order ID:", orderId);
        } catch (error) {
            console.error("Error placing order:", error);
        }
    }
}
`,

  'ticks.js': `
import { detectBuySignal } from './candleStickSignals.js';
import updateOpenOrderPrice from "./updateOrder.js";

export function onTicks(ticks) {
    ticks.forEach(tick => {
        processTicks(tick);
    });
}

export function processTicks(tick) {
    const cis = instruAll.find(i => i.instrument_token == tick.instrument_token);
    if (!cis) return;

    cis.tick = tick;

    if (cis.hasLivePosition) {
        handlePosition(cis);
    } else {
        handleNoPosition(cis);
    }
}

function handlePosition(cis) {
    if (cis.tick.ohlc.open > cis.tick.last_price && !cis.updated) {
        const order = orders.find(o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN');
        if (order) {
            updateOpenOrderPrice(kite, order.order_id, cis.instrument_token, cis.tick.last_price + 2);
            cis.updated = true;
        }
        console.log(\`Danger \${cis.tradingsymbol} is below opening price, order id is \${order.order_id}\`);
    }
}

function handleNoPosition(cis) {
    if (cis.tick.last_price > cis.tick.ohlc.open) {
        tickAboveOpen(cis);
    }
}

async function tickAboveOpen(cis) {
    if (!isTickAboveHourlyHistoricalValue(cis)) return;

    const minuteCandle = cis.minuteData;
    if (!minuteCandle) return;

    const last_candle = minuteCandle[minuteCandle.length - 1];
    if (last_candle) {
        cis.last_candle = last_candle;
        cis.lastCandleTime = convertToIndianTime(last_candle.date);

        const hasBuySignal = detectBuySignal(cis.minuteData);
        if (hasBuySignal && !cis.ordered) {
            cis.ordered = true;

            const orderParams = {
                exchange: "NFO",
                tradingsymbol: cis.tradingsymbol,
                transaction_type: "BUY",
                order_type: "LIMIT",
                quantity: cis.lot_size,
                price: cis.tick.last_price,
                product: "NRML",
                validity: "DAY",
            };

            try {
                const orderId = await kite.placeOrder("regular", orderParams);
                console.log("Order placed successfully. Order ID:", orderId);
            } catch (error) {
                console.error("Error placing order:", error);
            }
        }
    }
}

function isTickAboveHourlyHistoricalValue(cis) {
    if (!cis.hourlyHigh) return false;
    return cis.tick.last_price > cis.hourlyHigh;
}
`,

  'utils.js': `
import moment from 'moment';

export function convertToIndianTime(utcTimeString) {
    const utcDate = new Date(utcTimeString);
    const options = { timeZone: 'Asia/Kolkata' };
    const indianTimeString = utcDate.toLocaleString('en-IN', options);
    return indianTimeString;
}

export function scheduleHourlyDataFetch(fetchHourlyData) {
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
`,

  'main.js': `
import { con } from './database.js';
import { initializeKiteConnect } from './kiteConnect.js';
import { fetchHourlyData, fetchMinuteData } from './historicalData.js';
import { initTicker } from './ticker.js';
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './orders.js';
import { convertToIndianTime, scheduleHourlyDataFetch } from './utils.js';
import instruAll from '../appv3/shared/instruments/instrumentsForMining.json' assert { type: 'json' };

let kite;
let orders = [];
let date, day, hours, minutes, seconds;

async function main() {
    try {
        kite = await initializeKiteConnect();

        setInterval(async () => {
            date = new Date();
            day = date.getDay();
            hours = date.getHours();
            minutes = date.getMinutes();
            seconds = date.getSeconds();

            if (seconds == 1) {
                await fetchOrdersAndSetCis(kite, instruAll, orders);
                await fetchPositionsAndSetCis(kite, instruAll);
                await fetchMinuteData(kite, instruAll);
            }
        }, 1000);

        initTicker(kite, onTicks, subscribe, orderUpdates);

        await fetchOrdersAndSetCis(kite, instruAll, orders);
        await fetchPositionsAndSetCis(kite, instruAll);
        await fetchHourlyData(kite, instruAll);
        await fetchMinuteData(kite, instruAll);

        scheduleHourlyDataFetch(fetchHourlyData.bind(null, kite, instruAll));
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
`,

  'logging.js': `
import fs from 'fs';

// Create a writable stream
const logFile = fs.createWriteStream('app.log', { flags: 'a' });

// Override console methods
console.error = (message) => {
  logFile.write(\`[ERROR] \${message}\\n\`);
};

console.warn = (message) => {
  logFile.write(\`[WARN] \${message}\\n\`);
};
`
};

Object.keys(files).forEach(filename => {
  const content = files[filename];
  fs.writeFileSync(path.join(__dirname, filename), content.trim());
});

console.log('Files created successfully.');
