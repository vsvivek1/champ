import { KiteTicker } from 'kiteconnect';
import { extractTicks } from './ticks.js';

let ticker;

export function initTicker(kite, onTicks, subscribe, orderUpdates) {
    ticker = new KiteTicker({
        api_key: kite.api_key,
        access_token: kite.access_token
    });

    ticker.connect();
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);
    ticker.on("order_update", orderUpdates);
}

export function subscribe() {
    const instrument_tokens = instruAll.map(a => parseInt(a.instrument_token));
    ticker.subscribe(instrument_tokens);
    ticker.setMode(ticker.modeFull, instrument_tokens);
}