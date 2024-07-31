// candlestickSignals.js

// Function to detect buy signals from OHLC data

function isBullishEngulfing(current, previous) {
    return (
        current.open < current.close &&
        previous.open > previous.close &&
        current.open < previous.close &&
        current.close > previous.open
    );
}

// Helper function to detect hammer pattern
function isHammer(candle) {
    const body = Math.abs(candle.open - candle.close);
    const lowerShadow = candle.open < candle.close
        ? candle.open - candle.low
        : candle.close - candle.low;
    const upperShadow = candle.high - Math.max(candle.open, candle.close);

    return lowerShadow > 2 * body && upperShadow < body;
}

// Helper function to detect morning star pattern
function isMorningStar(current, previous, beforePrevious) {
    return (
        beforePrevious.close < beforePrevious.open &&
        previous.close < previous.open &&
        current.close > current.open &&
        current.close > (beforePrevious.open + beforePrevious.close) / 2
    );
}



function candle(ohlc){




    let {open,close,high,low}=ohlc;

    let body=Math.abs(close-open);
    let upperShadow=high-Math.max(open,close);
    let lowerShadow=Math.min(open,close)-low;
    let range=high-low;
    let color=close-open>=0?'green':'red';
    let isHammer=lowerShadow>body*4&& lowerShadow>upperShadow*2

    return {open,high,low,close,body,upperShadow,lowerShadow,range,color,isHammer}


}
export function detectBuySignal(cis) {
    let ohlcData = cis.minuteData;
    let lastPrice = cis.tick.last_price;


   

   

    // Helper function to create a candle object
    function candle(data) {
        const { open, high, low, close, volume } = data;
        const body = Math.abs(close - open);
        const upperShadow = high - Math.max(open, close);
        const lowerShadow = Math.min(open, close) - low;
        const range = high - low;
        const color = close > open ? 'green' : 'red';
        const isHammer = lowerShadow > 2 * body ;//&& upperShadow < body;
        const isBullishEngulfing = (previous) => close > open && previous.close < previous.open && open < previous.close && close > previous.open;
        const isMorningStar = (prev, prev2) => close > open && prev.close < open && prev2.close > open;
        const isBullishHarami = (previous) => close > open && previous.close < previous.open && close < previous.open && open > previous.close;
        const isPiercing = (previous) => close > open && previous.close < previous.open && open < previous.low && close > (previous.body / 2 + previous.open);

        return { open, high, low, close, body, upperShadow, lowerShadow, range, color, isHammer, isBullishEngulfing, isMorningStar, isBullishHarami, isPiercing, volume };
    }

    let pvsLast = ohlcData[ohlcData.length - 1];
    if (!pvsLast) {

       
        
        return false;
    }
    pvsLast.candle = candle(pvsLast);
   // console.log(pvsLast.candle);
    if(pvsLast.candle.isHammer){

        return true
    }

    return false;




    if (!ohlcData || ohlcData.length < 3) {

        cis.location.ohlcNotSufficieant=true;cis.location.ohlcNotSufficieant=true;
        return false;
    }
    let twoPvsLast = ohlcData[ohlcData.length - 2];
    if (!twoPvsLast) {

        cis.location.ohlcNotSufficieant=true;
        return false;
    }

    twoPvsLast.candle = candle(twoPvsLast);

   



    // Calculate target and stoploss based on candle sizes
    function calculateTargetAndStoploss(entryPoint, candle) {
        const target = entryPoint + candle.range; // Target is entry point plus the range of the candle
        const stoploss = entryPoint - candle.range; // Stoploss is entry point minus the range of the candle
        return { target, stoploss };
    }

    // Volume filter to confirm breakouts
    function volumeFilter(current, previous) {
        return current.volume > previous.volume; // Ensure current volume is greater than previous volume
    }

    // Detect Hammer pattern
    if (pvsLast.candle.isHammer && pvsLast.close > pvsLast.candle.high && volumeFilter(pvsLast, twoPvsLast)) {
        cis.entryStrategy = "Hammer Pattern";
        cis.entryPoint = pvsLast.close;
        const { target, stoploss } = calculateTargetAndStoploss(pvsLast.close, pvsLast.candle);
        cis.target = target;
        cis.stoploss = stoploss;
        cis.candleColor = pvsLast.candle.color;
        cis.candleRange = pvsLast.candle.range;

        if (lastPrice >= cis.entryPoint) {
            return true;
        }
    }

    // Iterate through the OHLC data to check for other buy signals
    for (let i = 2; i < ohlcData.length; i++) {
        const current = ohlcData[i];
        const previous = ohlcData[i - 1];
        const beforePrevious = ohlcData[i - 2];

        const currentCandle = candle(current);
        const previousCandle = candle(previous);
        const beforePreviousCandle = candle(beforePrevious);

        // Detect Bullish Engulfing pattern
        if (currentCandle.isBullishEngulfing(previousCandle) && volumeFilter(current, previous)) {
            cis.entryStrategy = "Bullish Engulfing";
            cis.entryPoint = current.close;
            const { target, stoploss } = calculateTargetAndStoploss(current.close, currentCandle);
            cis.target = target;
            cis.stoploss = stoploss;
            cis.candleColor = currentCandle.color;
            cis.candleRange = currentCandle.range;

            if (lastPrice >= cis.entryPoint) {
                return true;
            }
        }

        // Detect Morning Star pattern
        if (currentCandle.isMorningStar(previousCandle, beforePreviousCandle) && volumeFilter(current, previous)) {
            cis.entryStrategy = "Morning Star";
            cis.entryPoint = current.close;
            const { target, stoploss } = calculateTargetAndStoploss(current.close, currentCandle);
            cis.target = target;
            cis.stoploss = stoploss;
            cis.candleColor = currentCandle.color;
            cis.candleRange = currentCandle.range;

            if (lastPrice >= cis.entryPoint) {
                return true;
            }
        }

        // Detect Bullish Harami pattern
        if (currentCandle.isBullishHarami(previousCandle) && volumeFilter(current, previous)) {
            cis.entryStrategy = "Bullish Harami";
            cis.entryPoint = current.close;
            const { target, stoploss } = calculateTargetAndStoploss(current.close, currentCandle);
            cis.target = target;
            cis.stoploss = stoploss;
            cis.candleColor = currentCandle.color;
            cis.candleRange = currentCandle.range;

            if (lastPrice >= cis.entryPoint) {
                return true;
            }
        }

        // Detect Piercing pattern
        if (currentCandle.isPiercing(previousCandle) && volumeFilter(current, previous)) {
            cis.entryStrategy = "Piercing Pattern";
            cis.entryPoint = current.close;
            const { target, stoploss } = calculateTargetAndStoploss(current.close, currentCandle);
            cis.target = target;
            cis.stoploss = stoploss;
            cis.candleColor = currentCandle.color;
            cis.candleRange = currentCandle.range;

            if (lastPrice >= cis.entryPoint) {
                return true;
            }
        }
    }

    return false; // No buy signal detected
}


