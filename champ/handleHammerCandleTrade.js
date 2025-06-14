import { executeBuy } from "./executeBuy.js";
import { isHammerCandle } from "./hammerStrategy.js";

export function handleHammerCandleTrade(cis, kite) {
    const strategyName = 'HammerCandle';

    const lastCandle = cis.minuteData.slice(-1)[0];
    if (isHammerCandle(lastCandle)) {
        cis.buyStrategy = strategyName;
        cis.entryHealth = '✅ Hammer candle detected';
        cis.returnPoints = `✅ [${strategyName}] Hammer candle formed`;

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies[strategyName] = 'Activated';
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    }

    cis.returnPoints = `❌ [${strategyName}] Last candle is not a hammer`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
    cis.deployedStrategies[strategyName] = 'touched';
    return false;
}
