export default function getMinutePrice(offset, cis) {
    const marketOpenHour = 9;
    const marketOpenMinute = 15;

    const currentHour = global.hours; // Access current hour from global
    const currentMinute = global.minutes; // Access current minute from global

    // Calculate the total elapsed minutes from 9:15 AM to now
    let elapsedMinutes = 0;

    if (currentHour >= marketOpenHour) {
        if (currentHour === marketOpenHour && currentMinute >= marketOpenMinute) {
            elapsedMinutes = currentMinute - marketOpenMinute;
        } else if (currentHour > marketOpenHour) {
            elapsedMinutes = (currentHour - marketOpenHour - 1) * 60 + (60 - marketOpenMinute) + currentMinute;
        }

        const targetMinute = elapsedMinutes + offset + 1; // Calculate the target nth minute
        if (cis.mx && cis.mx.n === targetMinute) {
            return cis.mx.price; // Return the stored price
        } else {
            console.log(`No price data found for minute offset ${offset}.`);
            return null;
        }
    } else {
        console.log("Market not open yet!");
        return null;
    }
}
