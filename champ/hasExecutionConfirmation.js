export function hasExecutionConfirmation(
  prevTick,
  currTick,
  {
    maxWallPullPct = 0.3
  } = {}
) {
  const pb = prevTick?.depth?.buy || [];
  const ps = prevTick?.depth?.sell || [];
  const cb = currTick?.depth?.buy || [];
  const cs = currTick?.depth?.sell || [];

  if (!pb.length || !ps.length || !cb.length || !cs.length) return false;

  const prevBestAsk = ps[0];
  const currBestAsk = cs[0];

  // 1️⃣ Aggressive buying (trade at / above ask)
  if (currTick.last_price < prevBestAsk.price) return false;

  // 2️⃣ Ask liquidity getting eaten
  if (currBestAsk.quantity >= prevBestAsk.quantity) return false;

  // 3️⃣ Buy wall must not disappear
  const prevLargestBuy = pb.reduce((a, b) =>
    b.quantity > a.quantity ? b : a
  );
  const currLargestBuy = cb.reduce((a, b) =>
    b.quantity > a.quantity ? b : a
  );

  const wallDropPct =
    (prevLargestBuy.quantity - currLargestBuy.quantity) /
    prevLargestBuy.quantity;

  if (wallDropPct > maxWallPullPct) return false;

  // 4️⃣ Price acceptance above mid
  const bestBid = cb[0].price;
  const bestAsk = cs[0].price;
  const mid = (bestBid + bestAsk) / 2;

  if (currTick.last_price < mid) return false;

  return true;
}
