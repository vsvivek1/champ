# Near-stop offer (12/11/2026)

## The rule you asked for
- Old: 3-candle stop wider than 15% → slwide refuses, full stop.
- New: before refusing, it checks nearer lows, in this order:
  1. 2-candle low (completed bars)
  2. current (forming) bar's low
- First one that puts the stop under 15% — and not inside the slPct noise band — is OFFERED.
- Offered, not taken: the TAKE IT button now says "stop moves to the 2-candle low X (y%)". Your click is a yes to THAT stop.
- On the fill, the breach line and the resting SL both move onto the nearer level — one line, watched and rested at.
- Autopilot / OI signal / armed triggers: still a flat refusal. No change.
- If neither nearer low fits under 15%, the old refusal stands as before.

## Guard rails
- The confirmed near stop is one-shot: one entry, 3 minutes, then it dies unused.
- Same ticket rules as before: 90 s, same symbol, 2% price band.
- Everything logs to slwideLog.json with a `fallback` field, so we can measure if this rule helps or hurts.

## Commentary strip redesign
- The strip under each chart is now one chip per signal (green / red / grey pills) instead of one long dotted line.
- Words inside each chip unchanged — the help drawer still matches.
- MOVING FAST and short covering render as solid amber / green chips; blink and beeps unchanged.

## Files
- chartApp.js: formingLow(), nearStopFallback(), slwide gate, ticket flow, placeTargetOrder, slwide theory text.
- chartApp.html: TAKE IT button + hint, .cm chip CSS, commentary() tag renderer.
