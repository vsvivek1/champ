/*

claudeLock.js -- Claude decides the entry lockout after an exit.

WHY THIS EXISTS

The old rule was flat: any stop-style exit (SL triggered or guard breach)
locked new entries for 10 minutes. On 05/11/2026 that rule cost the whole
day. Between 13:19 and 13:48 SENSEX ran +346 points. Two guard breaches
exited GREEN (+8.7% and +21.1%) and each one armed a 10 minute lock, so the
re-entries at 13:30 (12.20), 13:33 (13.90) and 13:42 (34.00) were all
refused. The move finished without us.

A breach that fills ABOVE entry is not a stop-out. A breach that fills
below entry in a chopping market is. The flat rule cannot tell them apart,
so the judgement is handed to Claude.

HOW IT IS SAFE

- chartApp.js locks for LOCKOUT_MIN FIRST, the same as before. This call
  then runs in the background and may shorten, clear or extend it.
- If the key is missing, the network is down, the model is slow or the
  answer does not parse, nothing happens and the old 10 minute lock stands.
  Failure always means MORE protection, never less.
- Claude's minutes are clamped to 0..MAX_LOCK_MIN. It cannot lock the day
  out and it cannot hand back a whole session.
- The day-loss brake, the loss-streak brake and the trade cap are separate
  gates in noTradeChecks(). Clearing this lock does not touch them.

*/

const fs = require('fs');

const MODEL = 'claude-opus-5';
const MAX_LOCK_MIN = 30;       // ceiling on what Claude may ask for
const TIMEOUT_MS = 25000;      // past this the old lock just stays

let client = null;
let clientTried = false;

function getClient() {
    if (clientTried) return client;
    clientTried = true;
    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            console.log('🔒 claudeLock: no ANTHROPIC_API_KEY — flat lockout stays');
            return null;
        }
        const Anthropic = require('@anthropic-ai/sdk');
        client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
    } catch (e) {
        console.log('🔒 claudeLock: SDK load failed —', e.message || e);
        client = null;
    }
    return client;
}

const SYSTEM = `You decide one thing for an intraday index-option buyer: after a
trade just closed, should NEW entries be locked, and for how many minutes.

You are not deciding whether to trade. Other rules still check premium band,
day loss, loss streak, trade count, chop and direction. You only decide the
cooling-off period.

The rule you are replacing was flat: any stop-style exit locked entries for 10
minutes. It was built to stop revenge clicking right after a loss. It is wrong
in one common case, and that case is why you exist.

WHEN TO CLEAR OR SHORTEN THE LOCK
- The exit filled ABOVE entry. A stop that pays is not a stop-out. There is
  nothing to cool off from. Clear it.
- The stop was hit because the stop was too tight, not because the trade was
  wrong: price is still trending the same way, index efficiency is high, and
  the option gave back only a small part of its run. Clear it or keep 1-2 min.
- The index is in a clean fast leg (efficiency high, not chopping, direction
  matches the option type). Staying out of a leg is the expensive mistake.

WHEN TO KEEP OR EXTEND THE LOCK
- The exit filled below entry and the market is chopping (low efficiency).
  This is the revenge-click case the rule was built for. Keep 10 min or more.
- The trade went straight against entry from the first tick (mfePct near zero,
  maePct deep). The read itself was wrong, not the stop. Keep 10-15 min.
- Losses are stacking up today (loss streak 2 or more, day P&L well negative).
  Extend towards the ceiling.
- The exit was a chase: the option had already run far before entry and the
  index had already topped. Keep 10 min.

HOW TO ANSWER
Call the tool exactly once. minutes must be 0 when lock is false. Keep "why"
under 120 characters, plain simple English, and name the number you used
(for example: "breach filled +21% above entry, index eff 74, no cooling off").`;

const TOOL = {
    name: 'lockout_decision',
    description: 'Report the entry-lockout decision for the trade that just closed.',
    strict: true,
    input_schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
            lock: {
                type: 'boolean',
                description: 'true to lock new entries, false to allow them now'
            },
            minutes: {
                type: 'integer',
                description: `How many minutes to lock. 0 when lock is false, 1..${MAX_LOCK_MIN} when true.`
            },
            why: {
                type: 'string',
                description: 'One short plain-English line naming the numbers behind the call.'
            }
        },
        required: ['lock', 'minutes', 'why']
    }
};

/*
Everything Claude is allowed to see. Built by the caller so this file never
reaches into chartApp.js state.

trade   -- the closed-trade record (reason, exitPct, mfePct, maePct, heldMin,
           levelGapPct, pnl, qty, tag)
day     -- todayStats(): trades, pnl, lossStreak, wins, losses
regime  -- computeRegime() on the index: eff, chop, bias, net, path
*/
function buildPrompt({ trade, day, regime, nowHHmm, side, flatMinutes }) {
    const n = v => (v == null ? 'n/a' : v);
    const green = trade.exitPct != null && trade.exitPct > 0;
    return [
        `Time now: ${nowHHmm}. The flat rule has just locked entries for ${flatMinutes} min.`,
        '',
        'TRADE THAT JUST CLOSED',
        `symbol: ${trade.tradingsymbol} (${side || 'unknown side'})`,
        `exit reason: ${trade.reasonLabel || trade.reason}`,
        `entry ${n(trade.buy)} -> exit ${n(trade.sell)}  = ${n(trade.exitPct)}% (${green ? 'GREEN' : 'RED'})`,
        `P&L: ${n(trade.pnl)} INR on qty ${n(trade.quantity)}`,
        `best it got to: ${n(trade.mfePct)}%   worst it got to: ${n(trade.maePct)}%`,
        `held: ${n(trade.heldMin)} min`,
        `stop level was ${n(trade.levelGapPct)}% below entry`,
        `app's own tag: ${n(trade.tag)}`,
        '',
        'THE DAY SO FAR',
        `trades: ${n(day.trades)}   P&L: ${n(day.pnl)} INR   losses in a row: ${n(day.lossStreak)}`,
        `wins ${n(day.wins)} / losses ${n(day.losses)}`,
        '',
        'INDEX RIGHT NOW',
        regime && regime.ok
            ? `${regime.win}-min efficiency ${n(regime.eff)}% (chopping: ${regime.chop})`
              + `, direction ${n(regime.bias)}, net ${n(regime.net)} pts over path ${n(regime.path)} pts`
            : 'not available',
        '',
        'Should new entries stay locked?'
    ].join('\n');
}

/*
Resolves to {lock, minutes, why, model} or null. Never throws, never rejects:
the caller treats null as "leave the flat lock alone".
*/
async function decideLockout(ctx) {
    const c = getClient();
    if (!c) return null;
    try {
        const res = await c.messages.create({
            model: MODEL,
            max_tokens: 2048,
            thinking: { type: 'adaptive' },
            output_config: { effort: 'medium' },
            system: SYSTEM,
            tools: [TOOL],
            tool_choice: { type: 'tool', name: 'lockout_decision' },
            messages: [{ role: 'user', content: buildPrompt(ctx) }]
        });

        const block = (res.content || []).find(b => b.type === 'tool_use');
        if (!block) {
            console.log('🔒 claudeLock: no decision in reply — flat lockout stays');
            return null;
        }
        // input can arrive with different JSON escaping; never string-match it
        const out = typeof block.input === 'string' ? JSON.parse(block.input) : block.input;

        let lock = out.lock === true;
        let minutes = Math.round(Number(out.minutes));
        if (!Number.isFinite(minutes) || minutes < 0) minutes = lock ? ctx.flatMinutes : 0;
        if (minutes > MAX_LOCK_MIN) minutes = MAX_LOCK_MIN;   // it cannot lock the day out
        if (lock && minutes === 0) lock = false;
        if (!lock) minutes = 0;

        const why = String(out.why || '').slice(0, 200) || 'no reason given';
        return { lock, minutes, why, model: MODEL, requestId: res._request_id || null };
    } catch (e) {
        // every failure path ends the same way: the flat lock stands
        console.log('🔒 claudeLock: call failed —', e.message || e);
        return null;
    }
}

/*
One line per decision so the day can be reviewed later. Same shape as the
other logs: an array of rows in a JSON file.
*/
function logDecision(file, row) {
    try {
        let log = [];
        try { log = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { }
        log.push(row);
        fs.writeFileSync(file, JSON.stringify(log, null, 2));
    } catch (e) { console.log('⚠️ lock decision log failed', e.message || e); }
}

module.exports = { decideLockout, logDecision, MAX_LOCK_MIN, MODEL };
