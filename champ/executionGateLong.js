export function executionGateLong(
  cis,
  {
    maxWallPullPct = 0.3
  } = {}
) {
  const currTick = cis.tick;

  // always update prevTick at the end
  let allow = true;

  if (!currTick?.depth?.buy?.length || !currTick?.depth?.sell?.length) {
    allow = false;
  } else if (!cis.prevTick) {
    // first tick: no execution info yet
    allow = false;
  } else {
    const prevTick = cis.prevTick;

    const pb = prevTick.depth.buy;
    const ps = prevTick.depth.sell;
    const cb = currTick.depth.buy;
    const cs = currTick.depth.sell;

    // 1️⃣ aggressive execution check
    if (currTick.last_price < ps[0].price) {
      allow = false;
    }

    // 2️⃣ ask liquidity must reduce
    if (allow && cs[0].quantity >= ps[0].quantity) {
      allow = false;
    }

    // 3️⃣ buy wall must hold
    if (allow) {
      const prevLargestBuy = pb.reduce((a, b) =>
        b.quantity > a.quantity ? b : a
      );
      const currLargestBuy = cb.reduce((a, b) =>
        b.quantity > a.quantity ? b : a
      );

      const wallDropPct =
        (prevLargestBuy.quantity - currLargestBuy.quantity) /
        prevLargestBuy.quantity;

      if (wallDropPct > maxWallPullPct) {
        allow = false;
      }
    }
  }

  // update prevTick once per call
  cis.prevTick = currTick;

  return allow;
}
