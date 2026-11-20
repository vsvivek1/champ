# V-reversal override for the wrongway gate (built 20/11/2026)

## Problem
- The wrongway gate reads spot vs the 20-min EMA plus its 5-min slope.
- At a V turn the EMA still points the old way. The gate blocks the right leg exactly at the reversal, and only lets it in 5-10 min late when the move is half done.
- Same shape of failure as chop had with breakouts: the measure is an average of the past, the event is the last few minutes.

## What was built
Detection lives in `computeRegime` (chartApp.js), on 1-min candles of the same regime window. Spot samples now carry per-minute `hi`/`lo` (from ticks, and from `high`/`low` of seeded history bars).

A V qualifies only when ALL THREE hold — this is what keeps it silent in a sideways market:

1. **STAIRS IN** — the `vTrendBars` (3) candles into the extreme each step the old way: lower high AND lower low into a low (for a CE), mirrored for a top (PE). A sideways wiggle has no staircase, so no override.
2. **FRESH + DEEP** — the extreme printed within the last `vWin` (5) minutes, and price has snapped back at least `vFrac` (0.5) of the window range AND at least `vMinPts` (15) points. Depth scales with the day; the points floor keeps a dead day's wiggle out.
3. **ONE RUNG OUT** — at least one candle after the extreme makes a higher high AND a higher low (mirrored). New structure, not just a wick.

## Gate behaviour
- `bias != want` but the V points the leg's way → wrongway PASSES, detail says `BUT V-REVERSAL UP: stairs into the extreme, 23.4 pts snapped back from it (printed 3 min ago), one HH+HL candle out`.
- Counter-trend is the riskiest entry in the book, so every entry path cuts to HALF quantity (same plumbing as the chop warning; the log says which of the two caused the halving).
- A slow drift can never fire it: the extreme must be fresh, so an old top with price leaking since is just a downtrend the EMA catches on its own.

## Settings (noTrade.json)
- `vWin` 5 — the extreme must be this fresh, minutes
- `vFrac` 0.5 — snap back at least this fraction of the window range
- `vMinPts` 15 — and at least this many points
- `vTrendBars` 3 — candles stair-stepping into the extreme
