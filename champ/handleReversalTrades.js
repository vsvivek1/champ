import { executeBuy } from "./executeBuy.js";
import { reversalCheck } from "./reversalCheck.js";

export function handleReversalTrades(cis, kite) {

    cis.deployedStrategies.reversa30 = 'notActivated';

    const rversa = reversalCheck(cis.minuteData, cis);
    if (rversa) {

        cis.signals.reversa30 = true;
        cis.buyStrategy = 'reversa30';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies.reversa30 = 'Activated';
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));

        return true; // Indicates a trade was executed
    } else {
        cis.signals.reversa30 = false;
        cis.returnPoints = '❌ [reversa30] reversalCheck returned false';
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push('reversa30');
    }

    cis.deployedStrategies.reversa30 = 'notActivated';
    return false;
}
