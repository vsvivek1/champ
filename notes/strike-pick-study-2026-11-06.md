# Is the auto strike pick costing money? 06/11/2026

Your words: "the auto loading of options is not profitable i think. max
profits are got from more quantity per availabel capital. so select
judiciously."

Measured on your own 157 closed trades in `tradeLog.json` (21/10 to
06/11), every number net of charges and as a percent of the money put in.

## By entry premium — the strike-pick question

| band | trades | green | median net % | total net | avg qty | charges as % of money in |
|---|---|---|---|---|---|---|
| under 8 | 22 | 45% | −1.63% | −₹2,051 | 907 | 1.10% |
| 8–15 | 35 | 49% | −2.07% | −₹5,553 | 614 | 0.88% |
| **15–25** | **28** | **61%** | **+0.89%** | **−₹1,336** | **452** | **0.69%** |
| 25–40 | 34 | 29% | −2.96% | −₹6,120 | 344 | 0.65% |
| over 40 | 38 | 71% | +0.91% | −₹12,736 | 118 | 0.87% |

## The answer to your hypothesis: half right, and the half that is wrong is the expensive half

**Right:** the old picker was standing in the wrong place. It used
0.6 sigma OTM and never looked at the premium. Today it chose CE 24850 at
₹66.30 and PE 24350 at ₹78.35 — on ₹1.2L that is 1,800 and 1,500 units.

**Wrong:** more quantity is not where the money is. Your two cheapest
bands are your two worst by median net (−1.63% and −2.07%). Going cheaper
has been tried 57 times in this book and it lost on both ends.

**Why, and this is the part worth keeping:** charges do not care about the
premium. A round trip on ₹1.2L costs about ₹270 whether that buys 1,950
units at ₹60 or 24,000 units at ₹5 — a flat 0.23% either way. So there is
no cost saving in going cheap. But the *tick* does care: one 0.05 tick is
**1.0% of a ₹5 option and 0.08% of a ₹60 one**. Cheaper multiplies the
spread you cross twice; it does not multiply the edge. The 1.10% charge
figure in the cheap band above is not the premium's fault either — it is
small tickets paying the fixed ₹40 brokerage.

The rich end is the other trap: 71% green and still −₹12,736, because a
stop on a ₹60 option is a big rupee number. One trade there cost ₹8,026,
more than that band's entire net loss.

## What changed

The picker now quotes the chain and picks by **premium ₹15–25** instead of
computing an IV distance. It is live: `CE 25150 @ ₹19.5 / PE 23950 @ ₹20.8`
against spot 24,600 — about **3.4x the quantity** the old pick gave for the
same cash, inside the only band your book is positive in. `premLo` and
`premHi` in `autoTrade.json`, changeable without a restart. If the chain
does not quote, it falls back to the old sigma formula.

## The bigger finding, which is NOT about strikes

| money put in per trade | trades | green | net per trade |
|---|---|---|---|
| under ₹5,000 | 37 | 59% | −₹15 |
| ₹5,000–10,000 | 84 | 57% | −₹80 |
| **₹10,000–20,000** | **32** | **28%** | **−₹410** |
| over ₹20,000 | 4 | 50% | −₹1,853 |

By lot count the same cliff shows: 1–2 lots is 68% green, and the 5–10 lot
bucket alone is −₹18,806 of your −₹27,795. Size, not strike, is where this
book is bleeding. I have not touched sizing — that is live money and your
call — but if one thing gets changed next, it is a cap on money deployed
per trade, not the strike.

## Caveats, stated plainly

157 trades over 6 days. The premium band is a proxy for moneyness and days
to expiry together, so 15–25 is "the cheap end is not the answer", not
"15–25 is the optimum". The size table is also confounded: bigger trades
may simply have been taken in worse conditions, or sized up after losses.
That is why the band lives in a config file and not in the code.
