// handleLastCandleHighBelowMA20.js

import { executeBuy } from './executeBuy.js';

/**
 * Strategy: HighBelowMA20-LTPCross
 * - Buy when last candle's high < MA20
 * - AND LTP > MA20
 */
export function handleLastCandleHighBelowMA20(cis, kite) {
  const strategyName = 'HighBelowMA20-LTPCross';

  const candles = cis.minuteData;
  const ma20 = cis.ma20;
  const ltp = cis.tick.last_price;

  if (!candles || candles.length === 0 || !ma20 || !ltp) {
    cis.returnPoints = `❌ [${strategyName}] Missing data for MA20 strategy`;
    cis.strategyTested = cis.strategyTested || [];
    cis.strategyTested.push(strategyName);
    return false;
  }

  const lastCandle = candles[candles.length - 1];

  if (lastCandle.high < ma20 && ltp > ma20) {
    cis.buyStrategy = strategyName;
    cis.entryHealth = `✅ Buy: High < MA20 && LTP > MA20`;
    cis.returnPoints = `📈 [${strategyName}] LTP crossed above MA20 after candle high stayed below it`;

    cis.targetPrice = ltp + cis.liveMinute.range;
    cis.stopLossPrice = ltp - cis.liveMinute.range;
    cis.inbuiltTarget = true;
    cis.inbuiltStopLoss = true;

    executeBuy(cis, kite, Math.ceil(ltp));
    return true;
  }

  cis.returnPoints = `❌ [${strategyName}] Condition not met: Candle high ≥ MA20 or LTP ≤ MA20`;
  cis.strategyTested = cis.strategyTested || [];
  cis.strategyTested.push(strategyName);
  return false;
}
