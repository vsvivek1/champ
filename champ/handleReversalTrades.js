import { executeBuy } from "./executeBuy.js";
import { reversalCheck } from "./reversalCheck.js";

export function handleReversalTrades(cis, kite) {

    cis.deployedStrategies= cis.deployedStrategies || [];

    cis.deployedStrategies.reversa30 = 'touched';

    const rversa = reversalCheck(cis.minuteData, cis);
    if (rversa && cis.tick.last_price > cis.ma20) {

  
        cis.buyStrategy = 'reversa30';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies.reversa30 = 'Activated';
        cis.signals.handleReversalTrades=true;
cis.entryHealth='Reversa 30 triggered';
         console.log('Executing',cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));

        return true; // Indicates a trade was executed
    } else {
        cis.signals=cis.signals||{}
  
        cis.returnPoints = '❌ [reversa30] reversalCheck returned false';
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push('reversa30');
        
    }


    if(cis.deployedStrategies)cis.deployedStrategies={}
    cis.deployedStrategies.reversa30 = 'touched';
    return false;
}
