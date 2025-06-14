export function checkLastPriceAgainstPreviousCandles(cis) {
    // Ensure there are at least 3 candles to compare
    if (!cis || !cis.minuteData ||cis.minuteData.length < 3) {
       // console.log("Not enough candles to compare.");
        return false; // Return false if there are fewer than 3 candles
    }

    // Get the last price from the tick data
    const lastPrice = cis.tick.last_price;

    // Get the previous 3 candles' low prices
    const previousThreeCandles = cis.minuteData.slice(-3); // Get the last 3 candles
    const lowPrices = previousThreeCandles.map((candle) => candle.low); // Extract low prices

    // Check if the last price is less than all of the low prices of the previous 3 candles
    const isLastPriceLessThanAllLows = lowPrices.every((low) => lastPrice < low);


    if(isLastPriceLessThanAllLows) console.log(`executing sl last price less than 3 consequtive lows for ${cis.tradingsymbol}`)
    // Return true if the condition is met, otherwise return false
    return isLastPriceLessThanAllLows;
}

// Export the function using ES6 module syntax

