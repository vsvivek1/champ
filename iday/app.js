import { initialize } from './init.js';
import { fetchHourlyData, fetchMinuteData } from './dataFetcher.js';
import { initTicker } from './ticker.js';
import instruAll from '../appv3/public/instruments/instrumentsForMining.json' assert { type: "json" };
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './orders.js';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');
let kite;
let date;

async function main() {
    try {
        kite = await initialize();

        date = new Date();
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);
        await fetchHourlyData(kite, instruAll);
        await fetchMinuteData(kite, instruAll);

        initTicker(kite, instruAll, [], date);

        setInterval(async () => {
            date = new Date();
            await fetchOrdersAndSetCis(kite, instruAll);
            await fetchPositionsAndSetCis(kite, instruAll);
            await fetchMinuteData(kite, instruAll);
        }, 1000);

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();
