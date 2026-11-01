/*

mockBroker.js -- a paper-trading stand-in for the Kite order API.

Wraps a REAL KiteConnect instance. Everything that only READS the market
(instruments, LTP, quotes, history) passes straight through to Kite, so the
prices, candles, levels and circuit bands a mock trade is judged against are
the real ones. Everything that WRITES (placeOrder / modifyOrder / cancelOrder)
and everything that reports ownership (getOrders / getPositions / getMargins)
is simulated in memory. No order ever reaches the exchange.

That split is the whole point: chartApp's guard, its no-trade gate, its
breach level, its partial/trail ratchet and its post-trade review all run
UNCHANGED against this object. A mock session exercises the same code that
trades real money -- the only difference is where the orders go.

FILL MODEL
----------
Marketability is decided when the order is placed or modified, against the
LTP at that moment, because that is what decides it in reality too:

  marketable   BUY  LIMIT at/above the market, SELL LIMIT at/below it.
               Fills at the LTP of the next sweep -- the price you would
               actually have paid, NOT your padded limit. chartApp sends
               ltp*1.02 to buy and ltp*0.97 to dump; charging the pad as
               slippage would invent a 3% loss on every exit.
  resting      a target LIMIT above the market, or a BUY below it. Fills at
               the LIMIT price once the LTP crosses it -- price came to the
               order, so the order gets its number.
  SL (stop)    TRIGGER PENDING until the LTP trades at/through the trigger,
               then it is a marketable SELL: fills at max(limit, LTP), so a
               gap straight through the trigger fills at the gapped price
               (that is what a stop does) but never below the limit leg.

A fill is emitted ASYNCHRONOUSLY (fillDelayMs, default 250ms) on the event
loop, never inside placeOrder(). Real fills arrive later over the ticker and
the guard is written for that; a synchronous callback would reenter
placeFirstOrder() before its own BUY had returned.

STATE
-----
Positions, orders and simulated cash are persisted to a state file after
every change, so a restart mid-trade resumes holding what it held -- the
same restart tolerance guardRefresh() already has for the real account. The
file carries its trading date and resets itself on a new day.

*/

const fs = require('fs');

const DEFAULTS = {
    cash: 200000,           // simulated opening balance
    fillDelayMs: 250,       // how long a marketable order waits before it fills
    stateFile: null,        // where to persist; null = memory only
    chargesPerOrder: 0,     // flat per-order cost, if you want brokerage modelled
};

const RESTING = ['OPEN', 'TRIGGER PENDING'];

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/*
realKite  a live KiteConnect instance (read-only use)
ltpOf     (token) => last traded price, or null. chartApp's lastLtpByToken.
tokenOf   (exchange, tradingsymbol) => instrument_token
lotOf     (token) => lot size
onUpdate  (orderUpdate) => void. Same payload shape as ticker's order_update.
*/
function createMockBroker(realKite, { ltpOf, tokenOf, lotOf, onUpdate, ...opts } = {}) {

    const cfg = { ...DEFAULTS, ...opts };

    let orders = [];                 // mock order book, newest last (Kite's order)
    let positions = new Map();       // tradingsymbol -> position row
    let cash = cfg.cash;
    let seq = 0;
    const pendingFills = new Map();  // order_id -> ms it becomes eligible

    // ---------------------------------------------------------------- state

    function persist() {
        if (!cfg.stateFile) return;
        try {
            fs.writeFileSync(cfg.stateFile, JSON.stringify({
                date: todayStr(), cash, seq,
                orders,
                positions: [...positions.values()],
            }, null, 2));
        } catch (e) { console.log('⚠️ mock state write failed:', e.message || e); }
    }

    function restore() {
        if (!cfg.stateFile) return;
        let s;
        try { s = JSON.parse(fs.readFileSync(cfg.stateFile, 'utf8')); } catch (e) { return; }
        if (!s || s.date != todayStr()) {
            console.log(`🧪 mock: state file is from ${s && s.date || 'an unknown day'} — starting the day flat with ₹${cfg.cash}`);
            return;
        }
        orders = Array.isArray(s.orders) ? s.orders : [];
        for (const p of (s.positions || [])) positions.set(p.tradingsymbol, p);
        if (s.cash != null) cash = s.cash;
        seq = s.seq || 0;
        // order_timestamp survives JSON as a string; the app expects a Date
        for (const o of orders) if (o.order_timestamp) o.order_timestamp = new Date(o.order_timestamp);
        const open = [...positions.values()].filter(p => p.quantity > 0);
        console.log(`🧪 mock: resumed today's paper book — ${orders.length} order(s), `
            + `${open.length} open position(s)${open.length ? ': ' + open.map(p => `${p.tradingsymbol} ×${p.quantity}`).join(', ') : ''}, cash ₹${Math.round(cash)}`);
    }

    // ------------------------------------------------------------ positions

    function posOf(o) {
        let p = positions.get(o.tradingsymbol);
        if (!p) {
            p = {
                tradingsymbol: o.tradingsymbol, exchange: o.exchange,
                instrument_token: o.instrument_token, product: o.product || 'NRML',
                quantity: 0, average_price: 0, last_price: 0,
                buy_quantity: 0, buy_price: 0, buy_value: 0,
                sell_quantity: 0, sell_price: 0, sell_value: 0,
                day_buy_quantity: 0, day_sell_quantity: 0,
                overnight_quantity: 0, multiplier: 1,
                realised: 0, unrealised: 0, pnl: 0, m2m: 0, value: 0,
            };
            positions.set(o.tradingsymbol, p);
        }
        return p;
    }

    /*
    Kite reports pnl for the SYMBOL's whole day (realised on the closed part
    plus mark-to-market on what is still open), and keeps a flat position in
    net with quantity 0. logClosedTrade() reads day_sell_quantity off that
    row, so the shape matters as much as the number.
    */
    function applyFill(o, qty, price) {
        const p = posOf(o);
        if (o.transaction_type == 'BUY') {
            p.buy_quantity += qty; p.buy_value += qty * price;
            p.day_buy_quantity += qty;
            p.buy_price = p.buy_value / p.buy_quantity;
            p.quantity += qty;
            cash -= qty * price;
        } else {
            p.sell_quantity += qty; p.sell_value += qty * price;
            p.day_sell_quantity += qty;
            p.sell_price = p.sell_value / p.sell_quantity;
            p.quantity -= qty;
            cash += qty * price;
        }
        cash -= cfg.chargesPerOrder;
        // average_price is Kite's blended buy price for the day. chartApp
        // deliberately prefers the last COMPLETE BUY's average_price over
        // this, but guardRefresh falls back to it after a restart.
        p.average_price = p.buy_quantity ? p.buy_value / p.buy_quantity : 0;
        markPosition(p);
    }

    function markPosition(p) {
        const ltp = (ltpOf && ltpOf(Number(p.instrument_token))) || p.last_price || 0;
        p.last_price = ltp;
        const closedQty = Math.min(p.buy_quantity, p.sell_quantity);
        p.realised = closedQty
            ? +((p.sell_value / (p.sell_quantity || 1) - p.buy_value / (p.buy_quantity || 1)) * closedQty).toFixed(2)
            : 0;
        p.unrealised = p.quantity && ltp
            ? +((ltp - (p.buy_value / (p.buy_quantity || 1))) * p.quantity).toFixed(2)
            : 0;
        p.pnl = +(p.realised + p.unrealised).toFixed(2);
        p.m2m = p.pnl;
        p.value = +(p.sell_value - p.buy_value).toFixed(2);
    }

    // ----------------------------------------------------------- fill engine

    function emit(o, extra = {}) {
        const u = {
            order_id: o.order_id, exchange_order_id: o.order_id,
            placed_by: 'MOCK', variety: o.variety, status: o.status,
            tradingsymbol: o.tradingsymbol, exchange: o.exchange,
            instrument_token: o.instrument_token,
            transaction_type: o.transaction_type, order_type: o.order_type,
            product: o.product, validity: o.validity,
            price: o.price, trigger_price: o.trigger_price,
            quantity: o.quantity, filled_quantity: o.filled_quantity,
            pending_quantity: o.pending_quantity,
            average_price: o.average_price,
            order_timestamp: o.order_timestamp, exchange_timestamp: new Date(),
            tag: o.tag, status_message: o.status_message || null,
            mock: true,
            ...extra,
        };
        if (!onUpdate) return;
        // never inside the caller's placeOrder/modifyOrder stack
        setImmediate(() => { try { onUpdate(u); } catch (e) { console.log(e, '❌ mock order_update handler'); } });
    }

    function fill(o, price) {
        const qty = o.quantity - (o.filled_quantity || 0);
        if (qty <= 0) return;
        o.average_price = +Number(price).toFixed(2);
        o.filled_quantity = o.quantity;
        o.pending_quantity = 0;
        o.status = 'COMPLETE';
        applyFill(o, qty, o.average_price);
        pendingFills.delete(o.order_id);
        console.log(`🧪 MOCK FILL ${o.transaction_type} ${qty} ${o.tradingsymbol} @ ${o.average_price}`
            + ` (${o.order_type}${o.trigger_price ? ' trig ' + o.trigger_price : ''}`
            + `${o.price ? ' limit ' + o.price : ''}, ${o.marketable ? 'marketable' : 'rested'})`
            + ` — cash ₹${Math.round(cash)}`);
        // the fill update carries the FILLED quantity: that is what the guard
        // sizes its resting SELL from, and what logClosedTrade falls back to
        emit(o, { quantity: qty, filled_quantity: qty, pending_quantity: 0 });
        persist();
    }

    /*
    One pass over every working order. Called on each tick of a held/charted
    token and on a timer, so a marketable order does not sit unfilled waiting
    for its own instrument to print again.
    */
    function sweep(onlyToken) {
        const now = Date.now();
        let changed = false;

        for (const o of orders) {
            if (!RESTING.includes(o.status)) continue;
            if (onlyToken != null && Number(o.instrument_token) != Number(onlyToken)) continue;

            const ltp = ltpOf && ltpOf(Number(o.instrument_token));
            if (!(ltp > 0)) continue;

            // a stop has to trigger before it can fill
            if (o.status == 'TRIGGER PENDING') {
                const hit = o.transaction_type == 'SELL'
                    ? ltp <= o.trigger_price
                    : ltp >= o.trigger_price;
                if (!hit) continue;
                o.status = 'OPEN';
                o.marketable = true;
                pendingFills.set(o.order_id, now + cfg.fillDelayMs);
                console.log(`🧪 MOCK TRIGGER ${o.tradingsymbol} ${o.order_type} ${o.trigger_price} hit at ${ltp} — now a marketable SELL at ${o.price}`);
                emit(o);
                changed = true;
                continue;
            }

            const due = pendingFills.get(o.order_id);
            if (o.marketable) {
                if (due != null && now < due) continue;          // honour the fill delay
                /*
                A marketable order gets the market, not its own padded limit
                -- but never THROUGH the limit leg. If the market has since
                moved past it (a SELL limit of L with the LTP under L, a BUY
                limit over it), the order is not marketable any more: it
                stays working and waits to be crossed, exactly as it would
                at the exchange. That is also how a stop that gapped is
                modelled -- triggered, unfilled, still hanging there.
                */
                if (o.price > 0) {
                    const through = o.transaction_type == 'SELL' ? ltp < o.price : ltp > o.price;
                    if (through) continue;
                }
                fill(o, ltp);
                changed = true;
                continue;
            }

            // resting: price has to come to the order, and then it gets its number
            const crossed = o.transaction_type == 'SELL' ? ltp >= o.price : ltp <= o.price;
            if (crossed) { fill(o, o.price); changed = true; }
        }

        for (const p of positions.values()) markPosition(p);
        if (changed) persist();
    }

    // -------------------------------------------------------- order plumbing

    function nextId() {
        seq++;
        return `M${todayStr().replace(/-/g, '')}${String(seq).padStart(5, '0')}`;
    }

    function placeOrder(variety, params) {
        const token = Number(params.instrument_token)
            || (tokenOf ? Number(tokenOf(params.exchange, params.tradingsymbol)) : 0);
        const ltp = (ltpOf && token ? ltpOf(token) : null) || 0;
        const type = params.order_type || 'MARKET';
        const qty = Number(params.quantity);

        if (!(qty > 0)) return Promise.reject(new Error('mock: quantity must be positive'));
        if (!token) console.log(`⚠️ mock: no instrument_token for ${params.tradingsymbol} — it will not fill until one is known`);

        // the exchange's own naked-short check, which is the rule the whole
        // single-resting-order design exists to satisfy. Model it, or mock
        // mode would happily do the thing that gets rejected for real.
        if (params.transaction_type == 'SELL') {
            const p = positions.get(params.tradingsymbol);
            const held = p ? p.quantity : 0;
            const resting = orders
                .filter(o => o.tradingsymbol == params.tradingsymbol && o.transaction_type == 'SELL' && RESTING.includes(o.status))
                .reduce((s, o) => s + (o.quantity - (o.filled_quantity || 0)), 0);
            if (resting + qty > held) {
                const msg = `mock RMS: SELL ${qty} + ${resting} already resting exceeds the ${held} held in ${params.tradingsymbol} (naked short)`;
                console.log(`🚫 ${msg}`);
                return Promise.reject(new Error(msg));
            }
        }

        if (params.transaction_type == 'BUY') {
            const need = qty * (type == 'LIMIT' ? Number(params.price) : ltp || Number(params.price) || 0);
            if (need > cash) {
                const msg = `mock RMS: insufficient funds for ${qty} ${params.tradingsymbol} (need ₹${Math.round(need)}, have ₹${Math.round(cash)})`;
                console.log(`🚫 ${msg}`);
                return Promise.reject(new Error(msg));
            }
        }

        const isStop = type == 'SL' || type == 'SL-M';
        const o = {
            order_id: nextId(), variety: variety || 'regular',
            exchange: params.exchange, tradingsymbol: params.tradingsymbol,
            instrument_token: token,
            transaction_type: params.transaction_type,
            order_type: type,
            quantity: qty, filled_quantity: 0, pending_quantity: qty,
            price: params.price != null ? Number(params.price) : 0,
            trigger_price: params.trigger_price != null ? Number(params.trigger_price) : 0,
            product: params.product || 'NRML', validity: params.validity || 'DAY',
            status: isStop ? 'TRIGGER PENDING' : 'OPEN',
            average_price: 0, tag: params.tag || null,
            order_timestamp: new Date(), status_message: null,
        };
        o.marketable = !isStop && isMarketable(o, ltp);
        orders.push(o);
        if (o.marketable) pendingFills.set(o.order_id, Date.now() + cfg.fillDelayMs);

        console.log(`🧪 MOCK ${o.transaction_type} ${qty} ${o.tradingsymbol} ${type}`
            + `${o.price ? ' @ ' + o.price : ''}${o.trigger_price ? ' trig ' + o.trigger_price : ''}`
            + ` → ${o.order_id} [${o.status}${o.marketable ? ', marketable' : ''}]${o.tag ? ' ' + o.tag : ''}`);
        emit(o);
        persist();
        setImmediate(() => sweep(token));
        return Promise.resolve({ order_id: o.order_id });
    }

    function isMarketable(o, ltp) {
        if (!(ltp > 0)) return false;
        if (o.order_type == 'MARKET') return true;
        if (o.order_type != 'LIMIT') return false;
        return o.transaction_type == 'BUY' ? o.price >= ltp : o.price <= ltp;
    }

    function modifyOrder(variety, orderId, params) {
        const o = orders.find(x => x.order_id == orderId);
        if (!o) return Promise.reject(new Error(`mock: unknown order ${orderId}`));
        if (!RESTING.includes(o.status)) {
            return Promise.reject(new Error(`mock: order ${orderId} is ${o.status}, cannot modify`));
        }
        const before = `${o.order_type}${o.price ? ' @ ' + o.price : ''}${o.trigger_price ? ' trig ' + o.trigger_price : ''} ×${o.quantity}`;

        if (params.quantity != null) {
            const q = Number(params.quantity);
            if (q < (o.filled_quantity || 0)) return Promise.reject(new Error('mock: quantity below what is already filled'));
            o.quantity = q; o.pending_quantity = q - (o.filled_quantity || 0);
        }
        if (params.order_type != null) o.order_type = params.order_type;
        if (params.price != null) o.price = Number(params.price);
        if (params.trigger_price != null) o.trigger_price = Number(params.trigger_price);
        if (params.validity != null) o.validity = params.validity;

        const isStop = o.order_type == 'SL' || o.order_type == 'SL-M';
        const ltp = ltpOf ? ltpOf(Number(o.instrument_token)) : null;
        o.status = isStop ? 'TRIGGER PENDING' : 'OPEN';
        o.marketable = !isStop && isMarketable(o, ltp);
        if (o.marketable) pendingFills.set(o.order_id, Date.now() + cfg.fillDelayMs);
        else pendingFills.delete(o.order_id);

        console.log(`🧪 MOCK MODIFY ${o.order_id} ${o.tradingsymbol}: ${before} → `
            + `${o.order_type}${o.price ? ' @ ' + o.price : ''}${o.trigger_price ? ' trig ' + o.trigger_price : ''} ×${o.quantity}`
            + ` [${o.status}${o.marketable ? ', marketable' : ''}]`);
        emit(o);
        persist();
        setImmediate(() => sweep(Number(o.instrument_token)));
        return Promise.resolve({ order_id: o.order_id });
    }

    function cancelOrder(variety, orderId) {
        const o = orders.find(x => x.order_id == orderId);
        if (!o) return Promise.reject(new Error(`mock: unknown order ${orderId}`));
        if (!RESTING.includes(o.status)) return Promise.resolve({ order_id: orderId });
        o.status = 'CANCELLED';
        o.pending_quantity = 0;
        pendingFills.delete(o.order_id);
        console.log(`🧪 MOCK CANCEL ${o.order_id} ${o.tradingsymbol}`);
        emit(o);
        persist();
        return Promise.resolve({ order_id: orderId });
    }

    // ----------------------------------------------------------- read models

    function getOrders() {
        return Promise.resolve(orders.map(o => ({ ...o })));
    }

    function getOrderHistory(orderId) {
        const o = orders.find(x => x.order_id == orderId);
        return Promise.resolve(o ? [{ ...o }] : []);
    }

    function getPositions() {
        for (const p of positions.values()) markPosition(p);
        const net = [...positions.values()].map(p => ({ ...p }));
        return Promise.resolve({ net, day: net.map(p => ({ ...p })) });
    }

    function getMargins(segment) {
        const utilised = Math.max(0, cfg.cash - cash);
        const m = {
            equity: {
                enabled: true,
                net: +cash.toFixed(2),
                available: { adhoc_margin: 0, cash: +cash.toFixed(2), opening_balance: cfg.cash, live_balance: +cash.toFixed(2), collateral: 0, intraday_payin: 0 },
                utilised: { debits: +utilised.toFixed(2), exposure: 0, m2m_realised: 0, m2m_unrealised: 0, option_premium: +utilised.toFixed(2), payout: 0, span: 0, holding_sales: 0, turnover: 0 },
            },
            commodity: { enabled: false, net: 0, available: {}, utilised: {} },
        };
        return Promise.resolve(segment ? m[segment] : m);
    }

    // --------------------------------------------------------------- wiring

    restore();
    const timer = setInterval(() => sweep(), Math.max(100, cfg.fillDelayMs));
    if (timer.unref) timer.unref();

    const broker = {
        // ---- simulated
        placeOrder, modifyOrder, cancelOrder,
        getOrders, getOrderHistory, getPositions, getMargins,

        // ---- the real market, untouched
        getInstruments: (...a) => realKite.getInstruments(...a),
        getLTP: (...a) => realKite.getLTP(...a),
        getOHLC: (...a) => realKite.getOHLC(...a),
        getQuote: (...a) => realKite.getQuote(...a),
        getHistoricalData: (...a) => realKite.getHistoricalData(...a),
        getProfile: (...a) => realKite.getProfile(...a),
        getHoldings: (...a) => realKite.getHoldings(...a),

        // ---- mock-only controls
        isMock: true,
        onTick: (token) => sweep(token),
        snapshot: () => ({
            cash: +cash.toFixed(2), openingCash: cfg.cash,
            realised: +[...positions.values()].reduce((s, p) => s + p.realised, 0).toFixed(2),
            unrealised: +[...positions.values()].reduce((s, p) => s + p.unrealised, 0).toFixed(2),
            orders: orders.length,
            working: orders.filter(o => RESTING.includes(o.status)).length,
            open: [...positions.values()].filter(p => p.quantity > 0)
                .map(p => ({ tradingsymbol: p.tradingsymbol, quantity: p.quantity, entry: +p.average_price.toFixed(2), ltp: p.last_price, pnl: p.pnl })),
        }),
        reset: () => {
            orders = []; positions = new Map(); cash = cfg.cash; seq = 0;
            pendingFills.clear(); persist();
            console.log(`🧪 mock: book reset, cash ₹${cfg.cash}`);
        },
    };

    // anything chartApp (or a future caller) reaches for that is not listed
    // above should hit the real read-only API rather than crash -- except the
    // write calls, which must never fall through to the exchange by accident.
    return new Proxy(broker, {
        get(t, k) {
            if (k in t) return t[k];
            if (typeof k == 'string' && /^(place|modify|cancel|convert|exit)/.test(k)) {
                return () => Promise.reject(new Error(`mock: ${k}() is not simulated and will not be sent to the exchange`));
            }
            const v = realKite[k];
            return typeof v == 'function' ? v.bind(realKite) : v;
        },
    });
}

module.exports = { createMockBroker };
