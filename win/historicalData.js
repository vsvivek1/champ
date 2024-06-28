import moment from 'moment';

export let hourlyHistoricalData = {};
export let minuteHistoricalData = {};

export async function fetchAllData(kite, instruments, fromTime, toTime, dataType) {
    try {
        for (let i = 0; i < instruments.length; i++) {
            const instrument = instruments[i];
            const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);
            if (dataType === '60minute') {
                hourlyHistoricalData[instrument] = data;
            } else if (dataType === 'minute') {
                minuteHistoricalData[instrument] = data;
            }
            await new Promise(resolve => setTimeout(resolve, 333));
        }
    } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
    }
}

export async function fetchHourlyData(kite, instruAll) {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').add(9, 'hours').add(15, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let toTime;
        if (now.hour() === 9) {
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