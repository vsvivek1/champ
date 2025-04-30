import { executeBuy } from "./executeBuy.js";
import { reversalCheck } from "./reversalCheck.js";

export function handleReversalTrades(cis, kite) {


    const rversa = reversalCheck(cis.minuteData, cis);
    if (rversa) {

        cis.signals.reversa30=true
        cis.buyStrategy = 'rversa30';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true; // Indicates a trade was executed
    }else{

        cis.signals.reversa30=false;
    }
    return false;
}
