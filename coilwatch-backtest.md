# coilWatch — what it is, and what it did on 05/11/2026

Written 06/11/2026. The signs themselves are measured in
`presigns-2026-11-05.md`; this file is the module and its replay result.

## The files

| File | What it is |
|---|---|
| `coilWatch.js` | The watcher. Pure sign maths (`readSigns`, `readRelease`) plus the live wiring. Every sign, and why it is measured that way, is in the header. |
| `coilWatch.json` | The thresholds. `trade: false` leaves the alarm on and the orders off. |
| `coilBack.js` | Replays the SAME `readSigns`/`readRelease` over a cached day. |
| `coilLog.json` | Written at runtime: every arm, every release, every order. |

## How it runs

It hangs off the tick stream inside the server process, one scan per
minute off the index tick. **No browser is involved.** The autopilot and
the watcher are now armed in both modes, so the alarm and the entry
happen with the chart page open, closed, or never opened.

Two stages, doing two different jobs:

- **ARMED** — the signs stack to `armScore` (6 of 12). Buzzes the phone.
  Places nothing.
- **FIRED** — the index actually expands: a completed minute whose range
  is `expandMult` (2.0x) the median of the 20 bars behind it, closing in
  the top 40% of its own range, in the armed direction, with the signs
  still scoring. This is what places the order.

The order goes through `autoPilot.onSetup()` as a `kind: 'coil'` row, the
same path a headless bounce/break takes. So the no-trade gate is re-run on
the live price, `riskCappedQty` does the sizing, and the guard owns the
stop, the partial and the trail from the fill. There is no SELL call
anywhere in `coilWatch.js`.

## The eight signs

| Sign | Weight | Passes when |
|---|---|---|
| `hilo` | 2 | 3 rising 15-min spot lows in a row, none falling |
| `squeeze` | 1 | 15-min range ≤65% of the widest in 45 min |
| `coil` | 1 | 30-min path ≤80% of the path 15 min earlier, direction holding |
| `ratio` | 2 | CE/PE per-minute volume ≥3:1 AND ≥2x its lagged baseline, in 3 of the last 5 min |
| `quiet` | 1 | the other side ≤0.8x its own 20-min median volume |
| `oppoi` | 2 | other-side OI down ≥8% over 45 min |
| `ownoi` | 1 | own-side OI up ≥15% over 45 min while its price moved ≤25% |
| `highs` | 2 | ≥4 new 60-min highs, price still within 0.15% of the high |

Every sign is mirrored for a down move. A sign that cannot be read yet
scores zero — missing data never counts as agreement.

## The 05/11 replay

`node coilBack.js <dir> "" "" <ceTokens> <peTokens>` over the cached
minute bars, full session, 375 index bars:

| | |
|---|---|
| First alarm | **13:06** — score 7/12 (`ratio, quiet, oppoi, highs`) |
| Minutes armed | 57 across the day, all on the up side |
| False arms on the wrong side | **0** |
| Fires | **1**, at **13:37** |
| Fire detail | range 49 = 2.5x the 20-min median 20, closed 90% up its own range |

The alarm came **31 minutes before the explosion**. The entry came on the
first bar of it.

What the 13:37 close bought, against each strike's own later peak:

| Strike | 13:37 | peak | multiple |
|---|---|---|---|
| 79200CE | 178.55 | 385.00 | 2.16x |
| 79500CE | 62.80 | 189.80 | 3.02x |
| 79800CE | 19.10 | 77.05 | 4.03x |
| 80000CE | 9.45 | 41.30 | 4.37x |
| 80300CE | 3.55 | 20.25 | 5.70x |

Waiting for the expansion bar costs part of the move — buying on the signs
alone at 13:19 would have had the 79800CE at 10.70 instead of 19.10. It
buys two things worth more than that:

1. A coil that never breaks out never trades. Most coils do not.
2. It walks around a real trap. `blockChop` refuses entries under 10%
   efficiency, and the tightest part of a coil reads as low efficiency
   because the range is small — 3 to 9% between 12:51 and 12:57 on 05/11,
   which is the chop gate blocking at the exact moment the coil was
   tightest. By the release bar the efficiency was 52%, so the existing
   gate passes on its own merits and does not have to be weakened.

## Two things the replay changed

Both were found by running it, not by reading it.

**The arm window was eating the release bar.** It was first written as "an
expansion more than `armWindowMin` after arming is a different move, so
re-arm and skip this minute". On 05/11 the signs armed at 13:06 and stayed
above `armScore` at every single minute until 13:37 — 31 minutes — so the
first and best expansion bar was spent on a re-arm and the entry slipped
to 13:38. The reasoning was wrong anyway: the signs are re-read from
scratch every minute and must still score `fireScore` at the release, so a
coil that is still scoring is still the same setup however long it has
been coiled. `armWindowMin` now only buzzes the phone again on a long
coil; it does not gate the entry.

**`ownoi` can only be read off one leg.** Folded across five calls it
scored zero all day: the sign is "OI is building while this contract's
price stands still", and an average price across legs cannot stand still —
the near-ATM leg doubles while the far one sits at 3.20, so the folded
price showed 140-350% movement at every minute. It now reads the leg that
would actually be bought. The other side stays folded, which is correct
for "the other side is leaving".

## Known limits, stated plainly

- **Every threshold came from ONE day on ONE index.** The defaults are
  deliberately on the strict side for that reason. Re-run `coilBack.js`
  over 29/10 and 28/10 before loosening anything.
- **Headless charts one CE and one PE**, so `ratio`, `quiet`, `oppoi` and
  `ownoi` read one leg per side rather than the eight strikes the study
  used. The signs read the same way but they are thinner.
- **It buys the charted leg**, which is the IV-picked one. On 05/11 the
  strikes four and five steps further out paid 4.0x and 5.7x against 2.16x
  for the near one. Reaching them needs more strikes subscribed — a
  separate change.
- **The alarm is dead until a phone registers.** The Mongo `devices`
  collection is empty, so `alertPhone` is a no-op (incident 2 in
  `incidents-2026-11-05.md`). The console log and `coilLog.json` still
  record everything.

## Switching it on and off

    curl localhost:3456/api/coil                 # what it sees right now, both sides
    curl localhost:3456/api/coilLog              # every arm and fire
    curl -XPOST localhost:3456/api/coil -H 'content-type: application/json' \
         -d '{"trade": false}'                   # alarm only, no orders
    curl -XPOST localhost:3456/api/coil -H 'content-type: application/json' \
         -d '{"enabled": false}'                 # off entirely

`autoTrade.json` must keep `"coil"` in `kinds`, or the autopilot skips the
row on its own kind check. `levelKinds` is new and holds `bounce`/`break`
only: `minRR` and `minTouches` are measured against a horizontal level, and
a coil release has neither.
