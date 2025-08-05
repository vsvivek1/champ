import { executeBuy } from "./executeBuy.js";

export function handleMA20Reclaim(cis, kite) {



    cis.deployedStrategies = cis.deployedStrategies || {};
    cis.signals = cis.signals || {};
    cis.strategyTested = cis.strategyTested || [];

    const candles = cis.minuteData;
    const last = candles?.at(-1);
    const ma20 = cis.ma20;
    const ltp = cis.tick?.last_price;

    // Basic safety check
    if (!last || !ltp || ma20 == undefined) {
        cis.returnPoints = '❌ [ma20Reclaim] Incomplete data';
        cis.strategyTested.push('ma20Reclaim');
        return false;
    }

    const condition = last.low < ma20 && last.close > ma20 && ltp > ma20 && global.seconds>57;

    if (condition) {
        cis.buyStrategy = 'ma20Reclaim';
        cis.targetPrice = ltp + cis.liveMinute.range;
        cis.stopLossPrice = ltp - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.deployedStrategies.ma20Reclaim = 'Activated';
        cis.signals.handleMA20Reclaim = true;
        cis.entryHealth = '✅ MA20 Reclaim with Follow-Through triggered';

        console.log(global.clock,'Executing',cis.tradingsymbol, cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(ltp));

        return true;
    } else {
        // cis.deployedStrategies.ma20Reclaim = 'touched';
        // cis.returnPoints = '❌ [ma20Reclaim] Condition not met';
        // cis.strategyTested.push('ma20Reclaim');
        return false;
    }
}
