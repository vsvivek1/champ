import { executeBuy } from "./executeBuy.js";

/**
 * Checks if LTP equals open price at a specific second (e.g., 59th sec)
 * and open == low (open-low scenario).
 */
function isOpenLowAtSpecificSeconds(cis) {
    const sec = global.seconds;
    const ohlc = cis.tick.ohlc;

    return (
        sec === 59 &&
        cis.tick.last_price === ohlc.open &&
        ohlc.open === ohlc.low
    );
}

/**
 * Executes a trade if open == low and current second is specific (e.g., 59).
 */
export function handleOpenLowAtSpecificSeconds(cis, kite) {
    const strategyName = 'OpenLowAtSpecificSeconds';

    if (isOpenLowAtSpecificSeconds(cis)) {
        cis.signals[strategyName] = true;
        cis.buyStrategy = strategyName;
        cis.entryHealth = `✅ Open = Low and LTP at exact second ${global.seconds}`;
        cis.returnPoints = `✅ [${strategyName}] Open == Low && price == open at ${global.seconds}s`;

        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;

        cis.deployedStrategies[strategyName] = 'Activated';
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push(strategyName);

        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true;
    } else {
        cis.signals[strategyName] = false;
        cis.returnPoints = `❌ [${strategyName}] Condition failed: Open != Low or not at 59s`;
        cis.strategyTested = cis.strategyTested || [];
        cis.strategyTested.push(strategyName);
        cis.deployedStrategies[strategyName] = 'notActivated';
        return false;
    }
}
