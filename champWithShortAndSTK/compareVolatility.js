// Function to calculate the volatility of a given set of candles
function calculateVolatility1(candles) {
    // Calculate the volatility for each candle (high - low)
    const volatilityValues = candles.map(candle => candle.high - candle.low);

    // Calculate the average volatility
    const totalVolatility = volatilityValues.reduce((sum, vol) => sum + vol, 0);
    const averageVolatility = totalVolatility / candles.length;

    return averageVolatility;
}


export function calculateVolatility(candles) {
    // Calculate the volatility for each candle (high - low)
    const volatilityValues = candles.map(candle => candle.high - candle.low);

    // Calculate the average volatility
    const totalVolatility = volatilityValues.reduce((sum, vol) => sum + vol, 0);
    const averageVolatility = totalVolatility / candles.length;

    return averageVolatility/2;
}

// Function to compare the volatility of the last 5 candles with the previous 10 candles
export function compareVolatility(minuteData) {
    // Ensure there are at least 15 candles
    if (!minuteData || minuteData.length < 15) {

        return false;
        //throw new Error('Not enough data to compare volatility. At least 15 candles are required.');
    }

    // Get the last 5 candles
    const lastFiveCandles = minuteData.slice(-5);

    // Get the previous 10 candles before the last 5
    const previousTenCandles = minuteData.slice(-10, -5);

    // Calculate the volatility for both sets of candles
    const lastFiveVolatility = calculateVolatility1(lastFiveCandles);
    const previousTenVolatility = calculateVolatility1(previousTenCandles);

    // Compare and return the result
    return {
        lastFiveVolatility,
        previousTenVolatility,
        comparison: lastFiveVolatility > previousTenVolatility ? 'Last 5 candles have higher volatility' : 'Previous 10 candles have higher or equal volatility'
    };
}

