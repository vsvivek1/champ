import { executeBuy } from "../executeBuy.js";

export function fifteenMinuteBreakout(cis, kite) {
    if (!cis?.minuteData || cis.minuteData.length < 16) return false;

    // First 15-minute candles: indices 0–2 (9:15–9:30)
    const first15MinData = cis.minuteData.slice(0, 3);

    const high15 = Math.max(...first15MinData.map(c => c.high));
    const low15 = Math.min(...first15MinData.map(c => c.low));
    const currentCandle = cis.minuteData[cis.minuteData.length - 1];
    const lastPrice = cis.tick.last_price;

    // Condition: breakout above 15-min high, but the candle’s high is still below the 15-min high
    if (
        lastPrice > high15 &&
        currentCandle.high < high15
    ) {
        cis.buyCriteria = "15MinBreakout";
        cis.targetPrice = lastPrice * 1.05;
        cis.stopLossPrice = lastPrice * 0.95;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        executeBuy(cis, kite, lastPrice);

        return true;
    }

    return false;
}
