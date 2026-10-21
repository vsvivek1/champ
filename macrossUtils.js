// maCrossUtils.cjs

/**
 * Attach MA20 and MA50 to each OHLC candle
 */
const attachMovingAverages = (candles) => {
  const closes = candles.map(c => c.close);

  return candles.map((candle, i) => {
    const ma20 =
      i + 1 < 20
        ? null
        : closes
            .slice(i + 1 - 20, i + 1)
            .reduce((a, b) => a + b, 0) / 20;

    const ma50 =
      i + 1 < 50
        ? null
        : closes
            .slice(i + 1 - 50, i + 1)
            .reduce((a, b) => a + b, 0) / 50;

    return {
      ...candle,
      ma20,
      ma50
    };
  });
};

/**
 * MA20 < MA50 for 15 mins → crossover → stay above for N mins
 */
const hasConfirmedRecentCross = (
  candles,
  {
    belowMinutes = 15,
    crossLookback = 5,
    confirmMinutes = 3
  } = {}
) => {
  const len = candles.length;
  if (len < 50 + belowMinutes + confirmMinutes) {
    return { signal: false };
  }

  for (let i = len - crossLookback; i < len; i++) {
    if (
      i <= belowMinutes ||
      candles[i - 1].ma20 >= candles[i - 1].ma50 ||
      candles[i].ma20 <= candles[i].ma50
    ) continue;

    // MA20 below MA50 before cross
    const belowOk = candles
      .slice(i - belowMinutes, i)
      .every(c => c.ma20 !== null && c.ma20 < c.ma50);

    if (!belowOk) continue;

    // MA20 stays above after cross
    const stayedAbove = candles
      .slice(i, Math.min(i + confirmMinutes, len))
      .every(c => c.ma20 > c.ma50);

    if (!stayedAbove) continue;

    return {
      signal: true,
      crossIndex: i,
      crossTime: candles[i].time,
      price: candles[i].close
    };
  }

  return { signal: false };
};

module.exports = {
  attachMovingAverages,
  hasConfirmedRecentCross
};
