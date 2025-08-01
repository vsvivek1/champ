import moment from 'moment';

let hourlyHistoricalData = {};
let minuteHistoricalData = {};

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

            await new Promise(resolve => setTimeout(resolve, 333)); // Delay for API rate limits
        }
    } catch (error) {
        console.error(`Error fetching ${dataType} data:`, error);
    }
}

export async function fetchHourlyData(kite, instruAll) {
    try {
        const now = moment();
        let fromTime = moment().startOf('day').subtract(1,'days').add(13, 'hours').add(0, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        let toTime = now.format('YYYY-MM-DD HH:mm:ss');

        const dataType = '60minute';
        const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));

        await fetchAllData(kite, instrument_tokens, fromTime, toTime, dataType);

        Object.keys(hourlyHistoricalData).forEach((key) => {
            let cis = instruAll.find(i => i.instrument_token == key);
            cis.hourlyHistoricalData = hourlyHistoricalData[key];
            cis.hourlyHigh = hourlyHistoricalData[key][hourlyHistoricalData[key].length - 1].high;
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
            cis.lastCandle = cis.minuteData.slice(-1)[0];
            cis.minuteCandleMedianRange = findMedianRange(cis.minuteData);
        });
    } catch (error) {
        console.error('Error fetching minute data:', error);
    }
}
