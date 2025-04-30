


import { executeBuy } from "./executeBuy.js";



export function buyAtHugeLastTick(cis,kite) {
    if (cis.hugeLastTick) {
        cis.signals.hugeLastTick=true
        cis.buyStrategy = 'hugeLastTick';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true; // Indicates

        return true
    }else{


        return false;
        
    }

    return false;
}

