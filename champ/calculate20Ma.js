export function calculate20MA(minuteData) {

    //console.log('from 20 ma')
    if (!Array.isArray(minuteData))  {


        return -1;
        //throw new Error("Insufficient data: Need at least 20 candles.");
    }


    
    
    const count = minuteData.length >= 20 ? 20 : minuteData.length;

    const last20Closes = minuteData
    .slice(-count)
    .map(candle => candle.high);
      //  console.log(last20Closes)

    const sum = last20Closes.reduce((acc, val) => acc + val, 0);
    return sum / 20;
}
