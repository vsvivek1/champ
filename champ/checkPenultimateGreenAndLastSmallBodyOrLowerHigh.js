// Function to check if the penultimate candle is green and the last candle has either a lower high or a small body
export function checkPenultimateGreenAndLastSmallBodyOrLowerHigh(cis) {
    // Ensure there are at least 2 candles

    if(!cis){

        throw 'No cis found in cis peanultimate candle check'

        return true;
    } 

    let minuteData=cis.minuteData
    if (!minuteData || minuteData.length < 2) {
       
        return true;
       
       // throw new Error('Not enough data to perform the check. At least 2 candles are required.');
    }

    // Get the penultimate (second-to-last) and last candles
    const penultimateCandle = minuteData[minuteData.length - 2];
    const lastCandle = minuteData[minuteData.length - 1];

    // Check if the penultimate candle is green (close > open)
    const isPenultimateGreen = penultimateCandle.close > penultimateCandle.open;

    // Check if the last candle has a lower high than the penultimate candle
    const hasLowerHigh = lastCandle.high < penultimateCandle.high;

    // Check if the last candle has a very small body (close and open are nearly equal)
    const bodySize = Math.abs(lastCandle.close - lastCandle.open);
    const totalRange = lastCandle.high - lastCandle.low;

    // Define the threshold for what we consider a small body (e.g., less than 10% of the total range)
    const isSmallBody = bodySize < 0.1 * totalRange;


    if(isPenultimateGreen && (hasLowerHigh || isSmallBody) && cis.hasLivePosition  && cis.tick.last_price<penultimateCandle.low){

            console.log('EXECUTING STOP LOSS isPenultimateGreen && (hasLowerHigh || isSmallBody for',cis.tradingsymbol)
    }
    // Return true if the penultimate candle is green and the last candle has either a lower high or a small body
    return isPenultimateGreen && (hasLowerHigh || isSmallBody && cis.tick.last_price<penultimateCandle.low);
}
