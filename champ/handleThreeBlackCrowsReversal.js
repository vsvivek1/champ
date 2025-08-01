import { executeBuy } from "./executeBuy.js";
import { checkThreeBlackCrowsBullishReversal } from "./checkThreeBlackCrowsBullishReversal.js";

export function handleThreeBlackCrowsReversal(cis, kite) {
    const strategyName = 'ThreeBlackCrows';

    if (checkThreeBlackCrowsBullishReversal(cis.minuteData)) {
        cis.buyStrategy = strategyName;
        cis.deployedStrategies[strategyName] = 'checking';
        cis.entryHealth = '✅ Three Black Crows detected, possible bullish reversal';
        cis.returnPoints = `✅ [${strategyName}] 3 red candles, reversal expected`;

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


    cis.deployedStrategies[strategyName] = 'unFulfilled';
    // cis.returnPoints = `❌ [${strategyName}] Three Black Crows not detected`;
    // cis.strategyTested = cis.strategyTested || [];
    // cis.strategyTested.push(strategyName);
    // cis.deployedStrategies[strategyName] = 'touched';

    return false;
}
