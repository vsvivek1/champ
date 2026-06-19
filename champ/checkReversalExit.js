// checkReversalExit.js
// Profit-side exit: no fixed target -- let the trade run, exit only when
// price is already above entry AND a structural reversal (lower-high +
// lower-low) shows up. The protective SL order (placeTargetOrder.js) still
// guards the downside independently of this.
import { hasLowerHighLowerLow } from './stopLossEngine.js';

export async function checkReversalExit(cis, kite) {
  if (!cis.hasLivePosition || !cis.tick || !cis.buyPrice) return;
  if (cis.reversalExitInProgress) return;

  const inProfit = cis.tick.last_price > cis.buyPrice;
  if (!inProfit) return;

  if (!hasLowerHighLowerLow(cis)) return;

  cis.reversalExitInProgress = true;

  try {
    const openOrders = global.orders.filter(
      o => o.tradingsymbol == cis.tradingsymbol && o.status == 'OPEN'
    );

    const qty = Math.abs(cis.position?.quantity) ||
      openOrders.reduce((s, o) => s + o.quantity, 0);

    if (!qty) {
      return;
    }

    for (const order of openOrders) {
      await kite.cancelOrder('regular', order.order_id);
    }

    // A couple of ticks below LTP so the LIMIT sell is marketable and fills now.
    const exitPrice = Math.round(cis.tick.last_price * 0.99 * 10) / 10;

    await kite.placeOrder('regular', {
      exchange: cis.exchange,
      tradingsymbol: cis.tradingsymbol,
      transaction_type: 'SELL',
      order_type: 'LIMIT',
      quantity: qty,
      price: exitPrice,
      product: 'NRML',
      validity: 'DAY'
    });

    cis.sellType = 'reversal';
    cis.sellStrategy = 'lowerHighLowerLow';
    console.log(`Reversal exit placed for ${cis.tradingsymbol} at ${exitPrice}`);
  } catch (err) {
    console.error(`Reversal exit failed for ${cis.tradingsymbol}`, err);
  } finally {
    cis.reversalExitInProgress = false;
  }
}
