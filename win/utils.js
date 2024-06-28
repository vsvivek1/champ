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