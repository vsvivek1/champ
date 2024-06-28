
// import convertToIndianTime from '../../getIndianTimeFromIst'
export default{
methods:{

 findHighestAndLowest (ohlcArray){


    if (!ohlcArray || ohlcArray.length === 0|| !Array.isArray(ohlcArray)) {
      return { highest: null, lowest: null };
    }
  
    let highest = ohlcArray[0].high;
    let lowest = ohlcArray[0].low;

    let highestClose=ohlcArray[0].close;
  
   // ohlcArray.splice(0,ohlcArray.length/3).forEach(({ high, low }) => {
    //ohlcArray.splice(0,ohlcArray.length).forEach(({ high, low,close,open }) => {
   try {
     ohlcArray.forEach(({ high, low,close,open }) => {
 
      /*  if(ohlcArray.length<10){
 ///highs and lows before 10 minutes only
         return;
       } */
 
       if (close > highestClose) {
         highestClose = close;
       }
 
       if (high > highest) {
         highest = high;
       }
       if (low < lowest) {
         lowest = low;
       }
     });
   } catch (error) {
    
    debugger;
   }
  
    return { highest, lowest,highestClose };
  },
  
/*   const result = findHighestAndLowest(ohlcArray);
  console.log(`Highest point till now: ${result.highest}`);
  console.log(`Lowest point till now: ${result.lowest}`);
   */


  getCandleSupportResistancePoints(ohlcData){
   if(!ohlcData|| !Array.isArray(ohlcData)){

    return []
   }

    let longTails=ohlcData.filter(o=>{

let lowerShadowPoints=Math.min(o.open,o.close)-o.low;

let body=Math.abs(o.open-o.close);

//console.log({body},{lowerShadowPoints})
if(lowerShadowPoints>body*10){

return true;

}

   
    }).map(o1=>Math.floor(o1.low)).sort((a,b)=>a-b);

    return longTails;

  },
calculateHighestPrice(ohlcData) {

  if(ohlcData || ohlcData.length==0){

    return;
  }
    // Get the current time


    //// bad method
    const currentTime = new Date();

    // Get the start time (9:15 AM) timestamp
    const startTime = new Date(currentTime);

  
   
    if(currentTime.getMinutes()<15){
      startTime .setHours(currentTime.getHours()-2)
      startTime .setMinutes(15);

    }else{
      startTime .setHours(currentTime.getHours()-1)
      startTime .setMinutes(15);

    }
   

    if(currentTime.getHours()==9 || (currentTime.getHours()==10 && currentTime.getMinutes()<15))
    {

      startTime.setHours(9, 15, 0, 0); 
     }

    // Calculate the end time based on the current completed hour
    let endTime = new Date(currentTime);


    if (currentTime.getMinutes() < 15) {
        // If current time is before 15 minutes past the hour, set end time to the previous hour
        endTime.setHours(endTime.getHours() - 1, 15, 0, 0);
    } else {
        // Otherwise, set end time to the current completed hour
        endTime.setHours(endTime.getHours(), 15, 0, 0);
    }

    if(currentTime.getHours()==9){
      endTime = new Date(currentTime);

    }

    // Filter OHLC data for timestamps falling within today and up to the calculated end time

//console.log('startTime',startTime,'endTime',endTime)

    const filteredData = ohlcData.filter((candle) => {
        const candleDate = new Date(candle.date);
        return candleDate >= startTime && candleDate <= endTime;
    });

    // Find the highest price from the filtered data
    let highestPrice = null;
    filteredData.forEach((candle) => {
        if (highestPrice === null || candle.close > highestPrice) {
            highestPrice = candle.close;
        }
    });

    return highestPrice;
},





  convertToIndianTime(utcTimeString) {
    // Create a Date object from the UTC time string
    const utcDate = new Date(utcTimeString);
  
    // Set the time zone to Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata' };
  
    // Format the date and time using IST
    const indianTimeString = utcDate.toLocaleString('en-IN', options);
  
    return indianTimeString;
  },
  
 getCandlestickSignal(obj, ts = '') {
    if (typeof obj === 'undefined') {
        console.log(obj, 'data inside getCandleSignal Undefined');
        return 'EntryCheckForSignalFailed';
    }

    const ohlcData = obj;

    if (typeof ohlcData[ohlcData.length - 1] === 'undefined') {
        return 'ohlcDataNotSufficient';
    }

    const lastCandleOffset = 1;

    if (ohlcData.length < 3) {
        console.error('Insufficient OHLC data');
        return { candleColor: this.getCandleColor(ohlcData[ohlcData.length - lastCandleOffset]), signal: 'Insufficient OHLC data' };
    }

    const { open, high, low, close } = ohlcData[ohlcData.length - lastCandleOffset];
    const bodySize = Math.abs(close - open);
    const upperShadowSize = high - Math.max(open, close);
    const lowerShadowSize = Math.min(open, close) - low;
    const candleColor = this.getCandleColor({ open, close });

    const prevCandle = ohlcData[ohlcData.length - lastCandleOffset - 1];
    const prev2Candle = ohlcData[ohlcData.length - lastCandleOffset - 2];

    const signalData = { candleColor, target: null, stoploss: null };

    if (close === high) {
        signalData.signal = 'marbuzuo';
        signalData.target = low - (high - low);
        signalData.stoploss = high + (high - low);
        return signalData;
    }

   // debugger;
    switch (true) {
        case (lowerShadowSize > bodySize * 2 && upperShadowSize < lowerShadowSize):
            signalData.signal = 'longTail';
            signalData.target = high + (high - low) / 2;
            signalData.stoploss = low - (high - low) / 2;
            break;
        case (close > open && prevCandle.close > prevCandle.open && close > prevCandle.open && open < prevCandle.close):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (close < open && prevCandle.close < prevCandle.open && close < prevCandle.open && open > prevCandle.close):
            signalData.signal = 's';
            signalData.target = low - (high - low);
            signalData.stoploss = high + (high - low);
            break;
        case (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && close > open && upperShadowSize >= 2 * bodySize && lowerShadowSize <= bodySize / 2):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && open > close && lowerShadowSize >= 2 * bodySize && upperShadowSize <= bodySize / 2):
            signalData.signal = 's';
            signalData.target = low - (high - low);
            signalData.stoploss = high + (high - low);
            break;
        case (prev2Candle.close < prev2Candle.open && bodySize < Math.abs(prev2Candle.close - prev2Candle.open) / 2 && close > open && prevCandle.close < prevCandle.open):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (prev2Candle.close > prev2Candle.open && bodySize < Math.abs(prev2Candle.close - prev2Candle.open) / 2 && open > close && prevCandle.close > prevCandle.open):
            signalData.signal = 's';
            signalData.target = low - (high - low);
            signalData.stoploss = high + (high - low);
            break;
        case (close > open && prevCandle.close < prevCandle.open && close > prevCandle.open && open < prevCandle.close && close >= (prevCandle.open + prevCandle.close) / 2):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (close < open && prevCandle.close > prevCandle.open && close < prevCandle.open && open > prevCandle.close && close <= (prevCandle.open + prevCandle.close) / 2):
            signalData.signal = 's';
            signalData.target = low - (high - low);
            signalData.stoploss = high + (high - low);
            break;
        case (bodySize < Math.abs(prevCandle.close - prevCandle.open) / 2 && close > open && prevCandle.close > prevCandle.open && close < prevCandle.open && open > prevCandle.close):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (prev2Candle.close < prev2Candle.open && prevCandle.close < prevCandle.open && close > open && prevCandle.close < open && prev2Candle.close < open && close > (prevCandle.open + prevCandle.close) / 2 && open > (prev2Candle.open + prev2Candle.close) / 2):
            signalData.signal = 'b';
            signalData.target = high + (high - low);
            signalData.stoploss = low - (high - low);
            break;
        case (prev2Candle.close > prev2Candle.open && prevCandle.close > prevCandle.open && close < open && prevCandle.close > open && prev2Candle.close > open && close < (prevCandle.open + prevCandle.close) / 2 && open < (prev2Candle.open + prev2Candle.close) / 2):
            signalData.signal = 's';
            signalData.target = low - (high - low);
            signalData.stoploss = high + (high - low);
            break;
        default:
            signalData.signal = 'No signal detected in the end';
            break;
    }
   // debugger;
    return signalData;
},

getCandleColor({ open, close }) {
    return close - open > 0 ? 'GreenCandle' : 'RedCandle';
}

  


}
}
