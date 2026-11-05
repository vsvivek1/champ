# Pre-flight audit — the three changes made on 05/11/2026

Deep check of everything committed in the last few minutes, before this runs
on live money. Written after re-reading the code and re-simulating on the
cached 05/11 minute data.

Commits audited:

| Commit | What it did |
|---|---|
| `aedd69d` | Claude decides the entry lockout after a stop-style exit (`claudeLock.js`) |
| `6e31c00` | Trail clear measured against the option's own 1-minute range |
| `2c3c252` | Premium floor replaced by a volume gate + momentum override |

Verdict in one line: the lockout change and the volume/momentum change are
sound. The trail change is **not** the win the commit message claimed, and
while checking it I found a bigger hole that is still open.

---

## FINDING 1 — On a breakout to new highs there is no trail at all. HIGH.

This is the most serious item and it is not a new bug, but it is the real
reason 05/11 was given back, and the adaptive-clear commit does not touch it.

`armTrail()` builds the ladder like this:

    const ladder = levels ? levels.resistances.map(L => L.price).filter(p => p > entry) : [];

and `maybeTrail()` opens with:

    if (!st || !st.trail || !st.ladder.length) return;

So the trail is made entirely of **resistance levels above entry**. When the
option is already at its session high, there are none. The ladder is empty,
`maybeTrail()` returns on the first line, and the stop stays on the entry
3-candle low for the whole trade — however far it runs.

Measured on the real cached bars, entry at the bar close, full-session pivot
ladder exactly as `computeLevels()` builds it:

| Strike | Entry | Peak | Ladder | Flat 0.5% | Adaptive |
|---|---|---|---|---|---|
| 290378501 | 13:34 @ 155.90 | **2.47x** | **0 levels** | **−17%** | **−17%** |
| 290360837 | 13:34 @ 55.00 | 1.18x | 3 | +3% | +3% |
| 290394629 | 13:34 @ 16.65 | 1.60x | 9 | +11% | **+41%** |
| 290426885 | 13:42 @ 8.55 | 1.30x | 3 | +16% | **+8%** |
| 290351877 | 13:42 @ 21.90 | 1.89x | 1 | +45% | +45% |

Row 1 is the hole: the option went 2.47x, the trail never moved once, and the
trade closed −17% at 15:28 after sitting in it for 114 minutes.

The trail cannot be built only from levels that already exist. A breakout has
no levels above it by definition — that is what a breakout is. It needs a
second mechanism that does not depend on history: a peak-based trail, "give
back no more than X% from the highest print since entry", where X is the same
measured 1-minute range `trailClearPct()` already computes. Levels where
levels exist, peak giveback where they do not.

## FINDING 2 — The adaptive trail clear is 1 better, 1 worse, 2 neutral. MEDIUM.

Same table. `6e31c00`'s message implies a clean improvement. The honest
result on five real runners is one clear win (+11% → +41%), one clear loss
(+16% → +8%), and two unchanged.

The reason is that it widens the clear in both directions at once. A wider
clear holds through noise, which is the win on 290394629. It also delays the
stop-raise past the top, which is the loss on 290426885 — the stop was still
sitting one level low when the reversal came.

Not a bug and not worth reverting: the floor is still 0.5% and the 3-candle
breach line is still under the trade, so nothing got riskier. But it is a
coin-flip-with-a-tilt on n=5, not a fix, and it should not be described as
one. The thing that actually pays on these trades is Finding 1.

## FINDING 3 — `minPremium: 2` silently switches the partial profit-take off. MEDIUM.

Real sizes from `tradeLog.json` on 05/11: 240 units at ₹12.61, 220 at ₹13.50,
480 at ₹14.10 — about ₹3,000-6,800 of premium per trade.

SENSEX lot is 20 and the freeze limit is 1,000 units (`getFreezeLimit.js`).
Spend the same ₹6,800 on a ₹2.75 strike and that is 2,460 units, which is
over the freeze limit, so `placeOrderInFreezeChunks()` splits it into 3
orders. Then in `armResting()`:

    const appSide = ids.length == 1;   // the quantity dance in maybePartial needs one order

`appSide` goes false, and the app-side partial exit at the resistance is
switched off for that trade. It does log a line, but the net effect is that
the cheap strikes the new gate was built to allow are exactly the ones that
lose the profit-take.

The exchange stop still covers the whole position, so this is lost upside,
not lost protection. Fix is to make `maybePartial` work across chunks, or to
cap entry quantity at the freeze limit when the premium is low.

## FINDING 4 — The thresholds are fitted to SENSEX on one expiry day. MEDIUM.

`minVolUnits: 50000` came from the 05/11 SENSEX percentiles (p5 = 47,960)
and `momentumSpeed`/`momentumBars` from 2,664 SENSEX option-minutes on the
same day. NIFTY trades in lots of 75 against SENSEX's 20, so its per-minute
unit counts are on a different scale entirely and the absolute floor has not
been checked against it even once.

The relative half (`minVolX: 1`, against the strike's own median) carries
across instruments on its own. The absolute half does not. Since both must
fail together before `thin` blocks, the worst case is a gate that is too
loose on NIFTY rather than one that wrongly blocks — acceptable to run, but
it needs the 29/10 and 28/10 logs before the numbers are trusted.

Same caveat on momentum: 45% win against 21% for speed alone is a real
separation, but n=62 on one day and one index.

## FINDING 5 — `getFreezeLimit.js` has the wrong SENSEX lot size. LOW, harmless.

The table says `{ symbol: "SENSEX", lot_size: 75, quantity_freeze_limit: 1000 }`.
SENSEX lot is 20, as every row in `tradeLog.json` confirms. The field is never
read — chunking takes its `lotSize` argument from `lotSizeByToken`, which comes
from the live instrument dump — so nothing is broken today. It is a wrong
number sitting in a file where someone will eventually believe it.

---

## What was checked and found correct

- **Lockout failure paths.** No key, SDK load failure, network error, timeout,
  no `tool_use` block, unparseable input — every one returns `null` and the
  flat 10-minute lock stands. Failure always means more protection.
- **Lockout staleness.** `reviewLockout()` captures `lockUntil` before the
  call and discards its own answer if a newer exit re-locked while it waited.
- **Lockout persistence.** `unlockTrading()` calls `saveLock()`, so a cleared
  lock does not come back on restart.
- **Lockout cannot bypass the other brakes.** Day loss, loss streak, trade cap
  and the 60-second impulse gap are separate rows in `noTradeChecks()` and the
  lock decision does not touch them. Minutes are clamped 0..30.
- **Ladder ordering.** `maybeTrail()` picks the *highest* cleared level by
  taking the last match while iterating, which is only correct on an ascending
  ladder. `clusterLevels(highs, true)` does return ascending. Correct.
- **The forming minute is never read.** `minBarsFromSec()`, `volFlow()` and
  `trailClearPct()` all cut at `Math.floor(Date.now()/1000/60)*60`.
- **`volFlow()` volume is incremental, not cumulative.** `pushSecTick()` stores
  per-bucket volume via `secVolBase`, so summing buckets per minute is right.
- **No false block on a fresh strike.** `volFlow()` needs 6 completed bars and
  `higherHighs()` needs 3; short of that `thin` reports n/a and does not block.
  A strike with genuinely zero volume and zero median does block, correctly.
- **`thin` is distinct from `dead`.** `dead` folds CE+PE together on purpose;
  `thin` reads the single contract being bought. A busy day can hold a dead
  strike.
- **`momentum` never blocks.** Pushed with `blocked: false, hard: false`, only
  reported, so the checklist can say why a soft row passed.
- **`riskCappedQty()` is a cap, never a floor.** `if (want >= qty) return qty`
  untouched. Lowering `minPremium` cannot make it inflate size.
- **`noTrade.json` updated.** `readNoTrade()` merges the file over the
  defaults, so leaving `minPremium: 8` in the file would have kept the old
  behaviour. It is now 2, with the four new keys alongside.
- **Live smoke test.** `/api/notrade` returns all 21 rows with the new `thin`
  and `momentum` lines and no throw. The `premium` detail no longer says
  "too rich" about a price that is inside the band.

## Still open, in order

1. Peak-based trail for the no-ladder case (Finding 1). This is the one that
   pays.
2. `maybePartial` across freeze chunks, or a quantity cap on cheap strikes
   (Finding 3).
3. Re-run every threshold over 29/10 and 28/10 before trusting them
   (Finding 4).
4. From the original list in `review-2026-11-05.md`: 6-candle breach while a
   leg is live and efficient, suspend `minRR` and `blockRedCandle` at a new
   session extreme, the "already run" 2x cap, and the new-extreme watcher.
