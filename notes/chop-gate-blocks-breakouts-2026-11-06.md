# The chop gate was refusing breakouts — 06/11/2026

## What you hit

The gate said: *index not chopping, 30-min efficiency >= 10%*.
Efficiency = net move / total distance walked, over 30 one-minute closes.

A range has almost no net move but walks a lot of distance. So a range
is low efficiency **by definition**. And the breakout is the last one or
two minutes of the same 30-minute window — drowned by the 28 minutes of
rotation in front of it.

Worked numbers, 20-point range, 30 bars:

| Tape | Walked | Net | Efficiency | Old gate |
|---|---|---|---|---|
| Coil, no break | ~300 | 0 | 0% | BLOCK |
| Coil + 40-pt break up | ~340 | +30 | 5.3% | BLOCK |
| Wider coil + same break | ~500 | +18 | 1.5% | BLOCK |

The wider and longer the coil — that is, the **better** the setup — the
more certainly it was refused. Exactly backwards.

## What does not fix it

- **Lower minEff.** Then the gate stops working on genuinely dead days,
  which is the one job it was added for.
- **A shorter efficiency window.** Tried and measured: a 10-minute window
  still holds 6 minutes of rotation in front of a 4-minute break, and the
  case above measured 17.6% — nowhere near a pass. Efficiency is net over
  DISTANCE WALKED, and the problem is that a coil walks a lot. No window
  length rescues it.
- **Waiving chop for `break`, the way speedgreen does.** Then a fake break
  inside a rotting range also passes, and that is a real loser.

## The fix

Measure what a breakout actually is: **price has left the box.**

1. Take the 30-minute window.
2. Set aside the last `breakWin` (5) minutes — that is the candidate break.
3. The high and low of what remains is the range that was being traded.
4. If price is clear of that edge by `escapeFrac` (0.25) of the box's own
   width, it is a break, and chop does not block.
5. The escape must point the way of the leg. A CE needs an up escape.

Because the margin scales with the box width, a longer and tighter coil
makes this **easier** to satisfy, not harder. Right way round.

It is an override with evidence, not a waiver. The efficiency number is
still computed and still shown; on a chop day the row now says:

> efficiency 5.3% — +30 pts of progress for 340 pts walked, box 24690-24710
> and price is 30 pts above it — CHOP over 30 min but price has LEFT the
> range: BREAKOUT OVERRIDE

## Tested, 8 cases

| Tape | Old | New |
|---|---|---|
| Coil, no break yet | BLOCK | BLOCK |
| Coil + 40-pt break up (your missed trade) | BLOCK | **pass** |
| Wide coil, same break | BLOCK | **pass** |
| Rotting range, fake break | BLOCK | BLOCK |
| Break DOWN, buying a CE | BLOCK | BLOCK |
| Break DOWN, buying a PE | BLOCK | **pass** |
| Trending day | pass | pass |
| Spike up then straight back inside | BLOCK | BLOCK |

## Settings

In `noTrade.json`, or `POST /api/noTrade`:

- `breakWin` — 5 — minutes set aside as the break
- `escapeFrac` — 0.25 — clear of the box edge by this share of its width
- `minEff` — 10 — unchanged, the long window is still a floor
- `regimeWin` — 30 — unchanged

## Caveats

- The box is built from the INDEX, one sample a minute. A single strike can
  break out while the index is still inside its box; that case is still
  refused, and on purpose — a long option needs index follow-through.
- `escapeFrac` of 0.25 is a judgement, not a measured number. On the cases
  above it separated real escapes from pokes cleanly, but it has not been
  back-tested over the trade log yet. That is the next thing worth doing.
