# Four rule changes — evaluation before deploying
06/11/2026. Nothing below is deployed yet.

## 1. Day loss = 25% of capital, not ₹3000

- Today was never near either number: worst running drawdown was -₹708, the day closed +₹149 net on 8 trades. So this change would not have altered a single entry today.
- On ₹1 lakh the cap moves ₹3,000 → ₹25,000.
- **The thing to decide:** `riskPctOfCapital` is also 25. So one maximum-size trade stopped at its full stop distance spends the ENTIRE day cap in one go. The brake becomes "one full-risk loss ends the day".
- If you want room for a second try, the day cap has to be bigger than the per-trade risk — e.g. per-trade 10%, day 25%.
- Code note: `noTradeChecks()` is synchronous and has no cash figure. It needs the last `getMargins()` value cached (and written to a file so a restart has one), with the rupee number kept as the fallback when cash is unknown. Otherwise the cap silently becomes "no cap".

## 2. Trade cap crossable at score 50 (was 72)

Replay of today, rules obeyed except what the score crosses, one position at a time, 4 lots:

|bars|trades|green|total net|
|---|---|---|---|
|cap 72, late 68 (now)|6|6|₹4,986|
|cap 50, late 50|6|6|₹5,286|

At 50 the 15:00 bounce (score 68) is taken instead of the 15:02 holdlow (85) — it fired first, and only one position is allowed. It made +40.97% net against the other's +34.01%.

With the one-at-a-time rules off (ranking sample, not a tradeable day): 8 trades → 9 trades, ₹9,323 → ₹11,990.

**Caution:** at 50 the cap is crossable by a score of 50, which is the middle of the ordinary band — that is close to having no cap. Of today's 130 fires, 61 scored 50-64. On a day where the first 8 trades were losses, this is the rule that would let the 9th through.

## 3. Late (15:10) crossable at score 50 (was 68)

No separate effect today: every late fire was already blocked by the trade cap as well, so nothing new is unlocked by this change alone.

## 4. Lunch should be volume-based at any time, not clocked

**First, a bug this exposes.** The current lunch and late checks compare `candles[candles.length-1].volume` with `candles[0].volume` from `secCandles`. Those are 5-SECOND buckets, and the first bucket deliberately swallows the whole day's cumulative volume. Measured live just now on 25650CE: first bucket 33,708,935 units, last bucket 7,475 — a ratio of 0.02% against a requirement of 60%.

So both gates ALWAYS read "low volume". The 15:10 gate has been a pure clock block, and its "(low volume)" label has never been true. That is why every fire after 15:10 today carried that blocker.

**The proposed rule**, measured on the 13 fires where the live feed has per-minute volume (afternoon strikes only — no feed for the morning):

- last completed 1-minute volume under 50% of the day's average 1-minute volume
- blocks 1 of 13: the 13:58 25300CE speedgreen at 42% of average
- lets through the 15:00 25450CE bounce at 53% of average, which then ran +95.85% in 15 minutes
- the `thin` gate blocked none of these 13, so the new rule is not a duplicate of it: `thin` is median-based and generous, this is average-based and bites in a spiky tape

**How to build it:** `volFlow()` already does the per-minute arithmetic correctly — extend it to return the day's average, and point the lunch check at it. Drop `lunchFrom`/`lunchTo` from the decision. Keep the code name `lunch` so the waiver lists and the logs stay valid.

## Recommended order

1. Fix the lunch/late volume arithmetic (it is wrong today, whatever is decided about the rest).
2. Lunch → volume-only, any time, 50% of the day's average.
3. Day loss → 25% of capital, with cash cached and a rupee fallback; decide per-trade risk first.
4. Cap and late bars → 50, and watch for a few days. 65 was the band that was 100% green today; 50 is the band that was 57%.

## 5. Skip the trade when the 3-candle-low stop is more than 25% under entry

- Today: 1 fire of 130 is over 25% wide — the 15:06 25450CE speedgreen at exactly 25%. It went +30.97% in 15 minutes, and in the replay it made +19.18% net. So the one trade this rule touches today is a winner it refuses.
- Across every day on the log: 15 fires of 377 are over 25%, and only that one has a forward result, so the log cannot say yet whether the other 14 would have paid.
- Today's picture is the opposite of the rule: median fwd15 by stop width was 0.0% for stops under 5%, +1.3% for 5-10%, +21.1% for 10-15%, +29.7% for 20-25%. The wide stop is the mark of a strike that is actually travelling.
- It also pulls against two decisions already in the app: `slMaxPct` was deleted on purpose (risk is capped by QUANTITY, not by moving the stop), and the confidence index pays +8 for a stop 10% or wider.
- If it goes in, it should be an entry veto only (never a narrower stop), it should sit with the hard rules so no score crosses it, and the confidence reward should be limited to the 10-25% band so the two rules stop disagreeing.
- Cost of being wrong is small in either direction: it fires about once a day.
