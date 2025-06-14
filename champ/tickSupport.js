// tickSupport.js

export function squareOffBefore13Hrs(cis, orders, date) {
    let squareOff = false;

    const pv0 = cis.minuteData?.[cis.minuteData.length - 1];
    const pv1 = cis.minuteData?.[cis.minuteData.length - 2];



    if (!pv0 || !pv1) {
        console.log('Some issue in minute data for', cis.tradingsymbol,cis.minuteData);
       
      // process.exit();
        return false;
    }

    switch (true) {
        case (cis.lastSeenHigh > cis.buyPrice + 13 && cis.tick.last_price < cis.lastSeenHigh - 3):
            squareOff = true;
            cis.msg = `Profit booking before 1 PM`;
            break;

        case (isMakingLowerLows(cis.tick, cis) && cis.tick.last_price > cis.buyPrice + 2):
            squareOff = true;
            cis.msg = `Lower ticks detected before 1 PM`;
            break;

        case (cis.tick.last_price < cis.stoploss):
            squareOff = true;
            cis.msg = `Candle low stop loss triggered before 1 PM`;
            break;

        case (pv0.close < pv1.close && pv0.high < pv1.high && pv0.low < pv1.low):
            squareOff = true;
            cis.msg = `Lower lows (${pv0.close}, ${pv1.close}) and lower highs detected before 1 PM`;
            break;

        case (cis.position.buy_price - 2 * cis.minuteCandleMedianRange > cis.tick.last_price):
            squareOff = true;
            cis.msg = `Last tick below 2 candles range before 1 PM`;
            break;

        case (cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.low && !cis.upglobal.dated):
            squareOff = true;
            cis.msg = `Danger: ${cis.tradingsymbol} is below live candle low before 1 PM`;
            break;
    }

    return squareOff;
}

export async function squareOffAfter13Hrs(cis, orders, date) {
    let squareOff = false;

    const pv0 = cis.minuteData?.[cis.minuteData.length - 1];
    const pv1 = cis.minuteData?.[cis.minuteData.length - 2];

    if (!pv0 || !pv1) {
        console.log('Some issue in minute data for', cis.tradingsymbol);
        return false;
    }

    let highAfter12 = await highestPointAfter12PM(cis.minuteData);

    switch (true) {
        case (cis.lastSeenHigh > cis.buyPrice + 13 && cis.tick.last_price < cis.lastSeenHigh - 3):
            squareOff = true;
            cis.msg = `Profit booking after 1 PM`;
            break;

        case (isMakingLowerLows(cis.tick, cis) && cis.tick.last_price > cis.buyPrice + 2):
            squareOff = true;
            cis.msg = `Lower ticks detected after 1 PM`;
            break;

        case (cis.tick.last_price < cis.stoploss):
            squareOff = true;
            cis.msg = `Candle low stop loss triggered after 1 PM`;
            break;

        case (pv0.close < pv1.close && pv0.high < pv1.high && pv0.low < pv1.low):
            squareOff = true;
            cis.msg = `Lower lows (${pv0.close}, ${pv1.close}) and lower highs detected after 1 PM`;
            break;

        case (cis.position.buy_price - 2 * cis.minuteCandleMedianRange > cis.tick.last_price):
            squareOff = true;
            cis.msg = `Last tick below 2 candles range after 1 PM`;
            break;

        case (cis.liveHourCandle && cis.tick.last_price < cis.liveHourCandle.low && !cis.upglobal.dated):
            squareOff = true;
            cis.msg = `Danger: ${cis.tradingsymbol} is below live candle low after 1 PM`;
            break;

        case (cis.tick.last_price < highAfter12 && !cis.upglobal.dated):
            squareOff = true;
            cis.msg = `Last price is less than the high after 12 PM`;
            break;
    }

    return squareOff;
}

export function isMakingLowerLows(tick, cis) {
    if (!cis.lastPrice) {
        cis.lastPrice = tick.last_price;
        return false;
    }

    const isLowerLow = tick.last_price < cis.lastSeenHigh && tick.last_price < cis.lastPrice;
    cis.lowerLowsCount = isLowerLow ? (cis.lowerLowsCount || 0) + 1 : 0;
    cis.lastPrice = tick.last_price;

    return cis.lowerLowsCount >= 3;
}

export function highestPointAfter12PM(ohlcData) {


    if (!ohlcData || ohlcData.length < 166) {
        return -1;
    } else {
        const strippedData = ohlcData.slice(165);
        const highestPoint = Math.max(...strippedData.map(entry => entry.high));
        return highestPoint;
    }
}

export function OpenPriceAfter12PM(ohlcData) {


    if (!ohlcData || ohlcData.length < 166) {
        return -1;
    } else {
        const strippedData = ohlcData.slice(165);

        let firstCandle=strippedData[0];

        return firstCandle.high;
        const highestPoint = Math.max(...strippedData.map(entry => entry.high));
        return highestPoint;
    }
}

export function getCandle(ohlc) {
    if (!ohlc) {
        return;
    }

    let { open, close, high, low } = ohlc;
    let body = Math.abs(close - open);
    let upperShadow = high - Math.max(open, close);
    let lowerShadow = Math.min(open, close) - low;
    let range = high - low;
    let color = close - open >= 0 ? 'green' : 'red';
    let isHammer = lowerShadow > body * 4 && lowerShadow > upperShadow * 2;

    return { open, high, low, close, body, upperShadow, lowerShadow, range, color, isHammer };
}

export function isLastPriceAboveMaxOfPrev15(ohlcData, cis) {
    if (!ohlcData || ohlcData.length < 16) {
        return false;
    }

    const prev15Candles = ohlcData.slice(-136, -15);
    const maxHigh = Math.max(...prev15Candles.map(candle => candle.close));
    const lastCandle = ohlcData[ohlcData.length - 1];

let cl=lastCandle.close;
    console.log({maxHigh},{cl});
    
    return lastCandle.close >= maxHigh;
}

export function processTicks(tick) {

    return;
    var cis =global.instrumentsForMining.find(i => i.instrument_token === tick.instrument_token);

    if (!cis) {
        cis.returnPoints='NO CIS';
        return;
    }

    if (cis.hasLivePosition) {
        handlePositionPresent(cis);
    } else {
        handleNoPosition(cis);
    }

    socket.emit('sendCis', cis);
}
