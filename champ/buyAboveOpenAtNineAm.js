import { executeBuy } from "./executeBuy.js";



export function buyAboveOpenAtNineAm(cis,kite) {
    if (global.hours == 9 && global.minutes > 17 && cis.tick.last_price > cis.tick.ohlc.open && !cis.isGapDown) {
        cis.signals.openAboveAndGreenCandleBefore920=true
        cis.buyStrategy = 'openAboveAndGreenCandleBefore920';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true; // Indicates

        return true
    }else{


        
    }

    return false;
}

