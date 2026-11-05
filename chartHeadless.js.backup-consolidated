/*

chartHeadless.js -- chartApp with nobody at the keyboard.

Same process, same guard, same no-trade gate, same post-trade review. The
only things that change are that the strikes get picked by the process
instead of by a click, that the setup detector's TAKE rows become BUYs
(autoPilot.js), and that in mock mode the orders go to a paper book
(mockBroker.js) instead of to Zerodha.

There is deliberately no second copy of the guard. chartApp.js is the only
file that decides where a stop goes, and this is a wrapper around it --
anything else and the thing you test all month is not the thing that
trades your money.

USAGE

  node chartHeadless.js                      paper trading (the default)
  node chartHeadless.js --cash 500000        paper, different opening balance
  node chartHeadless.js --index SENSEX       paper on the SENSEX chain
  node chartHeadless.js --port 3458          paper, alongside the live app
  node chartHeadless.js --watch              headless, NO autopilot: just
                                             watch and log what it would
                                             have taken (dry run of the
                                             signal itself)
  node chartHeadless.js --live --i-mean-it   REAL ORDERS. Both flags needed.

pm2:

  pm2 start chartHeadless.js --name chartMock
  pm2 logs chartMock

The read-out is the log and, if you want it in a browser, the usual
dashboard on whatever --port this run picked (it serves chartApp.html and
all of /api, reading the paper book instead of the real one). Live state
over HTTP:

  curl localhost:3457/api/autopilot    settings, trades taken, paper book
  curl localhost:3457/api/mock         the paper book on its own
  curl localhost:3457/api/position     positions, same shape as the real one
  curl localhost:3457/api/review       the post-trade review
  curl -X POST localhost:3457/api/autopilot -H 'content-type: application/json' \
       -d '{"enabled":false}'          stop taking new entries, keep guarding

Tunables live in autoTrade.json (which setups, how many a day, how many
lots to ask for). The RULES -- the stop, the risk cap, the clock, the
streak, the premium band -- stay in guardSettings.json and noTrade.json,
shared with the live app on purpose: a paper run judged against softer
rules than the real one proves nothing.

*/

const args = process.argv.slice(2);
const has = f => args.includes(f);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

if (has('--help') || has('-h')) {
    console.log(require('fs').readFileSync(__filename, 'utf8').split('*/')[0].replace(/^\/\*/, ''));
    process.exit(0);
}

const live = has('--live');

/*
Two flags to go live, and they are checked here rather than in chartApp so
the refusal happens before a single connection is opened. --live on its own
is almost always a copy-paste from these docs, not a decision.
*/
if (live && !has('--i-mean-it')) {
    console.error('\n❌ --live places REAL orders with no human in the loop.');
    console.error('   If that is what you want, say so twice:\n');
    console.error('       node chartHeadless.js --live --i-mean-it\n');
    console.error('   Before you do: run it in paper mode for a few sessions first and read');
    console.error('   mock-tradeLog.json. The autopilot takes the setup detector\'s TAKE rows,');
    console.error('   and whether those are worth real money is a question only that log answers.\n');
    process.exit(1);
}

process.env.CHART_HEADLESS = '1';
process.env.CHART_MOCK = live ? '0' : '1';
process.env.CHART_PORT = val('--port', live ? '3456' : '3457');
if (val('--cash', null)) process.env.CHART_MOCK_CASH = val('--cash');
if (has('--alerts')) process.env.CHART_MOCK_ALERTS = '1';

/*
--watch and --index/--lots/--max are shortcuts onto autoTrade.json, written
before chartApp reads it. Written, not just held in memory, so what a run
was actually configured with is on disk next to its trade log.
*/
const ap = require('./autoPilot.js');
const cfg = ap.readCfg();
let touched = false;
if (has('--watch')) { cfg.enabled = false; touched = true; }
if (has('--arm')) { cfg.enabled = true; touched = true; }
if (val('--index', null)) { cfg.index = val('--index').toUpperCase(); touched = true; }
if (val('--offset', null)) { const o = val('--offset'); cfg.offset = o == 'auto' ? 'auto' : (parseInt(o, 10) || 0); touched = true; }
if (val('--lots', null)) { cfg.maxLots = parseInt(val('--lots'), 10) || cfg.maxLots; touched = true; }
if (val('--max', null)) { cfg.maxTradesPerDay = parseInt(val('--max'), 10) || cfg.maxTradesPerDay; touched = true; }
if (touched) ap.writeCfg(cfg);

console.log('');
console.log(`🤖 chartApp HEADLESS — ${live ? '🔴 LIVE: ORDERS GO TO THE EXCHANGE' : '🧪 MOCK: paper orders only'}`);
console.log(`   index ${cfg.index} ${cfg.offset == 'auto' ? '(auto strike)' : `offset ${cfg.offset}`}`
    + `, autopilot ${cfg.enabled ? 'ARMED' : 'DISARMED (watch only)'}`
    + `, port ${process.env.CHART_PORT}`);
console.log('');

require('./chartApp.js');
