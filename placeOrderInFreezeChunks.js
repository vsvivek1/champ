const { getFreezeLimit } = require('./getFreezeLimit.js');

// F&O exchanges reject a single order above the per-symbol "freeze quantity"
// (RMS rule check). For NIFTY/BANKNIFTY/FINNIFTY/etc, split the order into
// freeze-limit-sized chunks placed one after another, with any remainder
// placed last, instead of letting the whole order get rejected.
async function placeOrderInFreezeChunks(kite, orderParams, lotSize) {
  const freezeLimit = getFreezeLimit(orderParams.tradingsymbol);
  const totalQty = orderParams.quantity;

  if (!freezeLimit || totalQty <= freezeLimit) {
    const response = await kite.placeOrder('regular', orderParams);
    return [response.order_id];
  }

  console.log(`⚠️ ${orderParams.tradingsymbol} quantity ${totalQty} exceeds freeze limit ${freezeLimit}, splitting into chunks.`);

  const orderIds = [];
  let remaining = totalQty;

  while (remaining > 0) {
    let chunkQty = Math.min(remaining, freezeLimit);

    if (lotSize && chunkQty % lotSize !== 0) {
      chunkQty = Math.floor(chunkQty / lotSize) * lotSize;
    }
    if (chunkQty <= 0) break;

    const response = await kite.placeOrder('regular', { ...orderParams, quantity: chunkQty });
    const orderId = response.order_id;
    orderIds.push(orderId);
    console.log(`  ↳ placed chunk of ${chunkQty} for ${orderParams.tradingsymbol}, order ID: ${orderId}`);
    remaining -= chunkQty;
  }

  return orderIds;
}

module.exports = { placeOrderInFreezeChunks };
