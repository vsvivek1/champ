class Tech {
    constructor(data) {
      this.data = data;
    }
 filterFalseBreakouts(ohlcData, lastPrice) {
        let { open, high, low, close, volume } = ohlcData;
        let range = high - low;
        let target = null;
        let breakout = null;
    
        if (lastPrice > high) {
            if (volume > (high - close) * 100000) {
                target = high + range;
                breakout = "bullish";
            }
        } else if (lastPrice < low) {
            if (volume > (close - low) * 100000) {
                target = low - range;
                breakout = "bearish";
            }
        } else {
            target = null;
            breakout = "neutral";
        }
    
        return { breakout, target };
    }
    
    dailyBreakout(ohlcData, lastPrice) {
        let { open, high, low, close } = ohlcData;
        let range = high - low;
        let target = null;
        let breakout = null;
    
        if (lastPrice > high) {
            target = high + range;
            breakout = "bullish";
        } else if (lastPrice < low) {
            target = low - range;
            breakout = "bearish";
        } else {
            target = null;
            breakout = "neutral";
        }
    
        return { breakout, target };
    }
  
    findNR4Candles() {
      return this.data.filter(candle => {
        const high = candle.high;
        const low = candle.low;
        const close = candle.close;
        const prevCandle = this.data[this.data.indexOf(candle) - 1];
    
        if (!prevCandle) {
          return false;
        }
    
        const prevHigh = prevCandle.high;
        const prevLow = prevCandle.low;
        const prevClose = prevCandle.close;
    
        const isNR4 =
          Math.abs(high - low) < Math.abs(prevHigh - prevLow) * 0.5 &&
          Math.abs(high - close) < Math.abs(prevHigh - prevClose) * 0.5 &&
          Math.abs(low - close) < Math.abs(prevLow - prevClose) * 0.5;
    
        return isNR4;
      });
    }
  }
  
  const data = [
    { open: 100, high: 105, low: 95, close: 102 },
    { open: 102, high: 104, low: 98, close: 100 },
    { open: 101, high: 106, low: 99, close: 105 },
    { open: 104, high: 110, low: 102, close: 108 },
    { open: 106, high: 108, low: 101, close: 102 },
    // ...
  ];
  
  const tech = new Tech(data);
  const nr4Candles = tech.findNR4Candles();
  
  console.log(nr4Candles);
  