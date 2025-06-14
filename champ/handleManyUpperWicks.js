import { executeBuy } from "./executeBuy.js";
import { hasManyUpperWicks } from "./hasManyUpperWicks.js";

export function handleManyUpperWicks(cis, kite) {
    const strategyName = 'ManyUpperWicks';

    if (hasManyUpperWicks(cis.minuteData)) {
        cis.buyStrategy = strategyName;
        cis.entryHealth = `✅ Many upper wicks detected`;
        cis.returnPoints = `✅ [${strategyName}] Upper wick exhaustion pattern`;

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies[strategyName] = 'Activated';
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push(strategyName);

        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    }

    // ❌ Condition not met
    cis.returnPoints = `❌ [${strategyName}] Not enough upper wicks`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
    cis.deployedStrategies[strategyName] = 'touched';

    return false;
}
