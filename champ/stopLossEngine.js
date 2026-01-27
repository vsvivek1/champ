/* =====================================================
 * STOP LOSS ENGINE – SINGLE FILE (ESM)
 * ===================================================== */

/*
  Assumptions:
  - cis.minuteData → completed candles only
  - cis.tick.last_price → live price
  - cis.liveCandleColor → 'GREEN' | 'RED'
  - global.seconds → seconds of current minute (0–59)
*/

/* -----------------------------------------------------
 * 1. Day Low Breakdown (Completed Candles Only)
 * ----------------------------------------------------- */
export function isBelowDayLow(cis) {
  if (!cis.minuteData || cis.minuteData.length < 2) return false;

  const completed = cis.minuteData.slice(0, -1);
  const dayLow = Math.min(...completed.map(c => c.low));

  return cis.tick.last_price < dayLow;
}

/* -----------------------------------------------------
 * 2. Lower High + Lower Low (Last 2 Completed Candles)
 * ----------------------------------------------------- */
export function hasLowerHighLowerLow(cis) {
  const candles = cis.minuteData;
  if (!candles || candles.length < 3) return false;

  const prev = candles[candles.length - 3];
  const last = candles[candles.length - 2];

  return last.high < prev.high && last.low < prev.low;
}

/* -----------------------------------------------------
 * 3. Below Last 3 Completed Candles Low
 * ----------------------------------------------------- */
export function isBelowLast3CandleLow(cis) {
  const candles = cis.minuteData;
  if (!candles || candles.length < 4) return false;

  const last3 = candles.slice(-4, -1);
  const lowestLow = Math.min(...last3.map(c => c.low));

  return cis.tick.last_price < lowestLow;
}

/* -----------------------------------------------------
 * 4. Live Candle Timing + Color Gate
 * ----------------------------------------------------- */
export function isValidLiveCandleSLWindow(cis, global) {
  const sec = global.seconds;

  // Allow SL only between 30s and 45s
  if (sec < 30 || sec > 45) return false;

  // Direct red candle
  if (cis.liveMinute.color === 'bearish') return true;

  // After 2+ green candles, red candle
  if (cis.prevGreenCount >= 2 && cis.liveCandleColor === 'bearish') {

    return true;
  }
cis.returnPoints="is valid live candle sl window false"
  return false;
}

/* -----------------------------------------------------
 * 5. MASTER STOP LOSS DECISION FUNCTION
 * ----------------------------------------------------- */
export function shouldTriggerStopLoss(cis, global) {

  // Live candle timing & color filter
  if (!isValidLiveCandleSLWindow(cis, global)) {
    return false;
  }

  if (isBelowDayLow(cis)) {
    cis.slReason = 'DAY_LOW_BREAK';
   
    return true;
  }

  if (hasLowerHighLowerLow(cis)) {
    cis.slReason = 'LOWER_HIGH_LOWER_LOW';
    return true;
  }

  if (isBelowLast3CandleLow(cis)) {
    cis.slReason = 'LAST_3_CANDLE_LOW_BREAK';
    cis.returnPoints="is below day low true"
    return true;
  }
 cis.returnPoints="no sl triggeres"
  return false;
}

/* -----------------------------------------------------
 * 6. GREEN / RED TRACKER (CALL EVERY TICK)
 * ----------------------------------------------------- */
// export function updateLiveCandleColorStats(cis) {
// //   if (cis.liveCandleColor === 'GREEN') {
// //     cis.prevGreenCount = (cis.prevGreenCount || 0) + 1;
// //   } else {
// //     cis.prevGreenCount = 0;
// //   }
// // }
