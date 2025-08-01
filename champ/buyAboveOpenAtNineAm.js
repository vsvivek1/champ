import { executeBuy } from "./executeBuy.js";

export function buyAboveOpenAtNineAm(cis, kite) {
    const strategyName = 'openAboveAndGreenCandleBefore920';

    if (
        global.hours == 9 &&
        global.minutes > 16 &&
        global.minutes < 30 &&
        cis.tick.last_price > cis.tick.ohlc.open &&
        !cis.isGapDown
    ) {
        cis.signals[strategyName] = true;
        cis.buyStrategy = strategyName;
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies.buyAboveOpenAtNineAm = 'Activated';

        cis.entryHealth='BuyOpenAboveNineBefore930';
         console.log(global.clock,'Executing',cis.tradingsymbol,cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        
        return true;
    } else {
        // cis.returnPoints = `❌ [${strategyName}] Conditions not met (time: ${global.hours}:${global.minutes})`;
        // cis.strategyTested = cis.strategyTested || [];
        // cis.strategyTested.push(strategyName);

        return false;
    }

    cis.deployedStrategies.buyAboveOpenAtNineAm = 'touched';
    return false;
}
