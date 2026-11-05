# Incidents before take-off — checked 05/11/2026, from the live pm2 logs

Source: `~/.pm2/logs/chartApp-out.log` (lines 42537-43098 are today's live
process, started 2026-11-05T03:55:10Z = 09:25 IST) and
`~/.pm2/logs/chartApp-error.log`.

Eight incidents. The first one is a real bug in the guard and it is the thing
that cut the 09:31 trade short.

---

## 1. The trail put the stop ABOVE the live price, so the app exited itself. SEVERE.

This is the whole 09:31 trade, straight from the log:

    ⚡ QUICK B100: BUY 20 SENSEX26N0578200PE @ 96.3 — risk ₹445 (stop 74.05)
    📏 Breach level frozen for SENSEX26N0578200PE: 73.75
    🪜 TRAIL: LTP 103.35 cleared 102.8 → stop 73.75 to 102.8 (+8.4% vs entry 94.8), 1 SL order modified
    {
      message: 'Trigger price for stoploss sell orders should be lower than
                the last traded price (103.35). ...',
      error_type: 'InputException'
    } ❌ TRAIL: could not move the resting SL to 104.35 (the app-side guard line did move)
    🚨 Exit: ... marketable LIMIT at 93.6 (LTP 104.05 broke 3-candle low 104.35)
    🧾 Trade logged: qty 20 buy 94.8 sell 104.7 pnl 198 [guard breach]
       ↳ Closed green +10.4%.
    🔒 NEW ENTRIES LOCKED for 10 min
    🔔 SETUP BREAK SENSEX26N0578200PE @ 118.65 — BLOCKED: No entry for 10 min after a stop-out

What happened, in order:

1. A tick spiked high enough to clear the 104.35 level by the old flat 0.5%.
2. `maybeTrail()` set the app-side guard line to **104.35** and then asked
   Kite to move the resting SL there.
3. Kite refused: at the exchange the last traded price was **103.35**, so a
   stop trigger at 104.35 is above the market and illegal.
4. The app kept its own line at 104.35 anyway — the log says so.
5. The next tick printed 104.05. `ltp <= level` was true, so the guard fired
   an instant exit at +10.4%.
6. The lockout then armed and refused re-entry while the same option went to
   118.65, which is +25% on the entry.

Two separate defects in `maybeTrail()` (chartApp.js:3498):

- **No check that the new stop is below the live price.** Nothing compares
  `lv` with `ltp`. A stop at or above the market is not a stop, it is an exit
  order with extra steps.
- **A failed `modifyOrder` leaves the app-side line moved.** The writes come
  first and the catch block keeps them on purpose:

      st.stop = lv;
      breachLevelByToken.set(t, lv);
      saveBreachOverride(t, lv);
      writeGuardState();
      ... await kite.modifyOrder(...)   // throws
      catch { /* "the app-side line is already at the new level,
                   which is the tighter of the two" */ }

  The comment's reasoning only holds when `lv < ltp`. When Kite refuses
  *because* the trigger is above the market, the app-side line is not tighter,
  it is already breached — and the exchange has no matching stop, so the two
  sides now disagree.

Note: today's adaptive trail clear does soften this specific case. The real
1-minute median range on that strike was 8.4%, so 104.35 would have needed
LTP ≥ 113.1 before becoming the stop, instead of a 0.5% spike. But the two
defects above are untouched and can still fire on any spiky tick.

## 2. Phone alerts have been dead all day. HIGH.

69 lines of `⚠️ alert skipped, no device registered` in today's session. Every
alert was lost, including both trade confirmations, `🚀 BREAKOUT SENSEX spot`
and `⚠️ No reverse order`.

Root cause: `deviceTokens()` in `chartAlerts.js:37` reads the Mongo `devices`
collection and it is returning nothing, so there is no FCM token to send to.
The phone has to register before any alert can leave the machine. Nothing is
wrong with the alert code itself.

## 3. `guardRefresh` is failing right now, every 15 seconds. HIGH.

51 `❌ guardRefresh error` with `ECONNABORTED / NetworkException` after the
last real log line, and it is still going. The guard refresh cannot reach
Kite at all, which means the live process is blind — it cannot read positions
or orders.

It started after the close (the last real line is the expiry strikes printing
at 0.05), so it looks like the access token went stale rather than a network
fault. It has to be cleared before the open: a stale session at 09:15 means
the guard is blind on the first fill.

## 4. The live process is running the OLD code. HIGH.

pm2 `chartApp` started at 03:55:10Z (09:25 IST) — before all three of today's
commits. The Claude lockout, the adaptive trail clear and the volume/momentum
gate are on disk and pushed, but **none of them are in the running process**.
It needs a restart to pick them up.

## 5. 757 restarts, and the last crash loop was a syntax error. MEDIUM.

`pm2 describe chartApp` shows 757 restarts since 04/11. The error log's final
entries are the same crash repeating:

    chartApp.js:1916
        const stTok = tradingsymbol ? tokenBySymbol.get(tradingsymbol) : null;
    SyntaxError: Identifier 'stTok' has already been declared

That was a bad edit from an earlier session (the file has since moved on, the
line no longer matches). It is fixed, but it shows what a broken save does:
pm2 restarts the guard in a tight loop and there is no live guard at all while
it does. `node --check chartApp.js` before every restart is the cheap
protection.

## 6. The premium floor blocked the cheap runners 22 times. MEDIUM, now fixed.

22 `BLOCKED: Premium ₹8–400` lines today, all on the late-day move, e.g.:

    🔔 SETUP BOUNCE SENSEX26N0580300CE @ 6.8  — BLOCKED: ... | Premium ₹8–400
    🔔 SETUP BREAK  SENSEX26N0580300CE @ 3.2  — BLOCKED: ... | Premium ₹8–400

This is live evidence for today's `minPremium 2` commit. It is fixed on disk
but not in the running process — see incident 4.

## 7. `minRR 1.5` skipped 16 OI signals. MEDIUM, still open.

16 `SKIPPED, rr X under 1.5` lines, including on the strikes that ran:

    📉 OI SIGNAL SENSEX26N0579200CE: OI -5.98% while price +21.85% to 141.65
       over 5m — stop 107.5, partial 146, 0.13R — SKIPPED, rr 0.13 under 1.5

The R:R is computed against the nearest resistance as the target. On a strike
making new highs the nearest resistance is just overhead, so R:R always reads
tiny — exactly when the move is strongest. Already on the queue from
`review-2026-11-05.md`.

## 8. Two different things in this app are called "thin". LOW.

The setup scanner prints `THIN` for a bad reward-to-risk ratio
(`const thin = rr == null || rr < cfg.minRR` at chartApp.js:3167). The
checklist row added today is also called `thin` and means no traded volume.
Same word, unrelated meanings, same log. One of them should be renamed —
`lowrr` for the scanner verdict is the smaller change.

---

## Before the open, in order

1. Fix incident 1: refuse any trail level that is not below the live price,
   and roll the app-side line back when `modifyOrder` is refused.
2. Clear the Kite session so `guardRefresh` works (incident 3).
3. Register the phone so alerts leave the machine (incident 2).
4. `node --check chartApp.js`, then restart pm2 so today's commits go live
   (incidents 4 and 5).
5. Leave incidents 6, 7 and 8 for after the open.
