export function calculate20MA(minuteData) {
    if (!Array.isArray(minuteData) || minuteData.length < 20) {


        return -1;
        //throw new Error("Insufficient data: Need at least 20 candles.");
    }

    const last20Closes = minuteData
        .slice(-20)
        .map(candle => candle.close);

    const sum = last20Closes.reduce((acc, val) => acc + val, 0);
    return sum / 20;
}
