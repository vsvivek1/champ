import moment from 'moment';

// Object to store historical data
export const hourlyHistoricalData = {};
export const minuteHistoricalData = {};

// Function to fetch historical data
async function getHistoricalData(kite, instrument, fromTime, toTime, dataType) {
    try {

        
        
        const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);
        console.log( instrument, fromTime, toTime, dataType,'connected');
       // console.log(data,'d')
        // Store data in the appropriate object
        if (dataType === 'hourly') {
            hourlyHistoricalData[instrument] = data;
           // console.log(`Hourly data for ${instrument} from ${fromTime} to ${toTime}:`, data);
        } else if (dataType === 'minute') {
            minuteHistoricalData[instrument] = data;
           // console.log(`Minute data for ${instrument} from ${fromTime} to ${toTime}:`, data);
        }
    } catch (error) {
        console.error(`Error fetching data for ${instrument}:`, error);
    }
}

async function fetchAllData(kite, instruments, fromTime, toTime, dataType) {

  
    
    for (let i = 0; i < instruments.length; i++) {

        
     let d=   await getHistoricalData(kite, instruments[i], fromTime, toTime, dataType);
     
    // console.log( instruments[i], fromTime, toTime, dataType);
        await new Promise(resolve => setTimeout(resolve, 333));
    }

    // Log the final historicalData object
    if (dataType === 'hourly') {
        console.log('Final hourly historical data:', hourlyHistoricalData);
    } else if (dataType === 'minute') {
        console.log('Final minute historical data:', minuteHistoricalData);
    }
}

function scheduleHourlyDataFetch(kite, instruments) {
    const now = moment();

    if (now.minute() === 16) {
        const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('hour').format('YYYY-MM-DD HH:mm:ss');

        fetchAllData(kite, instruments, fromTime, toTime, 'hourly');
    }

    const nextCheck = now.startOf('hour').add(1, 'hour').add(16, 'minutes');
    const delayUntilNextCheck = nextCheck.diff(now);

    setTimeout(() => scheduleHourlyDataFetch(kite, instruments), delayUntilNextCheck);
}

export function startInitialHourlyFetch(kite, instruments) {

    console.log('from set intial hours  ',instruments)
    const now = moment();
    const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const toTime = now.startOf('hour').format('YYYY-MM-DD HH:mm:ss');

    fetchAllData(kite, instruments, fromTime, toTime, 'hourly').then(() => {
        scheduleHourlyDataFetch(kite, instruments);
    });
}

function scheduleMinuteDataFetch(kite, instruments) {
    const now = moment();

    if (now.second() === 1) {
        const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const toTime = now.startOf('minute').subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');

        fetchAllData(kite, instruments, fromTime, toTime, 'minute');
    }

    const nextCheck = now.add(1, 'minute').startOf('minute').add(1, 'second');
    const delayUntilNextCheck = nextCheck.diff(now);

    setTimeout(() => scheduleMinuteDataFetch(kite, instruments), delayUntilNextCheck);
}

export function startInitialMinuteFetch(kite, instruments) {

    console.log('from set intial minute ',instruments)
    const now = moment();
    const fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const toTime = now.startOf('minute').subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');

    fetchAllData(kite, instruments, fromTime, toTime, 'minute').then(() => {
        scheduleMinuteDataFetch(kite, instruments);
    });
}
