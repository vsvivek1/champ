import { executeBuy } from "./executeBuy.js";
import { isHammerCandle } from "./hammerStrategy.js";

export function handleHammerCandleTrade(cis, kite) {

    const strategyName = 'HammerCandle';
    cis.deployedStrategies[strategyName] = 'checking';

    const lastCandle = cis.minuteData.slice(-1)[0];

    // A rejection candle on its own isn't an entry -- arm a breakout watch
    // on its high and only buy once price actually reclaims it. Re-arms
    // whenever a *new* hammer candle forms (tracked by candle.date).
    if (isHammerCandle(lastCandle) && cis.hammerRejectionCandleTime !== lastCandle.date) {
        cis.hammerRejectionHigh = lastCandle.high;
        cis.hammerRejectionLow = lastCandle.low;
        cis.hammerRejectionCandleTime = lastCandle.date;
        cis.awaitingHammerBreakout = true;
        cis.returnPoints = `[${strategyName}] Hammer candle formed, watching for breakout above ${lastCandle.high}`;
    }

    if (cis.awaitingHammerBreakout) {

        // Rejection failed -- price broke back below the hammer's low.
        // Stop watching this level rather than waiting on a stale setup.
        if (cis.tick.last_price < cis.hammerRejectionLow) {
            cis.awaitingHammerBreakout = false;
            cis.returnPoints = `[${strategyName}] Rejection failed, price broke below hammer low ${cis.hammerRejectionLow}`;
            return false;
        }

        if (cis.tick.last_price > cis.hammerRejectionHigh) {
            cis.buyStrategy = strategyName;
            cis.entryHealth = '✅ Hammer rejection high broken out';
            cis.returnPoints = `✅ [${strategyName}] Price crossed hammer high ${cis.hammerRejectionHigh}`;

            cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
            cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
            cis.inbuiltTarget = true;
            cis.inbuiltStopLoss = true;

            cis.deployedStrategies[strategyName] = 'Activated';
            cis.awaitingHammerBreakout = false;
            executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
            return true;
        }

        cis.returnPoints = `[${strategyName}] Awaiting breakout above hammer high ${cis.hammerRejectionHigh}`;
        cis.deployedStrategies[strategyName] = 'awaitingBreakout';
        return false;
    }

    cis.returnPoints = `❌ [${strategyName}] Last candle is not a hammer`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
  cis.deployedStrategies[strategyName] = 'unFulfilled';
    return false;
}
