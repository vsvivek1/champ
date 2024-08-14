import { KiteTicker } from 'kiteconnect';
import { handlePositionPresent, handleNoPosition } from './tradingStrategy.js';
import { fetchOrdersAndSetCis, fetchPositionsAndSetCis } from './orders.js';

let lastPrice = null;
let lowerLowsCount = 0;

export function initTicker(kite, instruAll, orders, date) {
    const ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.connect();
    ticker.on("connect", () => subscribe(ticker, instruAll));
    ticker.on("ticks", (ticks) => onTicks(ticks, kite, instruAll, orders, date)); // Pass kite here
    ticker.on("order_update", (order) => orderUpdates(order, kite, instruAll));
}

function subscribe(ticker, instruAll) {
    const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));
    ticker.unsubscribe([]);
    ticker.subscribe(instrument_tokens);
    ticker.setMode(ticker.modeFull, instrument_tokens);
}

function onTicks(ticks, kite, instruAll, orders, date) { // Accept kite here
    ticks.forEach(tick => {
        const cis = instruAll.find(i => i.instrument_token == tick.instrument_token);
        if (!cis) return;

        cis.tick = tick;
        const hasPosition = cis.hasLivePosition;

        if (hasPosition) {
            handlePositionPresent(cis, kite, orders); // Pass kite here
        } else {
            handleNoPosition(cis, kite, date); // Pass kite here
        }
    });
}

async function orderUpdates(order, kite, instruAll) {
    let cis = instruAll.find(i => i.instrument_token == order.instrument_token);
    if (!cis) return;

    if (order.status == 'COMPLETE' && order.transaction_type == 'SELL') {
        cis.noBuy = true;
        let dt = new Date();
        dt.setMinutes(dt.getMinutes() + 1);
        cis.noBuyTime = dt.getTime();

        cis.lastSeenHigh = 0;
        cis.ordered = false;
        cis.hasLivePosition = false;
        cis.updated = false;
        cis.placedTarget = false;

        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);
    }

    if (order.status == 'COMPLETE' && order.transaction_type == 'BUY') {
        await fetchOrdersAndSetCis(kite, instruAll);
        await fetchPositionsAndSetCis(kite, instruAll);

        cis.buyPrice = order.price;
        cis.updated = false;
    }
}
