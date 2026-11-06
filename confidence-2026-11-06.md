# Confidence index — 06/11/2026 fires

Built by confidence.js. Scores use only what was known at the fire; fwd% is the mark.

## Calibration (fires up to 15:30 with a 15-min forward price)

|score band|n|median fwd15%|green %|median fwd30%|
|---|---|---|---|---|
|80+|3|24.4|67|90.7|
|65-79|9|29.7|100|70.6|
|50-64|30|3.3|57|4.0|
|<50|38|-0.9|47|-5.6|

## After 15:00 — every fire

|time|symbol|kind|score|grade|may break|fwd15%|fwd30%|blocked by|
|---|---|---|---|---|---|---|---|---|
|15:00|25450CE|bounce|68|good|late lunch|95.85|95.85|Max 8 trades a day|
|15:02|25450CE|break|73|good|cap late lunch open|83.19|83.19|Max 8 trades a day|
|15:02|25450CE|holdlow|85|rare|cap late lunch open lock|83.19|83.19|Max 8 trades a day|
|15:06|25450CE|speedgreen|73|good|cap late lunch open|30.97|30.97|Max 8 trades a day|
|15:11|24300PE|bounce|54|ordinary|-|-18.25|-1|No entry after 15:10 (low volume); Max 8 trades a day; PE needs the index biased down|
|15:12|24300PE|break|46|weak|-|-18.31|-4.58|No entry after 15:10 (low volume); Max 8 trades a day; PE needs the index biased down|
|15:20|25650CE|speedgreen|82|rare|cap late lunch open|-|-|Max 8 trades a day|
|15:21|25650CE|break|67|good|lunch|-|-|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m candle under 2.5x its own median body|
|15:25|24300PE|speedgreen|59|ordinary|-|22.6|22.6|Max 8 trades a day|
|15:26|24300PE|holdlow|70|good|late lunch open|21.1|21.1|Max 8 trades a day|
|15:30|25700CE|bounce|62|ordinary|-|4.33|4.33|No entry after 15:10 (low volume); Max 8 trades a day|
|15:30|24350PE|speedgreen|51|ordinary|-|-|-|Max 8 trades a day|
|15:31|24350PE|bounce|45|weak|-|-|-|No entry after 15:10 (low volume); Max 8 trades a day; PE needs the index biased down|
|15:32|24350PE|break|38|weak|-|-|-|No entry after 15:10 (low volume); Max 8 trades a day; PE needs the index biased down|
|15:39|25700CE|speedgreen|77|good|cap late lunch open|-0.24|-0.24|Max 8 trades a day|
|15:43|25700CE|break|65|good|lunch|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|15:58|25700CE|break|65|good|lunch|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|16:13|25700CE|break|42|weak|-|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Index not chopping (30-min efficiency ≥ 10%, or out of the range); Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|16:28|25700CE|break|42|weak|-|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Index not chopping (30-min efficiency ≥ 10%, or out of the range); Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|16:41|25700CE|break|42|weak|-|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Index not chopping (30-min efficiency ≥ 10%, or out of the range); Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|18:43|25700CE|break|43|weak|-|0|0|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|19:13|25700CE|break|33|weak|-|0|-|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m volume ≥ 50000 units or ≥ 1x its own median|
|19:28|25700CE|break|33|weak|-|-|-|No entry after 15:10 (low volume); Max 8 trades a day; Last 1m volume ≥ 50000 units or ≥ 1x its own median|

## All 130 fires, worst to best

|time|symbol|kind|score|grade|fwd15%|why
|---|---|---|---|---|---|---|
|14:39|25450CE|holdlow|94|rare|0|+12 holdlow, +8 stop 15% away — the option is moving, +6 3 touches, +4 index efficiency 36.5%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹21.55 in the measured band|
|14:51|25450CE|holdlow|94|rare|24.43|+12 holdlow, +8 stop 11% away — the option is moving, +6 4 touches, +4 index efficiency 39.5%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹21.9 in the measured band|
|15:02|25450CE|holdlow|85|rare|83.19|+12 holdlow, +3 stop 8% away, +6 3 touches, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹23.2 in the measured band|
|15:20|25650CE|speedgreen|82|rare|-|+12 speedgreen, +8 stop 12% away — the option is moving, +4 index efficiency 41.6%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹21 in the measured band, -6 too late to let it run|
|15:39|25700CE|speedgreen|77|good|-0.24|+12 speedgreen, +3 stop 8% away, +4 R 2.31, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.55 in the measured band, -6 too late to let it run|
|13:37|25300CE|speedgreen|76|good|61.14|+12 speedgreen, +8 stop 12% away — the option is moving, +4 index efficiency 40%, +5 CE with the up bias, -6 5 past trades, net ₹-91, +3 ₹17.5 in the measured band|
|13:45|25300CE|speedgreen|76|good|29.72|+12 speedgreen, +8 stop 23% away — the option is moving, +4 index efficiency 39.6%, +5 CE with the up bias, -6 5 past trades, net ₹-91, +3 ₹24.9 in the measured band|
|13:58|25300CE|speedgreen|73|good|-|+12 speedgreen, +8 stop 12% away — the option is moving, +4 index efficiency 46.4%, +5 CE with the up bias, -6 9 past trades, net ₹-2620|
|14:23|25450CE|speedgreen|73|good|8.82|+12 speedgreen, +3 stop 7% away, -6 index chopping, +5 CE with the up bias, +6 6 past trades, net ₹560, +3 ₹18.7 in the measured band|
|15:02|25450CE|break|73|good|83.19|+3 stop 8% away, +6 3 touches, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹23.2 in the measured band|
|15:06|25450CE|speedgreen|73|good|30.97|+12 speedgreen, +8 stop 25% away — the option is moving, +4 index efficiency 42.1%, +5 CE with the up bias, -6 9 past trades, net ₹-2620|
|14:37|25450CE|bounce|72|good|12.11|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, +4 index efficiency 25.1%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹19.4 in the measured band|
|15:26|24300PE|holdlow|70|good|21.1|+12 holdlow, +8 stop 10% away — the option is moving, +6 4 touches, +4 R 2.3, +4 index efficiency 48.1%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹16.35 in the measured band, -6 too late to let it run|
|14:37|25450CE|break|68|good|12.11|+3 stop 6% away, -3 one touch — that is a line, not a level, +4 index efficiency 25.1%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹19.4 in the measured band|
|15:00|25450CE|bounce|68|good|95.85|+4 bounce, -4 stop only 2.8% away — inside the noise, +4 R 1.92, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹21.7 in the measured band|
|14:10|24100PE|speedgreen|67|good|-|+12 speedgreen, +3 stop 6% away, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹18.35 in the measured band|
|15:21|25650CE|break|67|good|-|+8 stop 13% away — the option is moving, -3 one touch — that is a line, not a level, +4 index efficiency 40.7%, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹21.1 in the measured band, -6 too late to let it run|
|15:43|25700CE|break|65|good|0|+3 stop 7% away, +4 R 2.68, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|15:58|25700CE|break|65|good|0|+3 stop 7% away, +4 R 2.68, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|09:47|25300CE|break|64|ordinary|20.91|+8 stop 18% away — the option is moving, -3 one touch — that is a line, not a level, +4 index efficiency 37.5%, +5 CE with the up bias|
|10:01|24900CE|bounce|64|ordinary|6.48|+4 bounce, +3 stop 10% away, -3 one touch — that is a line, not a level, +4 R 1.34, +4 index efficiency 37.5%, +5 CE with the up bias, -3 ₹64 — above the band|
|12:31|25200CE|break|64|ordinary|-9.55|+8 stop 10% away — the option is moving, +4 R 1.3, +4 index efficiency 49.6%, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +3 ₹22 in the measured band, -4 lunch hours|
|15:30|25700CE|bounce|62|ordinary|4.33|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹19.65 in the measured band, -6 too late to let it run|
|10:11|24900CE|bounce|60|ordinary|4.52|+4 bounce, +3 stop 10% away, -3 one touch — that is a line, not a level, +4 index efficiency 37.5%, +5 CE with the up bias, -3 ₹65.2 — above the band|
|11:41|25350CE|bounce|59|ordinary|-|+4 bounce, -4 stop only 2.4% away — inside the noise, +6 3 touches, +4 R 1, +5 CE with the up bias, -6 18 past trades, net ₹-3173|
|15:25|24300PE|speedgreen|59|ordinary|22.6|+12 speedgreen, +3 stop 10% away, +4 R 2.5, +4 index efficiency 36.9%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹16.15 in the measured band, -6 too late to let it run|
|09:37|25300CE|break|58|ordinary|27.27|+8 stop 21% away — the option is moving|
|12:19|24900CE|bounce|58|ordinary|-|+4 bounce, +3 stop 5% away, -3 one touch — that is a line, not a level, +4 index efficiency 25.8%, +5 CE with the up bias, -6 9 past trades, net ₹-1406, +8 same shape 3/5 green, -3 ₹69.55 — above the band, -4 lunch hours|
|10:29|24900CE|break|57|ordinary|-10.75|+8 stop 16% away — the option is moving, -3 one touch — that is a line, not a level, +5 CE with the up bias, -3 ₹70.7 — above the band|
|12:47|25200CE|bounce|57|ordinary|-8.27|+4 bounce, -4 stop only 2.3% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.11, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +8 same shape 3/5 green, +3 ₹19.95 in the measured band, -4 lunch hours|
|13:31|25300CE|bounce|57|ordinary|67.42|+4 bounce, -4 stop only 2.3% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.14, +4 index efficiency 30.3%, +5 CE with the up bias, -6 44 past trades, net ₹-7324, +3 ₹15.5 in the measured band|
|10:28|24900CE|bounce|56|ordinary|-3.96|+4 bounce, +3 stop 9% away, -3 one touch — that is a line, not a level, +5 CE with the up bias, -3 ₹65.7 — above the band|
|11:37|25200CE|bounce|56|ordinary|4.51|+4 bounce, -4 stop only 2.1% away — inside the noise, +4 R 1.12, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +3 ₹18.85 in the measured band|
|12:36|25200CE|bounce|56|ordinary|3.05|+4 bounce, +3 stop 7% away, -3 one touch — that is a line, not a level, +4 index efficiency 42.4%, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +3 ₹19.65 in the measured band, -4 lunch hours|
|13:31|25300CE|break|56|ordinary|67.42|-4 stop only 2.3% away — inside the noise, +4 R 2.14, +4 index efficiency 30.3%, +5 CE with the up bias, -6 44 past trades, net ₹-7324, +3 ₹15.5 in the measured band|
|13:46|24100PE|bounce|56|ordinary|-3.38|+4 bounce, -4 stop only 2.3% away — inside the noise, +6 4 touches, +4 R 1.44, +4 index efficiency 36.1%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹19.25 in the measured band|
|14:23|25450CE|break|55|ordinary|13.69|-4 stop only 2.5% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.78, -6 index chopping, +5 CE with the up bias, +6 6 past trades, net ₹560, +3 ₹17.9 in the measured band|
|14:30|24200PE|speedgreen|55|ordinary|-21.2|+12 speedgreen, +3 stop 9% away, +4 R 2.82, -6 index chopping, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹19.1 in the measured band|
|10:31|24400PE|bounce|54|ordinary|-|+4 bounce, +3 stop 8% away, -3 one touch — that is a line, not a level, +4 R 2.72, +4 index efficiency 30.5%, -5 PE against the up bias, -3 ₹71.2 — above the band|
|10:51|23800PE|break|54|ordinary|-|+8 stop 10% away — the option is moving, -3 one touch — that is a line, not a level, +5 PE with the down bias, -6 7 past trades, net ₹-555|
|10:56|24900CE|bounce|54|ordinary|4.28|+4 bounce, +8 stop 10% away — the option is moving, +6 4 touches, -5 CE against the down bias, -6 9 past trades, net ₹-1406, -3 ₹60.7 — above the band|
|11:01|24350PE|bounce|54|ordinary|-18.57|+4 bounce, +3 stop 7% away, -3 one touch — that is a line, not a level, +4 index efficiency 44%, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹93.7 — above the band|
|13:59|25300CE|break|54|ordinary|-|+8 stop 13% away — the option is moving, -3 one touch — that is a line, not a level, +5 CE with the up bias, -6 9 past trades, net ₹-2620|
|15:11|24300PE|bounce|54|ordinary|-18.25|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, +4 R 1.26, +4 index efficiency 47.9%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹20 in the measured band|
|09:48|23800PE|bounce|53|ordinary|-3.76|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, +4 index efficiency 37.3%, -5 PE against the up bias|
|12:24|25200CE|bounce|53|ordinary|-1.49|+4 bounce, -4 stop only 3.5% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.14, +4 index efficiency 35.5%, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +3 ₹20.1 in the measured band, -4 lunch hours|
|12:46|24050PE|bounce|53|ordinary|13.75|+4 bounce, +3 stop 5% away, +4 R 1.35, +4 index efficiency 20.2%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹20 in the measured band, -4 lunch hours|
|11:49|24900CE|bounce|52|ordinary|-11.81|+4 bounce, -4 stop only 2.5% away — inside the noise, +4 R 1.1, -6 index chopping, +5 CE with the up bias, -6 7 past trades, net ₹-1241, +8 same shape 4/5 green, -3 ₹60.95 — above the band|
|12:44|25200CE|break|52|ordinary|-8.96|+3 stop 6% away, -3 one touch — that is a line, not a level, +4 index efficiency 24.9%, +5 CE with the up bias, -6 43 past trades, net ₹-6969, +3 ₹21.2 in the measured band, -4 lunch hours|
|12:56|24050PE|bounce|52|ordinary|-|+4 bounce, +3 stop 7% away, -3 one touch — that is a line, not a level, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹22.1 in the measured band, -4 lunch hours|
|09:58|24350PE|break|51|ordinary|2.98|+8 stop 11% away — the option is moving, -3 one touch — that is a line, not a level, +4 index efficiency 38.8%, -5 PE against the up bias, -3 ₹78.95 — above the band|
|11:32|25200CE|bounce|51|ordinary|8.54|+4 bounce, -4 stop only 2.2% away — inside the noise, +6 4 touches, +4 R 1.63, -6 index chopping, -6 43 past trades, net ₹-6969, +3 ₹18.15 in the measured band|
|13:06|24050PE|break|51|ordinary|-|+3 stop 9% away, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹23.5 in the measured band, -4 lunch hours|
|13:31|24750CE|bounce|51|ordinary|-|+4 bounce, -4 stop only 3.8% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.37, +4 index efficiency 28.6%, +5 CE with the up bias, -6 9 past trades, net ₹-1406, -3 ₹146.1 — above the band|
|15:30|24350PE|speedgreen|51|ordinary|-|+12 speedgreen, +3 stop 10% away, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹21.8 in the measured band, -6 too late to let it run|
|10:19|24900CE|break|50|ordinary|3.34|+3 stop 7% away, -3 one touch — that is a line, not a level, +4 R 1.37, -6 index chopping, +5 CE with the up bias, -3 ₹65.95 — above the band|
|11:37|24900CE|bounce|50|ordinary|-11.32|+4 bounce, -4 stop only 2.1% away — inside the noise, +4 R 1.38, +5 CE with the up bias, -6 7 past trades, net ₹-1241, -3 ₹63.15 — above the band|
|12:28|24000PE|bounce|50|ordinary|13.47|+4 bounce, +3 stop 5% away, -3 one touch — that is a line, not a level, +4 R 2.28, +4 index efficiency 37.2%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹17.45 in the measured band, -4 lunch hours|
|13:24|25250CE|break|49|weak|-|-4 stop only 4.6% away — inside the noise, -3 one touch — that is a line, not a level, +4 index efficiency 25.5%, +5 CE with the up bias, -6 44 past trades, net ₹-7324, +3 ₹20.65 in the measured band|
|13:43|25300CE|break|49|weak|47.56|-4 stop only 2.1% away — inside the noise, -3 one touch — that is a line, not a level, +4 index efficiency 36.3%, +5 CE with the up bias, -6 5 past trades, net ₹-91, +3 ₹19.45 in the measured band|
|14:11|24150PE|bounce|49|weak|-|+4 bounce, -4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹20 in the measured band|
|11:24|24350PE|bounce|48|weak|-7.16|+4 bounce, +3 stop 9% away, -3 one touch — that is a line, not a level, +4 R 1.04, -6 index chopping, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹86.65 — above the band|
|12:05|24900CE|bounce|48|weak|27.72|+4 bounce, +3 stop 8% away, -3 one touch — that is a line, not a level, +4 R 1.22, -5 CE against the down bias, -6 7 past trades, net ₹-1241, +8 same shape 4/6 green, -3 ₹54.65 — above the band, -4 lunch hours|
|10:13|24350PE|bounce|47|weak|6.97|+4 bounce, -4 stop only 4.4% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.61, +4 index efficiency 30.7%, -5 PE against the up bias, -3 ₹76 — above the band|
|10:50|23800PE|bounce|47|weak|-|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, -6 index chopping, +5 PE with the down bias, -6 7 past trades, net ₹-555|
|13:32|24000PE|bounce|47|weak|-|+4 bounce, -4 stop only 1.6% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.4, +4 index efficiency 25.3%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹15.5 in the measured band|
|10:10|24350PE|break|46|weak|2.26|+3 stop 10% away, -3 one touch — that is a line, not a level, +4 index efficiency 28.7%, -5 PE against the up bias, -3 ₹79.5 — above the band|
|10:27|24400PE|break|46|weak|-|+8 stop 11% away — the option is moving, -3 one touch — that is a line, not a level, -6 index chopping, -3 ₹87.55 — above the band|
|10:41|23800PE|break|46|weak|-|+3 stop 8% away, -6 index chopping, +5 PE with the down bias, -6 7 past trades, net ₹-555|
|10:52|24350PE|break|46|weak|-6.33|-4 stop only 2.0% away — inside the noise, +4 R 2.12, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹81.3 — above the band|
|11:19|24350PE|break|46|weak|-8.17|+3 stop 9% away, -3 one touch — that is a line, not a level, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹80.2 — above the band|
|12:19|24900CE|break|46|weak|-|+3 stop 5% away, -3 one touch — that is a line, not a level, +4 index efficiency 25.8%, +5 CE with the up bias, -6 9 past trades, net ₹-1406, -3 ₹69.55 — above the band, -4 lunch hours|
|15:12|24300PE|break|46|weak|-18.31|+3 stop 9% away, -3 one touch — that is a line, not a level, +4 index efficiency 38.6%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹20.75 in the measured band|
|11:54|24850CE|bounce|45|weak|-|+4 bounce, +3 stop 7% away, -6 index chopping, -5 CE against the down bias, -6 7 past trades, net ₹-1241, +8 same shape 4/5 green, -3 ₹69.35 — above the band|
|12:08|24350PE|bounce|45|weak|-24.58|+4 bounce, -4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.32, -6 index chopping, +5 PE with the down bias, -6 11 past trades, net ₹-1871, +8 same shape 5/6 green, -3 ₹76.5 — above the band, -4 lunch hours|
|15:31|24350PE|bounce|45|weak|-|+4 bounce, +8 stop 14% away — the option is moving, -3 one touch — that is a line, not a level, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹23 in the measured band, -6 too late to let it run|
|12:57|25200CE|bounce|44|weak|-|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, -6 index chopping, -5 CE against the down bias, -6 43 past trades, net ₹-6969, +8 same shape 4/5 green, +3 ₹19.3 in the measured band, -4 lunch hours|
|09:55|24350PE|bounce|43|weak|13.63|+4 bounce, -4 stop only 4.2% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.85, -5 PE against the up bias, -3 ₹71.55 — above the band|
|11:09|24900CE|bounce|43|weak|1.04|+4 bounce, -4 stop only 4.4% away — inside the noise, -3 one touch — that is a line, not a level, +5 CE with the up bias, -6 9 past trades, net ₹-1406, -3 ₹62.5 — above the band|
|11:37|24900CE|break|43|weak|-11.32|-4 stop only 2.1% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.38, +5 CE with the up bias, -6 7 past trades, net ₹-1241, -3 ₹63.15 — above the band|
|12:03|24350PE|bounce|43|weak|-22.63|+4 bounce, -4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.66, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹78.45 — above the band, -4 lunch hours|
|12:08|23950PE|bounce|43|weak|-|+4 bounce, -4 stop only 2.2% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1, -6 index chopping, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹20.8 in the measured band, -4 lunch hours|
|14:05|24100PE|bounce|43|weak|-|+4 bounce, -4 stop only 2.6% away — inside the noise, -3 one touch — that is a line, not a level, +4 index efficiency 38.1%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹17.2 in the measured band|
|14:10|25300CE|bounce|43|weak|-|+4 bounce, +3 stop 7% away, -3 one touch — that is a line, not a level, -5 CE against the down bias, -6 9 past trades, net ₹-2620|
|14:41|24200PE|break|43|weak|-20.37|-4 stop only 4.2% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1, +4 index efficiency 40.5%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹18.9 in the measured band|
|18:43|25700CE|break|43|weak|0|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|10:47|25300CE|break|42|weak|-6.44|+3 stop 8% away, +6 3 touches, -6 index chopping, -5 CE against the down bias, -6 18 past trades, net ₹-3173|
|12:02|24350PE|break|42|weak|-21.89|+3 stop 10% away, -6 index chopping, -6 11 past trades, net ₹-1871, +8 same shape 4/7 green, -3 ₹76.05 — above the band, -4 lunch hours|
|13:09|25300CE|bounce|42|weak|28.79|+4 bounce, -4 stop only 4.3% away — inside the noise, -6 index chopping, -6 9 past trades, net ₹-672, +8 same shape 3/5 green, -4 lunch hours|
|13:19|25300CE|break|42|weak|1.58|+3 stop 8% away, -3 one touch — that is a line, not a level, +5 CE with the up bias, -6 43 past trades, net ₹-6969, -10 same shape only 1/5 green, +3 ₹15.8 in the measured band|
|16:13|25700CE|break|42|weak|0|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, -6 index chopping, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|16:28|25700CE|break|42|weak|0|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, -6 index chopping, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|16:41|25700CE|break|42|weak|0|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, -6 index chopping, +5 CE with the up bias, +6 7 past trades, net ₹554, +3 ₹20.5 in the measured band, -6 too late to let it run|
|10:38|25300CE|bounce|41|weak|-7.49|+4 bounce, +3 stop 6% away, -3 one touch — that is a line, not a level, +4 R 1.07, -6 index chopping, -5 CE against the down bias, -6 18 past trades, net ₹-3173|
|11:27|24850CE|break|41|weak|-10.24|+3 stop 8% away, -3 one touch — that is a line, not a level, -6 7 past trades, net ₹-1241, -3 ₹75.2 — above the band|
|13:26|24750PE|bounce|41|weak|-|+4 bounce, -4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.81, +4 index efficiency 28.2%, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹155.1 — above the band|
|13:07|25200CE|bounce|40|weak|-|+4 bounce, -4 stop only 3.8% away — inside the noise, -6 index chopping, -5 CE against the down bias, -6 43 past trades, net ₹-6969, +8 same shape 5/9 green, +3 ₹18.6 in the measured band, -4 lunch hours|
|13:14|24000PE|bounce|40|weak|-6.42|+4 bounce, +3 stop 7% away, -3 one touch — that is a line, not a level, +4 R 1.73, -6 index chopping, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹16.35 in the measured band, -4 lunch hours|
|11:09|24900CE|break|39|weak|1.04|-4 stop only 4.4% away — inside the noise, -3 one touch — that is a line, not a level, +5 CE with the up bias, -6 9 past trades, net ₹-1406, -3 ₹62.5 — above the band|
|12:03|24350PE|break|39|weak|-22.63|-4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.66, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹78.45 — above the band, -4 lunch hours|
|12:08|23950PE|break|39|weak|-|-4 stop only 2.2% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1, -6 index chopping, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹20.8 in the measured band, -4 lunch hours|
|12:55|24050PE|break|39|weak|-|-4 stop only 4.4% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.21, -6 index chopping, +5 PE with the down bias, -6 49 past trades, net ₹-9100, +3 ₹21.4 in the measured band, -4 lunch hours|
|15:32|24350PE|break|38|weak|-|+8 stop 22% away — the option is moving, -3 one touch — that is a line, not a level, -5 PE against the up bias, -6 11 past trades, net ₹-3867, -6 too late to let it run|
|10:21|24400PE|bounce|37|weak|-6.28|+4 bounce, -4 stop only 4.4% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.2, -6 index chopping, -5 PE against the up bias, -3 ₹86 — above the band|
|11:49|24900CE|break|37|weak|-11.81|-4 stop only 2.5% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.1, -6 index chopping, +5 CE with the up bias, -6 7 past trades, net ₹-1241, -3 ₹60.95 — above the band|
|14:57|24250PE|bounce|37|weak|-|+4 bounce, -4 stop only 4.2% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 5.13 — target too far to be real, +4 index efficiency 28.9%, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹17.9 in the measured band|
|11:08|24350PE|break|36|weak|8.4|+3 stop 9% away, -3 one touch — that is a line, not a level, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹79.75 — above the band|
|11:13|24350PE|bounce|36|weak|2.34|+4 bounce, -4 stop only 4.0% away — inside the noise, +6 3 touches, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹74.9 — above the band|
|13:09|25300CE|break|36|weak|28.79|-4 stop only 4.3% away — inside the noise, +6 3 touches, -6 index chopping, -6 9 past trades, net ₹-672, -4 lunch hours|
|12:00|24850CE|break|35|weak|-|-4 stop only 4.0% away — inside the noise, -3 one touch — that is a line, not a level, +5 CE with the up bias, -6 7 past trades, net ₹-1241, -3 ₹73.25 — above the band, -4 lunch hours|
|10:38|23800PE|bounce|34|weak|-|+4 bounce, -4 stop only 0.4% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 8 — target too far to be real, -6 index chopping, +5 PE with the down bias, -6 7 past trades, net ₹-555|
|11:32|25100CE|bounce|34|weak|-|+4 bounce, -4 stop only 2.1% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 2.27, -6 index chopping, -5 CE against the down bias, -6 9 past trades, net ₹-2620|
|11:48|24350PE|bounce|34|weak|1.29|+4 bounce, +3 stop 5% away, -3 one touch — that is a line, not a level, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹77.4 — above the band|
|14:12|25400CE|break|34|weak|-|-4 stop only 3.7% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 6.56 — target too far to be real, -6 5 past trades, net ₹-91, +3 ₹21.55 in the measured band|
|12:08|24350PE|break|33|weak|-24.58|-4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.32, -6 index chopping, +5 PE with the down bias, -6 11 past trades, net ₹-1871, -3 ₹76.5 — above the band, -4 lunch hours|
|13:30|24750PE|break|33|weak|-|-4 stop only 4.7% away — inside the noise, -3 one touch — that is a line, not a level, +4 index efficiency 27%, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹164.45 — above the band|
|19:13|25700CE|break|33|weak|0|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, +6 7 past trades, net ₹554, -10 same shape only 1/5 green, +3 ₹20.5 in the measured band, -6 too late to let it run|
|19:28|25700CE|break|33|weak|-|-4 stop only 0.2% away — inside the noise, -6 R 75 — target too far to be real, +6 7 past trades, net ₹554, -10 same shape only 1/6 green, +3 ₹20.5 in the measured band, -6 too late to let it run|
|10:37|24400PE|bounce|32|weak|-|+4 bounce, -4 stop only 2.0% away — inside the noise, -3 one touch — that is a line, not a level, -6 index chopping, -6 11 past trades, net ₹-1871, -3 ₹80.6 — above the band|
|13:03|25200CE|break|32|weak|-|+3 stop 9% away, -3 one touch — that is a line, not a level, -6 index chopping, -5 CE against the down bias, -6 43 past trades, net ₹-6969, +3 ₹19.15 in the measured band, -4 lunch hours|
|11:20|24900CE|bounce|31|weak|7.4|+4 bounce, -4 stop only 2.3% away — inside the noise, -3 one touch — that is a line, not a level, +4 R 1.81, -6 index chopping, -5 CE against the down bias, -6 7 past trades, net ₹-1241, -3 ₹58.8 — above the band|
|11:48|24350PE|break|30|weak|1.29|+3 stop 5% away, -3 one touch — that is a line, not a level, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹77.4 — above the band|
|11:23|24850CE|bounce|27|weak|-0.95|+4 bounce, -4 stop only 1.8% away — inside the noise, -3 one touch — that is a line, not a level, -6 index chopping, -5 CE against the down bias, -6 7 past trades, net ₹-1241, -3 ₹68.15 — above the band|
|11:38|24350PE|bounce|27|weak|12.12|+4 bounce, -4 stop only 4.1% away — inside the noise, -3 one touch — that is a line, not a level, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹75.1 — above the band|
|11:58|24350PE|bounce|27|weak|-13.3|+4 bounce, -4 stop only 3.9% away — inside the noise, -3 one touch — that is a line, not a level, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹75.2 — above the band|
|12:21|24350PE|bounce|27|weak|-65.02|+4 bounce, -4 stop only 2.5% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 10.97 — target too far to be real, +4 index efficiency 39.2%, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹57.6 — above the band, -4 lunch hours|
|14:27|24200PE|bounce|27|weak|2.41|+4 bounce, -4 stop only 2.4% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 11.22 — target too far to be real, -6 index chopping, -5 PE against the up bias, -6 49 past trades, net ₹-9100, +3 ₹18.7 in the measured band|
|11:38|24350PE|break|26|weak|12.12|-4 stop only 4.1% away — inside the noise, -6 index chopping, -5 PE against the up bias, -6 11 past trades, net ₹-1871, -3 ₹75.1 — above the band|
|12:09|24900CE|bounce|22|weak|-|+4 bounce, -4 stop only 0.2% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 19 — target too far to be real, -6 index chopping, -6 7 past trades, net ₹-1241, -3 ₹54.3 — above the band, -4 lunch hours|
|12:09|24900CE|break|18|weak|-|-4 stop only 0.2% away — inside the noise, -3 one touch — that is a line, not a level, -6 R 19 — target too far to be real, -6 index chopping, -6 7 past trades, net ₹-1241, -3 ₹54.3 — above the band, -4 lunch hours|
