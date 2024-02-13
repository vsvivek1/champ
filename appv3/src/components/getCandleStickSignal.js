
// import convertToIndianTime from '../../getIndianTimeFromIst'

function convertToIndianTime(utcTimeString) {
  // Create a Date object from the UTC time string
  const utcDate = new Date(utcTimeString);

  // Set the time zone to Indian Standard Time (IST)
  const options = { timeZone: 'Asia/Kolkata' };

  // Format the date and time using IST
  const indianTimeString = utcDate.toLocaleString('en-IN', options);

  return indianTimeString;
}
function getCandlestickSignal(ohlcData) {


  // console.log(ohlcData,'ohlcData')

  let indiantime=convertToIndianTime(ohlcData[ohlcData.length-1].date);

  console.log({indiantime});
  const {open, high, low, close} = ohlcData[ohlcData.length - 1];
  
  const bodySize = Math.abs(close - open);
  const upperShadowSize = high - Math.max(open, close);
  const lowerShadowSize = Math.min(open, close) - low;
  const CandleColor=close-open>0?'GreenCandle':'RedCandle';

    // console.log('funtion called f1',ohlcData);
    if (ohlcData.length < 3) {
      console.error('Insufficient OHLC data');
      return { candleColor:CandleColor,signal: 'No signal detected start' };
    }
  
    // console.log('funtion called',ohlcData[ohlcData.length - 2]);


    const {prevOpen, prevHigh, prevLow, prevClose} = ohlcData[ohlcData.length - 2];
  

    // console.log('funtion called f3');

    // console.log(lowerShadowSize,'lowerShadowSize')
    // print(lowerShadowSize,'lowerShadowSize')
  
    // Bullish Engulfing
    if (close > open && prevClose > prevOpen && close > prevOpen && open < prevClose) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Bearish Engulfing
    if (close < open && prevClose < prevOpen && close < prevOpen && open > prevClose) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Hammer
    if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && close > open && upperShadowSize >= 2 * bodySize && lowerShadowSize <= bodySize / 2) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Shooting Star
    if (bodySize < Math.min(upperShadowSize, lowerShadowSize) / 2 && open > close && lowerShadowSize >= 2 * bodySize && upperShadowSize <= bodySize / 2) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Morning Star
    if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - 3];
      if (prev2Close < prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && close > open && prevClose < prevOpen) {
        return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
      }
    }
  

   
    // Evening Star
    if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - 3];
      if (prev2Close > prev2Open && bodySize < Math.abs(prev2Close - prev2Open) / 2 && open > close && prevClose > prevOpen) {
        return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
      }
    }
  
    // Piercing Pattern
    if (close > open && prevClose < prevOpen && close > prevOpen && open < prevClose && close >= (prevOpen + prevClose) / 2) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Dark Cloud Cover
    if (close < open && prevClose > prevOpen && close < prevOpen && open > prevClose && close <= (prevOpen + prevClose) / 2) {
      return { candleColor:CandleColor,signal: 's', target: low - (high - low), stoploss: high + (high - low) };
    }
  
    // Harami
    if (bodySize < Math.abs(prevClose - prevOpen) / 2 && close > open && prevClose > prevOpen && close < prevOpen && open > prevClose) {
      return { candleColor:CandleColor,signal: 'b', target: high + (high - low), stoploss: low - (high - low) };
    }
  
    // Three White Soldiers
    if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - 3];
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
    if (ohlcData.length >= 3) {
      const {prev2Open, prev2High, prev2Low, prev2Close} = ohlcData[ohlcData.length - 3];
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
    }
    // console.log('funtion called f5');
    return { candleColor:CandleColor,signal: 'No signal detected', };
  }
  
  // Example usage:
  // const ohlcData = [
  //   /* Your OHLC data for the previous day */,
  //   /* Your OHLC data for the current day */
  // ];

  
  // const candlestickSignal = getCandlestickSignal(ohlcData);
  // console.log(`Candlestick Signal: ${candlestickSignal.signal}`);
  // console.log(`Target: ${candlestickSignal.target}`);
  // console.log(`Stop Loss: ${candlestickSignal.stoploss}`);

  export default getCandlestickSignal;

//   =getCandlestickSignal;
  