// helpers.js

export function getBestAsk(tick) {
  const sell = (tick.depth?.sell) || [];
  const valid = sell
    .map(l => ({ price: Number(l.price || 0), qty: Number(l.quantity || 0) }))
    .filter(l => l.price > 0);

  if (valid.length === 0) return null;
  valid.sort((a, b) => a.price - b.price);
  return valid[0];
}

export function getBestBid(tick) {
  const buy = (tick.depth?.buy) || [];
  const valid = buy
    .map(l => ({ price: Number(l.price || 0), qty: Number(l.quantity || 0) }))
    .filter(l => l.price > 0);

  if (valid.length === 0) return null;
  valid.sort((a, b) => b.price - a.price);
  return valid[0];
}

export function sumTopNQty(arr, n = 5) {
  if (!Array.isArray(arr)) return 0;

  const valid = arr
    .map(l => ({ price: Number(l.price || 0), qty: Number(l.quantity || 0) }))
    .filter(l => l.price > 0 && l.qty > 0);

  valid.sort((a, b) => b.price - a.price);
  return valid.slice(0, n).reduce((acc, cur) => acc + cur.qty, 0);
}

export function hasBidSide(tick) {
  return getBestBid(tick) !== null;
}

export function hasTightSpread(tick, maxPct = 0.002) {
  const bid = getBestBid(tick);
  const ask = getBestAsk(tick);
  if (!bid || !ask) return false;

  const spread = ask.price - bid.price;
  const mid = (ask.price + bid.price) / 2;

  return spread / mid <= maxPct;
}

export function isAggressiveBuyer(tick) {
  const ask = getBestAsk(tick);
  if (!ask) return false;
  return Number(tick.last_price || 0) >= ask.price;
}

export function hasPositiveImbalance(tick, threshold = 0.2, topN = 5) {
  const buyArr = tick.depth?.buy || [];
  const sellArr = tick.depth?.sell || [];

  const bidQty = sumTopNQty(buyArr, topN);
  const askQty = sumTopNQty(sellArr, topN);
  const total = bidQty + askQty;

  if (total === 0) return false;

  return (bidQty - askQty) / total > threshold;
}

export function hasMeaningfulLastQty(tick, minQty = 10) {
  return Number(tick.last_quantity || 0) >= minQty;
}

export function isPriceMovingUp(tick) {
  const last = Number(tick.last_price || 0);
  const open = Number(tick.ohlc?.open || 0);
  const prevClose = Number(tick.ohlc?.close || 0);

  if (last <= open) return false;
  if (last <= prevClose) return false;

  return true;
}
