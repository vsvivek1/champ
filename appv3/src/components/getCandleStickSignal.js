
// import convertToIndianTime from '../../getIndianTimeFromIst'
export default{
methods:{

calculateHighestPrice(ohlcData) {
    // Get the current time
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
  
  getCandlestickSignal(obj, ts='') {
    if (typeof obj == 'undefined') {
        console.log(obj, 'data inside getCandleSignal Undefined');
        return 'EntryCheckForSignalFailed';
    }

    let ohlcData = obj;

    if (typeof ohlcData[ohlcData.length - 1] == 'undefined') {
        return 'ohlcDataNotSufficient';
    }

    let lastCandleOffset = 1;

    const { open, high, low, close } = ohlcData[ohlcData.length - lastCandleOffset];
    const bodySize = Math.abs(close - open);
    const upperShadowSize = high - Math.max(open, close);
    const lowerShadowSize = Math.min(open, close) - low;
    const CandleColor = close - open > 0 ? 'GreenCandle' : 'RedCandle';

    if (ohlcData.length < 3) {
        console.error('Insufficient OHLC data');
        return { candleColor: CandleColor, signal: 'Insufficient OHLC data' };
    }

    const { prevOpen, prevHigh, prevLow, prevClose } = ohlcData[ohlcData.length - lastCandleOffset - 1];

    if (lowerShadowSize > bodySize * 2 && upperShadowSize < lowerShadowSize) {
        return { candleColor: CandleColor, signal: 'longTail', target: high + (high - low) / 2, stoploss: low - (high - low) / 2 };
    }
    else if (close > open && prevClose > prevOpen && close > prevOpen && open < prevClose) {
        return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
    else if (close < open && prevClose < prevOpen && close < prevOpen && open > prevClose) {
        return { candleColor: CandleColor, signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
    else if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && close > open && upperShadowSize >= 2 * bodySize && lowerShadowSize <= bodySize / 2) {
        return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
    else if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && open > close && lowerShadowSize >= 2 * bodySize && upperShadowSize <= bodySize / 2) {
        return { candleColor: CandleColor, signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
    else if (ohlcData.length >= 3) {
        const { prev2Open, prev2High, prev2Low, prev2Close } = ohlcData[ohlcData.length - lastCandleOffset - 2];
        if (prev2Close < prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && close > open && prevClose < prevOpen) {
            return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
        }
    }
    else if (ohlcData.length >= 3) {
        const { prev2Open, prev2High, prev2Low, prev2Close } = ohlcData[ohlcData.length - lastCandleOffset - 2];
        if (prev2Close > prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && open > close && prevClose > prevOpen) {
            return { candleColor: CandleColor, signal: 's', target: low - (high - low), stoploss: high + (high - low) };
        }
    }
    else if (close > open && prevClose < prevOpen && close > prevOpen && open < prevClose && close >= (prevOpen + prevClose) / 2) {
        return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
    else if (close < open && prevClose > prevOpen && close < prevOpen && open > prevClose && close <= (prevOpen + prevClose) / 2) {
        return { candleColor: CandleColor, signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
    else if (bodySize < Math.abs(prevClose - prevOpen) / 2 && close > open && prevClose > prevOpen && close < prevOpen && open > prevClose) {
        return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
    else if (ohlcData.length >= 3) {
        const { prev2Open, prev2High, prev2Low, prev2Close } = ohlcData[ohlcData.length - lastCandleOffset - 2];
        if (
            prev2Close < prev2Open &&
            prevClose < prevOpen &&
            close > open &&
            prevClose < open &&
            prev2Close < open &&
            close > (prevOpen + prevClose) / 2 &&
            open > (prev2Open + prev2Close) / 2
        ) {
            return { candleColor: CandleColor, signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
        }
    }
    else if (ohlcData.length >= 3) {
        const { prev2Open, prev2High, prev2Low, prev2Close } = ohlcData[ohlcData.length - lastCandleOffset - 2];
        if (
            prev2Close > prev2Open &&
            prevClose > prevOpen &&
            close < open &&
            prevClose > open &&
            prev2Close > open &&
            close < (prevOpen + prevClose) / 2 &&
            open < (prev2Open + prev2Close) / 2
        ) {
            return { candleColor: CandleColor, signal: 's', target: low - (high - low), stoploss: high + (high - low) };
        }
    }

    return { candleColor: CandleColor, signal: 'No signal detected' };
}

  

},
}
/* function convertToIndianTime(utcTimeString) {
  // Create a Date object from the UTC time string
  const utcDate = new Date(utcTimeString);

  // Set the time zone to Indian Standard Time (IST)
  const options = { timeZone: 'Asia/Kolkata' };

  // Format the date and time using IST
  const indianTimeString = utcDate.toLocaleString('en-IN', options);

  return indianTimeString;
} */
/* function getCandlestickSignal(obj,ts) {

  //console.log(obj,'obj')

  //let cis=this.instruments.find(i=>i.instrument_token==)

  if(
    typeof obj=='undefined' 
    
     
    
    
    ){

    console.log(obj,'data inside getCandleSignal Undefined')
      return 'EntryCheckForSignalFailed';
    }

  //let minuteCandle=obj['minuteCandle']

  


let ohlcData=obj

//console.log(ohlcData,'od')
//let ts=obj.tradingsymbol
if(typeof ohlcData[ohlcData.length-1]=='undefined'){

 
  return 'ohlcDataNotSufficient'
}
  // console.log(ohlcData,'ohlcData')

  let lastCandleOffset=1;

  let indiantime=convertToIndianTime(ohlcData[ohlcData.length-lastCandleOffset].date);

  //console.log({indiantime});
  const {open, high, low, close} = ohlcData[ohlcData.length - lastCandleOffset];
  
  const bodySize = Math.abs(close - open);
  const upperShadowSize = high - Math.max(open, close);
  const lowerShadowSize = Math.min(open, close) - low;
  const CandleColor=close-open>0?'GreenCandle':'RedCandle';

    // console.log('funtion called f1',ohlcData);
    if (ohlcData.length < 3) {
      console.error('Insufficient OHLC data');
      return { candleColor:CandleColor,signal: 'Insufficient OHLC data' };
    }
  
    // console.log('funtion called',ohlcData[ohlcData.length - 2]);


    const {prevOpen, prevHigh, prevLow, prevClose} = ohlcData[ohlcData.length - lastCandleOffset-1];
  

    // console.log('funtion called f3');

    // console.log(lowerShadowSize,'lowerShadowSize')
    // print(lowerShadowSize,'lowerShadowSize')



    if(lowerShadowSize>bodySize*2 && upperShadowSize<lowerShadowSize){

      //console.log('long tail for',ts);
      return { candleColor:CandleColor,signal: 'longTail', target: high + (high - low)/2, stoploss: low - (high - low)/2 };
    }
  
    // Bullish Engulfing
  else  if (close > open && prevClose > prevOpen && close > prevOpen && open < prevClose) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Bearish Engulfing
   else  if (close < open && prevClose < prevOpen && close < prevOpen && open > prevClose) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Hammer
   else if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && close > open && upperShadowSize >= 2 * bodySize && lowerShadowSize <= bodySize / 2) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Shooting Star
  else  if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && open > close && lowerShadowSize >= 2 * bodySize && upperShadowSize <= bodySize / 2) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Morning Star
    else if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - lastCandleOffset-2];
      if (prev2Close < prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && close > open && prevClose < prevOpen) {
        return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
      }
    }
  

   
    // Evening Star
   else  if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - lastCandleOffset-2];
      if (prev2Close > prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && open > close && prevClose > prevOpen) {
        return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
      }
    }
  
    // Piercing Pattern
   else  if (close > open && prevClose < prevOpen && close > prevOpen && open < prevClose && close >= (prevOpen + prevClose) / 2) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Dark Cloud Cover
   else  if (close < open && prevClose > prevOpen && close < prevOpen && open > prevClose && close <= (prevOpen + prevClose) / 2) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Harami
    else if (bodySize < Math.abs(prevClose - prevOpen) / 2 && close > open && prevClose > prevOpen && close < prevOpen && open > prevClose) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Three White Soldiers
   else  if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - lastCandleOffset-2];
      if (
        prev2Close < prev2Open &&
        prevClose < prevOpen &&
        close > open &&
        prevClose < open &&
        prev2Close < open &&
        close > (prevOpen + prevClose) / 2 &&
        open > (prev2Open + prev2Close) / 2
      ) {
        return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
      }
    }
  
    // Three Black Crows
   else  if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - lastCandleOffset-2];
      if (
        prev2Close > prev2Open &&
        prevClose > prevOpen &&
        close < open &&
        prevClose > open &&
        prev2Close > open &&
        close < (prevOpen + prevClose) / 2 &&
        open < (prev2Open + prev2Close) / 2
      ) {
        return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
      }
    } else{

    return { candleColor:CandleColor,signal: 'No signal detected', };

    }
    // console.log('funtion called f5');
  }
   */
  // Example usage:
  // const ohlcData = [
  //   /* Your OHLC data for the previous day */,
  //   /* Your OHLC data for the current day */
  // ];

  
  // const candlestickSignal = getCandlestickSignal(ohlcData);
  // console.log(`Candlestick Signal: ${candlestickSignal.signal}`);
  // console.log(`Target: ${candlestickSignal.target}`);
  // console.log(`Stop Loss: ${candlestickSignal.stoploss}`);

  //export default getCandlestickSignal;

//   =getCandlestickSignal;
  