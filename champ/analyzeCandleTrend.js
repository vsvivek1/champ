function analyzeCandleTrend(cis, lookback = 15) {
  if (!cis || !Array.isArray(cis.minuteData)) return cis;

  const candles = cis.minuteData.slice(-lookback);

  if (candles.length < lookback) {
    cis.isTrending = false;
    cis.trendDirection = "NONE";
    return cis;
  }

  // 1️⃣ Candle heights
  const heights = candles
    .map(c => (typeof c.high === "number" && typeof c.low === "number")
      ? c.high - c.low
      : 0
    )
    .filter(h => h > 0);

  if (heights.length === 0) {
    cis.isTrending = false;
    cis.trendDirection = "NONE";
    return cis;
  }

  // 2️⃣ Average candle size
  const avgSize =
    heights.reduce((a, b) => a + b, 0) / heights.length;

  const largeThreshold = avgSize * 1.4;

  // 3️⃣ Identify large candles
  let largeCount = 0;
  let greenLarge = 0;
  let redLarge = 0;

  candles.forEach(c => {
    const height = c.high - c.low;

    if (height >= largeThreshold) {
      largeCount++;

      if (c.close > c.open) greenLarge++;
      else if (c.close < c.open) redLarge++;
    }
  });

  const percentLarge = (largeCount / candles.length) * 100;

  // 4️⃣ Direction logic
  let direction = "NONE";

  if (percentLarge >= 60) {
    if (greenLarge / largeCount >= 0.6) direction = "BULL";
    else if (redLarge / largeCount >= 0.6) direction = "BEAR";
  }

  // 5️⃣ Set CIS properties
  cis.avgCandleSize = Number(avgSize.toFixed(2));
  cis.largeCandleThreshold = Number(largeThreshold.toFixed(2));
  cis.largeCandleCount = largeCount;
  cis.largeCandlePercent = Number(percentLarge.toFixed(1));
  cis.trendDirection = direction;
  cis.isTrending = direction !== "NONE";

  return cis;
}
export default analyzeCandleTrend;