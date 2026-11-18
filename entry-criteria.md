# Entry criteria — full picture (13/11/2026)

## Step 1 — a setup must fire (autopilot watches these)
- Strikes: NIFTY CE+PE auto-picked by premium ₹15–25, re-picked every 15 min.
- Kinds on: bounce, break, coil, speedgreen, holdlow.
- bounce/break need a level with ≥2 touches.
- bounce bar volume ≥1.2x average of all earlier bars (18/11/2026).
- bounce bar OI not flat: |ΔOI| ≥0.25x strike's median per-minute |ΔOI| (18/11/2026; no OI data = no block).
- R:R floor: ≥2R to first level above (speedgreen ≥1.2R).
- Verdict must be TAKE (not THIN, not BLOCKED).

## Step 2 — autopilot's own caps
- Max 6 trades/day, 1 open position, 3 min between entries, max 4 lots.
- ARM switch on (autoTrade.json `enabled`).

## Step 3 — the no-veto wall (all HARD gates must pass)
Time/day state:
- After 09:20, not 12:00–13:15 low-volume, before 15:10.
- No exit lockout running (10–15 min after a close; ≥15% net winner opens early).
- Day loss under ₹3000. Under 3 losses in a row. Under 8 trades/day.

Index:
- Not chopping: 30-min efficiency ≥10% or price out of the box.
- Right way: CE needs index above rising 20-min EMA, PE below falling.

The strike:
- Current 1m candle not red.
- Last 1m candle not steep (under 2.5x its median body).
- ≥60s since last entry.
- Size still in the tape (under 3 of 4 dead: flow, print size, OI change, spread).
- **Strike actually moving: ±5% over forming+1 candle (2m) or forming+9 (10m) — else "slow-moving sucker" lock.**
- Being traded: last 1m volume ≥50k units or ≥1x own median.
- Premium ₹1–400, price ≥ ₹1.
- Stop (raw 3-candle low) within 15% of entry — machine refusal, no override.

Position state:
- Every open position has a resting SELL. Max 1 open. Not already holding this symbol.

## Waivers (gates that do NOT apply to some kinds)
- speedgreen, holdlow waive: chop, wrongway, steep, redcandle, dead, thin, lunch, late, open, impulse.
- slow and slwide are NEVER waived.

## If all pass → order, then exit plan
- Qty: risk ≤25% of capital (caps quantity, not stop).
- SL: 1 tick under 3-candle low, capped 25% wide; breach watch + resting order.
- Partial at first resistance, then trail the 3-candle low.
- After close: entry lockout 10–15 min.
