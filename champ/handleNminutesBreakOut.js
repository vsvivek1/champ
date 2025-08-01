// handleNminuteBreakout.js

import { executeBuy } from "./executeBuy.js";

/**
 * Executes a breakout trade if current price breaks above the high of the last N candles.
 * @param {Object} cis - The context/state object containing market data.
 * @param {Object} kite - The trading API instance.
 * @param {number} n - Number of previous candles to consider for breakout.
 * @returns {boolean} - Returns true if a trade is executed, false otherwise.
 */
export function handleNminuteBreakout(cis, kite, n) {
  const strategyName = `rangeBreakout${n}minute`;
  cis.deployedStrategies[strategyName] = 'checking';

 

  const breakout = checkNMinuteBreakout(cis.minuteData, cis, n, strategyName);
  if (breakout) {
    cis.signals[strategyName] = true;
    cis.buyStrategy = strategyName;
    cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
    cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
    cis.inbuiltTarget = true;
    cis.inbuiltStopLoss = true;

   cis.deployedStrategies[strategyName] = 'Activated';

     cis.entryHealth=strategyName;
         console.log(global.clock,'Executing',cis.entryHealth);
    executeBuy(cis, kite, Math.ceil(cis.tick.last_price));

    return true;
  }

  // cis.signals[strategyName] = false;
  // cis.deployedStrategies[strategyName] = 'touched';

  cis.deployedStrategies[strategyName] = 'unFulfilled';

  // // Log strategy tested
  // cis.strategyTested = cis.strategyTested || [];
  // cis.strategyTested.push(strategyName);

  // cis.returnPoints = `❌ [${strategyName}] No breakout above high`;
  return false;
}

/**
 * Checks if there is a breakout above the high of the last N candles.
 * @param {Array} minuteData - Array of OHLC candles.
 * @param {Object} cis - Context object.
 * @param {number} n - Number of candles to check.
 * @param {string} strategyName - Strategy label
 * @returns {boolean} - True if breakout detected.
 */
function checkNMinuteBreakout(minuteData, cis, n, strategyName) {
  if (minuteData.length < n) {
    cis.returnPoints = `⛔ [${strategyName}] Not enough candles (${minuteData.length}/${n})`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
    return false;
  }

  const block = minuteData.slice(-n);
  const high = Math.max(...block.map(c => c.high));
  const currentPrice = cis.tick.last_price;

  if (currentPrice > high) {
    cis.returnPoints = `✅ [${strategyName}] Breakout: LTP > ${n}-min high`;
    return true;
  }

  cis.returnPoints = `❌ [${strategyName}] LTP ≤ ${n}-min high`;
  cis.strategyTested = cis.strategyTested || [];
  cis.strategyTested.push(strategyName);
  return false;
}
