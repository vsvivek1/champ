import { executeBuy } from "./executeBuy.js";
import { compareVolatility } from "./compareVolatility.js";
import { highAfter11AM } from "./highAfter11.js";


export function handleAfternoonBreakouts(cis, kite) {
    if (!(global.hours >= 12 && global.hours < 16)) return false;


    //highAfter11AM
    let strategyName = '';
    const lastCandle = cis.minuteData.slice(-1)[0];

    // ✅ Strategy 1: Volatility Breakout
    if (cis.minuteData.length > 15) {
        const volResult = compareVolatility(cis.minuteData);
        if (
            volResult.lastFiveVolatility > volResult.previousTenVolatility * 1.4 &&
            cis.tick.last_price > lastCandle.high
        ) {
            strategyName = 'VolatilityBreakout';
            return executeStrategy(strategyName, cis, kite, 'Sudden volatility + price breakout');
        }
    }

    // ✅ Strategy 2: High Cross After 11AM
    const highAfter11 = highAfter11AM(cis);
    if (
        lastCandle.low < highAfter11.highest &&
        cis.tick.last_price > highAfter11.highest
    ) {
        strategyName = 'HighCrossAfter11';
        return executeStrategy(strategyName, cis, kite, 'LTP crossed high made after 11AM');
    }

    // ❌ Neither condition matched
    const testedNames = ['VolatilityBreakout', 'HighCrossAfter11'];
    cis.strategyTested = cis.strategyTested || [];
    testedNames.forEach(name => cis.strategyTested.push(name));
    cis.returnPoints = '❌ [VolatilityBreakout/HighCrossAfter11] No afternoon breakout condition met';
    return false;
}

function executeStrategy(name, cis, kite, reason) {
    cis.buyStrategy = name;
    cis.entryHealth = `✅ ${reason}`;
    cis.returnPoints = `✅ [${name}] ${reason}`;

    cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
    cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
    cis.inbuiltTarget = true;
    cis.inbuiltStopLoss = true;

    cis.deployedStrategies[name] = 'Activated';
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(name);

    executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
    return true;
}
