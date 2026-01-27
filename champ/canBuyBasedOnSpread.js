export function canBuyBasedOnSpread(
  tick,
  {
    maxSpreadPct = 0.0015 // 0.15%
  } = {}
) {
  const buy = tick?.depth?.buy || [];
  const sell = tick?.depth?.sell || [];

  if (!buy.length || !sell.length) return false;

  // Best prices
  const bestBid = buy[0].price;
  const bestAsk = sell[0].price;

  if (bestBid <= 0 || bestAsk <= 0) return false;

  const spread = bestAsk - bestBid;
  if (spread <= 0) return true; // crossed / locked market

  const mid = (bestAsk + bestBid) / 2;
  const spreadPct = spread / mid;

  return spreadPct <= maxSpreadPct;
}
