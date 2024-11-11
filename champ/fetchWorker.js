import { fetchOrdersAndSetCis, fetchPositionsAndSetCis, fetchMinuteData, fetchHourlyData } from './fetchData.js';
import { parentPort } from 'worker_threads';

async function fetchData(kite) {
    try {

        console.log('this is worker');
        
        await fetchOrdersAndSetCis(kite);
        await fetchPositionsAndSetCis(kite);
        await fetchMinuteData(kite);
    } catch (error) {
        console.error('Error in fetchWorker:', error);
    }
}

// Listen for messages from main process
parentPort.on('message', async (message) => {
    if (message.type === 'fetchData') {
        await fetchData(message.kite);
    } else if (message.type === 'fetchHourly') {
        await fetchHourlyData(message.kite);
    }
});
