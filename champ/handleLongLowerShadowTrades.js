import { executeBuy } from "./executeBuy.js";

export function handleLongLowerShadowTrades(cis, kite) {
    const strategyName = 'hasLongLowerShadowAboveOpenAt59';

    if (
        cis.liveMinute.hasLongLowerShadow &&
        global.seconds === 59 &&
        cis.tick.last_price > cis.tick.ohlc.open
    ) {
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.buyStrategy = strategyName;

        cis.deployedStrategies.handleLongLowerShadowTrades = 'Activated';

        cis.entryHealth=strategyName
         console.log('Executing',cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    }

    cis.returnPoints = `❌ [${strategyName}] No long lower shadow + close > open @59s`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
    cis.deployedStrategies.handleLongLowerShadowTrades = 'touched';
    return false;
}
