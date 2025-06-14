export function redCandleStartAfterGreenCandles(cis) {
    const minuteData = cis.minuteData; // The array of OHLC data (Open, High, Low, Close)
    const liveMinuteCandle = cis.liveMinuteCandle; // The live candle (OHLC)
    
    // Ensure there are at least 2 previous candles to check
    if (!minuteData || minuteData.length < 2) {
        return false;
    }

    // Check if at least 2 previous candles are green
    let greenCandlesCount = 0;
    for (let i = minuteData.length - 1; i >= minuteData.length - 2; i--) {
        const candle = minuteData[i];
        if (candle.close > candle.open) {
            greenCandlesCount++;
        }
    }

    // Check if the live candle is red
    //const isLiveCandleRed = liveMinuteCandle.close < liveMinuteCandle.open;
   // if ()
    // Check the global.seconds and return true if all conditions are met
   if(greenCandlesCount >= 2 && cis.liveMinute.color === 'bearish' && global.seconds >= 10 &&   cis.hasPosition){

   // if(global.minutes%15==0 && global.seconds==0)    
        
        console.log('EXECUTING STOP LOSS greenCandlesCount >= 2 && cis.liveMinute.color === \'bearish && global.seconds >= 6',cis.tradingsymbol)
}


    if (greenCandlesCount >= 2 && cis.liveMinute.color === 'bearish' && global.seconds >= 6 ) {
        return true;
    }

    

    return false;
}
