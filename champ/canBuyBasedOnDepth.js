export function canBuyBasedOnDepth(
  tick,
  {
    minImbalance = 1.2,
    maxSellVsBuyWall = 0.5,
    minBuyWallShare = 0.3,
    minOrdersInWall = 5
  } = {}
) {
  const buy = tick?.depth?.buy || [];
  const sell = tick?.depth?.sell || [];

  if (!buy.length || !sell.length) return false;

  const totalBuyQty = buy.reduce((s, l) => s + l.quantity, 0);
  const totalSellQty = sell.reduce((s, l) => s + l.quantity, 0);

  if (totalBuyQty < minImbalance * totalSellQty) return false;

  const largestBuy = buy.reduce((a, b) =>
    b.quantity > a.quantity ? b : a
  );

  if (
    largestBuy.quantity < minBuyWallShare * totalBuyQty ||
    largestBuy.orders < minOrdersInWall
  ) {
    return false;
  }

  const avgBuyQty = totalBuyQty / buy.length;
  if (buy[0].quantity < avgBuyQty) return false;

  const largestSell = sell.reduce((a, b) =>
    b.quantity > a.quantity ? b : a
  );

  if (sell[0].quantity > largestBuy.quantity * maxSellVsBuyWall)
    return false;

  if (largestSell.quantity > 0.4 * totalSellQty)
    return false;

  return true;
}
