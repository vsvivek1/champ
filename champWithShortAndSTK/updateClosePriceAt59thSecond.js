export default function updateClosePriceAt59thSecond(cis) {
    const marketOpenHour = 9;
    const marketOpenMinute = 15;

    const currentHour = global.hours;    // Access current hour from global
    const currentMinute = global.minutes; // Access current minute from global
    const currentSecond = global.seconds; // Access current second from global

    if (currentHour >= marketOpenHour) {
        let elapsedMinutes = 0;

        // Calculate elapsed minutes from 9:15 AM
        if (currentHour == marketOpenHour && currentMinute >= marketOpenMinute) {
            elapsedMinutes = currentMinute - marketOpenMinute;
        } else if (currentHour > marketOpenHour) {
            elapsedMinutes = (currentHour - marketOpenHour - 1) * 60 + (60 - marketOpenMinute) + currentMinute;
        }

        const nthMinute = elapsedMinutes + 1; // n is 1-based index

        if (currentSecond == 59) { // Check if it's the 59th second
            cis.mx = { n: nthMinute, price: cis.tick.last_price }; // Set the nth minute and price in cis.mx
            //console.log(`Set close price for minute ${nthMinute}: ${cis.tick.last_price}`);
        }
    } else {
        console.log("Market not open yet!-from updtade close price at 59th second",global.clock);
    }
}