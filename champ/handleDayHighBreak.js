import { executeBuy } from "./executeBuy.js";
import { reversalCheck } from "./reversalCheck.js";

export function handleDayHighBreak(cis, kite) {

    cis.deployedStrategies= cis.deployedStrategies || [];

    cis.deployedStrategies.reversa30 = 'touched';


    let dayHighBeforeFinalCandle =Math.max(...cis.minuteData.slice(0, cis.minuteData.length - 2).map(d => d.high));
    let finalCandle = cis.minuteData[cis.minuteData.length - 1];



    if (cis.tick.last_price > finalCandle.high  && finalCandle.high < dayHighBeforeFinalCandle) {

  
        cis.buyStrategy = 'dayhigh break';
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies.dayHighBreak = 'Activated';
        cis.signals.handleDayHighBreak = true;
        cis.entryHealth = 'Day High Break triggered';
        console.log(global.clock, 'Executing Day High Break triggered', cis.tradingsymbol, cis.entryHealth);
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price- cis.liveMinute.range));

        return true; // Indicates a trade was executed
    } else {
       // cis.signals=cis.signals||{}
  
       // cis.returnPoints = '❌ [reversa30] reversalCheck returned false';
       // cis.strategyTested = cis.strategyTested || [];
       // cis.strategyTested.push('reversa30');
        

       return false; // Indicates no trade was executed
    }


    // if(cis.deployedStrategies)cis.deployedStrategies={}
    // cis.deployedStrategies.reversa30 = 'touched';
    return false;
}
