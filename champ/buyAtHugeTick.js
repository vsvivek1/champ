import { executeBuy } from "./executeBuy.js";

export function buyAtHugeLastTick(cis, kite) {
    const strategyName = 'hugeLastTick';

    if (cis.hugeLastTick) {
        cis.signals[strategyName] = true;
        cis.buyStrategy = strategyName;
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.deployedStrategies.buyAtHugeLastTick = 'Activated';

        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    } else {
        cis.returnPoints = `❌ [${strategyName}] hugeLastTick condition not met`;
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push(strategyName);
    }

    cis.deployedStrategies.buyAtHugeLastTick = 'touched';
    return false;
}
