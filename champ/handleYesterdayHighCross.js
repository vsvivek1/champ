import { executeBuy } from "./executeBuy.js";

export function handleYesterdayHighCross(cis, kite) {
    const strategyName = 'YesterdayHighCross';

    const lastCandle = cis.minuteData.slice(-1)[0];
    const yHigh = cis.pricePoints?.d1?.high;


     cis.deployedStrategies[strategyName] = 'checking';
    if (
        yHigh &&
        cis.tick.last_price > yHigh &&
        lastCandle.high < yHigh
    ) {
        cis.buyStrategy = strategyName;
        cis.signals[strategyName] = true;
        cis.entryHealth = `✅ Crossed yesterday's high (${yHigh})`;

         
        
        cis.returnPoints = `✅ [${strategyName}] LTP > Yesterday's High, but last candle high < it`;

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies[strategyName] = 'Activated';
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push(strategyName);
 console.log(global.clock,'Executing',cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    }

    // ❌ Condition not met
    // cis.signals[strategyName] = false;
    // cis.returnPoints = `❌ [${strategyName}] LTP ≤ Yesterday's High or last candle already broke it`;
    // cis.strategyTested = cis.strategyTested || [];
    // cis.strategyTested.push(strategyName);
     cis.deployedStrategies[strategyName] = 'unFulfilled';

    return false;
}
