/*

autoPilot.js -- the entry decision chartApp's browser page normally makes.

The page is the hand on the BUY button: a human reads the chart, reads the
NO-TRADE panel, and clicks. Headless, something has to do that, and the
honest answer is to use the signal the app already computes and already
logs rather than to invent a second opinion: checkSetups() publishes a
bounce/break row per minute per charted option with a stop, a partial
target, an R multiple and a verdict from the real no-trade gate. The
autopilot takes the rows that say TAKE.

What it does NOT do:

- It does not decide the stop, the target, the partial or the trail. The
  guard owns all of those the moment the BUY fills, exactly as it does for
  a clicked entry (placeFirstOrder / maybePartial / maybeTrail).
- It does not decide the size. riskCappedQty does, off riskPctOfCapital --
  the autopilot only asks for an upper bound.
- It does not override the no-trade gate. The gate is re-run at the instant
  of entry, not trusted from the setup row: the row may be seconds old and
  the lock, the streak or the clock can have turned in between.

So the only new judgement here is WHICH setups are worth taking and HOW
OFTEN, which is what autoTrade.json configures.

*/

const fs = require('fs');
const path = require('path');

const CFG_FILE = path.join(__dirname, 'autoTrade.json');

const DEFAULTS = {
    enabled: true,
    index: 'NIFTY',          // NIFTY | SENSEX -- which chain to watch
    offset: 'auto',          // strike offset, or 'auto' for the IV-based pick
    reloadMin: 15,           // re-pick the strikes this often while FLAT (spot drifts)
    kinds: ['bounce', 'break'],
    minRR: 1.5,              // on top of the setup detector's own minRR
    minTouches: 2,           // a level with one touch is a line, not a level
    maxTradesPerDay: 6,      // after this, the day is over whatever the tape says
    maxOpen: 1,              // positions held at once. 1 = one trade at a time
    minGapMin: 3,            // cooling-off between autopilot entries
    maxLots: 4,              // the ASK; riskCappedQty still cuts it
    firstOrder: null,        // null = follow guardSettings.json; 'target' | 'sl' to force
    slipPct: 2,              // marketable BUY limit = ltp × (1 + this/100)
};

function readCfg() {
    try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')) }; }
    catch { return { ...DEFAULTS }; }
}

function writeCfg(s) {
    fs.writeFileSync(CFG_FILE, JSON.stringify(s, null, 2));
}

/*
deps are chartApp's own internals, injected rather than re-implemented --
there must be exactly one copy of the gate, the sizing and the order path.
*/
function createAutoPilot(deps) {

    const {
        kite,                      // real or mock, the autopilot cannot tell
        lotOf,                     // (token) => lot size
        ltpOf,                     // (token) => last price
        noTradeChecks,             // the gate
        riskCappedQty,             // the sizer
        setFirstOrderOverride,
        placeOrderInFreezeChunks,
        roundToTick,
        openCount,                 // () => number of open guard positions
        isMock,
    } = deps;

    const taken = [];              // this session's autopilot entries
    let lastEntryAt = 0;
    let skipLog = new Map();       // reason -> last time it was logged (keep the log readable)

    function note(reason, msg) {
        const now = Date.now();
        if (now - (skipLog.get(reason) || 0) < 60000) return;
        skipLog.set(reason, now);
        console.log(`🤖 autopilot skip (${reason}): ${msg}`);
    }

    function todayCount() {
        const d = new Date().toDateString();
        return taken.filter(t => new Date(t.at).toDateString() == d).length;
    }

    /*
    One setup row in, at most one BUY out. Returns what it decided, so the
    caller can log or broadcast it; never throws.
    */
    async function onSetup(row) {
        const cfg = readCfg();
        try {
            if (!cfg.enabled) return { action: 'off' };

            if (!cfg.kinds.includes(row.kind)) {
                note('kind', `${row.kind} is not in [${cfg.kinds.join(', ')}]`);
                return { action: 'skip', why: `kind ${row.kind} not enabled` };
            }
            if (row.verdict != 'TAKE') {
                note('verdict', `${row.tradingsymbol} ${row.kind} is ${row.verdict}`
                    + (row.blockers && row.blockers.length ? ` — ${row.blockers.join(' | ')}` : ''));
                return { action: 'skip', why: `verdict ${row.verdict}` };
            }
            if (!(row.rr >= cfg.minRR)) {
                note('rr', `${row.tradingsymbol} ${row.rr}R is under the autopilot's ${cfg.minRR}R`);
                return { action: 'skip', why: `${row.rr}R < ${cfg.minRR}R` };
            }
            if (!(row.touches >= cfg.minTouches)) {
                note('touches', `${row.tradingsymbol} level ${row.level} has ${row.touches} touch(es), autopilot wants ${cfg.minTouches}`);
                return { action: 'skip', why: `${row.touches} touches < ${cfg.minTouches}` };
            }
            if (!(row.stop > 0) || !(row.stop < row.ltp)) {
                note('nostop', `${row.tradingsymbol} has no usable stop under ${row.ltp} — nothing to size against`);
                return { action: 'skip', why: 'no usable stop' };
            }

            const open = openCount();
            if (open >= cfg.maxOpen) {
                note('open', `${open} position(s) already open, max ${cfg.maxOpen}`);
                return { action: 'skip', why: `${open} open >= max ${cfg.maxOpen}` };
            }
            const n = todayCount();
            if (n >= cfg.maxTradesPerDay) {
                note('count', `${n} autopilot trades today, max ${cfg.maxTradesPerDay} — done for the day`);
                return { action: 'skip', why: `${n} trades today >= max ${cfg.maxTradesPerDay}` };
            }
            const gapMin = (Date.now() - lastEntryAt) / 60000;
            if (lastEntryAt && gapMin < cfg.minGapMin) {
                note('gap', `last entry was ${gapMin.toFixed(1)} min ago, waiting ${cfg.minGapMin}`);
                return { action: 'skip', why: `only ${gapMin.toFixed(1)} min since the last entry` };
            }

            const token = Number(row.token);
            const ltp = ltpOf(token) || row.ltp;
            if (!(ltp > 0)) return { action: 'skip', why: 'no live price' };

            /*
            The gate again, now, on the price we are actually about to pay.
            The row's verdict was computed when the minute closed; a stop-out
            lock or the day-loss cap can have landed since.
            */
            const g = noTradeChecks({ premium: ltp, tradingsymbol: row.tradingsymbol });
            if (g.blocked) {
                const why = g.blockers.map(b => b.label).join(' | ');
                console.log(`⛔ autopilot BUY ${row.tradingsymbol} refused at the gate — ${why}`);
                return { action: 'blocked', why };
            }

            const lot = lotOf(token) || 1;
            const price = roundToTick(ltp * (1 + cfg.slipPct / 100));

            const m = await kite.getMargins();
            const cash = (m.equity && m.equity.available && m.equity.available.live_balance != null)
                ? m.equity.available.live_balance : (m.equity ? m.equity.net : 0);

            // the ask: the configured lot ceiling, or whatever the cash buys,
            // whichever is smaller. The risk cap decides the real number.
            const byCash = Math.floor(cash / price / lot) * lot;
            let qty = Math.min(cfg.maxLots * lot, byCash);
            if (qty < lot) {
                note('cash', `₹${Math.round(cash)} will not buy one lot of ${row.tradingsymbol} at ${price} (~₹${Math.round(price * lot)})`);
                return { action: 'skip', why: `cash ₹${Math.round(cash)} under one lot` };
            }

            const rc = riskCappedQty({ price, lot, token, qty, cash });
            if (rc.capped && rc.qty < lot) {
                console.log(`⛔ autopilot BUY ${row.tradingsymbol} refused by the risk cap — ${rc.why}`);
                return { action: 'blocked', why: `risk limit: ${rc.why}` };
            }
            if (rc.capped) console.log(`📐 autopilot ${row.tradingsymbol}: risk cap — ${rc.why}`);
            qty = rc.qty;

            // on disk before the BUY: a mock fill can land on the next tick
            const first = cfg.firstOrder || row.firstOrder;
            if (['target', 'sl'].includes(first)) setFirstOrderOverride(token, first);

            const ids = await placeOrderInFreezeChunks(kite, {
                exchange: row.exchange || (String(row.tradingsymbol).startsWith('SENSEX') ? 'BFO' : 'NFO'),
                tradingsymbol: row.tradingsymbol,
                transaction_type: 'BUY',
                quantity: qty,
                order_type: 'LIMIT',
                price,
                product: 'NRML',
                validity: 'DAY',
                tag: isMock ? 'AUTOMOCK' : 'AUTOPILOT',
            }, lot);

            lastEntryAt = Date.now();
            const rec = {
                at: new Date().toISOString(), tradingsymbol: row.tradingsymbol, token,
                kind: row.kind, level: row.level, touches: row.touches,
                qty, price, stop: row.stop, target: row.target, rr: row.rr,
                riskRs: rc.per ? Math.round(rc.per * qty) : null,
                order_ids: ids, mock: !!isMock,
            };
            taken.push(rec);
            console.log(`🤖 AUTOPILOT${isMock ? ' (MOCK)' : ''} BUY ${qty} ${row.tradingsymbol} @ ${price}`
                + ` — ${row.kind} off ${row.level} (${row.touches}t), stop ${row.stop}, ${row.rr}R`
                + (rec.riskRs != null ? `, risk ₹${rec.riskRs}` : '')
                + ` → ${ids.join(',')} [${n + 1}/${cfg.maxTradesPerDay} today]`);
            return { action: 'placed', ...rec };

        } catch (e) {
            console.log(e, `❌ autopilot BUY ${row && row.tradingsymbol} failed`);
            return { action: 'error', why: String(e.message || e) };
        }
    }

    function status() {
        const cfg = readCfg();
        return {
            cfg, mock: !!isMock,
            tradesToday: todayCount(),
            left: Math.max(0, cfg.maxTradesPerDay - todayCount()),
            lastEntryAt: lastEntryAt || null,
            taken: taken.slice(-20),
        };
    }

    return { onSetup, status, readCfg, writeCfg, DEFAULTS };
}

module.exports = { createAutoPilot, readCfg, writeCfg, AUTO_DEFAULTS: DEFAULTS, CFG_FILE };
