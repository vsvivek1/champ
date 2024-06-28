import { con } from './database.js';
import { initializeKiteConnect } from './kiteConnect.js';
import { fetchHourlyData, fetchMinuteData } from './historicalData.js';
import { initTicker } from './ticker.js';
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './orders.js';
import { convertToIndianTime, scheduleHourlyDataFetch } from './utils.js';
import instruAll from '../appv3/public/instruments/instrumentsForMining.json' assert { type: 'json' };

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