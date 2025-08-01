function findCurrentTimeSlot() {
    // Define start time as 9:15
    const startHour = 9;
    const startMinute = 15;

    // Get current time from global (assuming global.hours and global.minutes are available)
    const currentHour = global.hours;
    const currentMinute = global.minutes;

    // Calculate total minutes elapsed since 9:15
    const minutesElapsed =
        (currentHour - startHour) * 60 + (currentMinute - startMinute);

    let candlesToSlice = 0;

    // Switch statement determines which time slot we are in based on the minutes elapsed
    switch (true) {
        case minutesElapsed >= 0 && minutesElapsed < 60:
            candlesToSlice = minutesElapsed; // Before 10:15
            break;
        case minutesElapsed >= 60 && minutesElapsed < 120:
            candlesToSlice = 60; // Between 9:15 and 10:15
            break;
        case minutesElapsed >= 120 && minutesElapsed < 180:
            candlesToSlice = 120; // Between 9:15 and 11:15
            break;
        case minutesElapsed >= 180 && minutesElapsed < 240:
            candlesToSlice = 180; // Between 9:15 and 12:15
            break;
        case minutesElapsed >= 240 && minutesElapsed < 300:
            candlesToSlice = 240; // Between 9:15 and 1:15
            break;
        case minutesElapsed >= 300 && minutesElapsed < 360:
            candlesToSlice = 300; // Between 9:15 and 2:15
            break;
        case minutesElapsed >= 360 && minutesElapsed <= 375:
            candlesToSlice = 360; // Between 9:15 and 3:30 (15 min slot for extra candles)
            break;
        default:
            return null; // Time is before 9:15 or after trading hours
    }

    return candlesToSlice; // Return how many candles we should slice based on the current time
}

export function findHighestPrice(cis) {
    // Find the current time slot in minutes and the corresponding candles to slice
    const candlesToSlice = findCurrentTimeSlot();
    
    // If candlesToSlice is null or non-positive, there's no valid time slot data
    if (candlesToSlice == null || candlesToSlice <= 0) {
        console.log("Current time is before 9:15 AM or no valid data available.");
        return null;
    }

    // Slice the minute data based on the calculated number of candles up to the current time slot
    const slicedData = cis.minuteData.slice(0, candlesToSlice);

    // Extract the high prices from the sliced OHLC data
    const highPrices = slicedData.map((data) => data.high);

    // Find the maximum high price from the extracted high prices
    const highestPrice = Math.max(...highPrices);

    return highestPrice; // Return the highest price
}

export function findHourlyHighestPrice(cis) {
    const currentHour = global.hours;  // Get the current hour from global context
    const currentMinute = global.minutes;  // Get the current minute from global context

    // Calculate the total minutes elapsed from the 9:15 start time
    const minutesElapsed = (currentHour - 9) * 60 + (currentMinute - 15);

    // Find the cumulative highest price based on the current time slot
    const cumulativeHighPrice = findHighestPrice(cis);

    // Determine the hourly time slot and return the highest price accordingly
    switch (true) {
        case minutesElapsed >= 60 && minutesElapsed < 120:
            // From 10:15 to 11:15, return the highest price till 10:15
            return cumulativeHighPrice;
        case minutesElapsed >= 120 && minutesElapsed < 180:
            // From 11:15 to 12:15, return the highest price till 11:15
            return cumulativeHighPrice;
        case minutesElapsed >= 180 && minutesElapsed < 240:
            // From 12:15 to 1:15, return the highest price till 12:15
            return cumulativeHighPrice;
        case minutesElapsed >= 240 && minutesElapsed < 300:
            // From 1:15 to 2:15, return the highest price till 1:15
            return cumulativeHighPrice;
        case minutesElapsed >= 300 && minutesElapsed < 360:
            // After 2:15 till 3:30, return the highest price between 12:15 and 2:15
            // To do this, we slice the minuteData between 12:15 and 2:15
            const dataFrom12To2 = cis.minuteData.slice(180, 300);  // Data from 12:15 to 2:15
            const highPricesFrom12To2 = dataFrom12To2.map((data) => data.high);
            return Math.max(...highPricesFrom12To2);  // Return the highest price between 12:15 and 2:15
        default:
            return -1; // If time is invalid or before 9:15
    }
}

// Export the function using ES6 module syntax
export default findHourlyHighestPrice;
