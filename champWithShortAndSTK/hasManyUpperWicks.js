// Function to check if there are many upper wicks and fewer lower wicks in the last 10 candles
export function hasManyUpperWicks(minuteData) {

    return false;
    // Ensure there are at least 10 candles
    if (!minuteData || minuteData.length < 10) {
        
        return false;
        //throw new Error('Not enough data to check for upper and lower wicks. At least 10 candles are required.');
    }

    // Get the last 10 candles
    const lastTenCandles = minuteData.slice(-10);

    // Define the threshold for what we consider a substantial wick (e.g., > 20% of the total range)
    const wickThreshold = 0.2;

    // Counters for candles with substantial upper and lower wicks
    let upperWickCount = 0;
    let lowerWickCount = 0;

    // Loop through the last 10 candles
    lastTenCandles.forEach(candle => {
        // Calculate the body high and body low
        const bodyHigh = Math.max(candle.open, candle.close); // The body high is the greater of open or close
        const bodyLow = Math.min(candle.open, candle.close);  // The body low is the lesser of open or close

        // Calculate the upper wick size (high - body high)
        const upperWickSize = candle.high - bodyHigh;

        // Calculate the lower wick size (body low - low)
        const lowerWickSize = bodyLow - candle.low;

        // Calculate the total range of the candle (high - low)
        const totalRange = candle.high - candle.low;

        // Check if the upper wick is substantial
        if (upperWickSize > wickThreshold * totalRange) {
            upperWickCount++;
        }

        // Check if the lower wick is substantial
        if (lowerWickSize > wickThreshold * totalRange) {
            lowerWickCount++;
        }
    });

    // Return true if the number of upper wicks is 7 or more and greater than lower wicks
    return upperWickCount >= 5 && lowerWickCount<3;
}
