import { executeBuy } from "./executeBuy.js";
import { isHammerCandle } from "./hammerStrategy.js";

export function handleHammerCandleTrade(cis, kite) {
         
    const strategyName = 'HammerCandle';
    cis.deployedStrategies[strategyName] = 'checking';

    const lastCandle = cis.minuteData.slice(-1)[0];
    if (isHammerCandle(lastCandle)) {
        cis.buyStrategy = strategyName;
        cis.entryHealth = '✅ Hammer candle detected';
        cis.returnPoints = `✅ [${strategyName}] Hammer candle formed`;

        console.log(global.clock,'Executing',cis.entryHealth);

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies[strategyName] = 'Activated';
              cis.entryHealth=strategyName;
         console.log(global.clock,'Executing',cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    }

    cis.returnPoints = `❌ [${strategyName}] Last candle is not a hammer`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
  cis.deployedStrategies[strategyName] = 'unFulfilled';
    return false;
}
