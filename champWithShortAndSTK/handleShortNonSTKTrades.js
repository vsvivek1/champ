// handleShortNonSTKTrades.js

export async function handleShortNonSTKTrades(cis, kite, shortOptionOrder, shouldShortBasedOnMA20, check20MAcrossFromAbove, redCandleAfterThreeGreen) {
    if (
        cis.position &&
        cis.position.quantity == 0 &&
        cis.ma20 > cis.tick.last_price &&
        !cis.shorted
    ) {
        if (global.hours == 9 && global.minutes < 30) {
            if (cis.tick.last_price < cis.tick.ohlc.open) {
                cis.signals.safePassShortBasedOnMA20 = true;
                console.log('short based on open', cis.tradingsymbol);
                cis.shorted = true;
                await shortOptionOrder(kite, cis);
                return true;
            }
        }

        if (shouldShortBasedOnMA20(cis)) {
            cis.signals.safePassShortBasedOnMA20 = true;
            console.log('short based on ma20', cis.tradingsymbol);
            cis.shorted = true;
            await shortOptionOrder(kite, cis);
            return true;
        }

        if (check20MAcrossFromAbove(cis)) {
            cis.signals.safePass20MAcrossFromAbove = true;
            console.log('20 ma cross from above', cis.tradingsymbol);
            cis.shorted = true;
            await shortOptionOrder(kite, cis);
            return true;
        }

        if (redCandleAfterThreeGreen(cis)) {
            cis.signals.safePassRedCandleAfterThreeGreen = true;
            console.log('red candle after three green', cis.tradingsymbol);
            cis.shorted = true;
            await shortOptionOrder(kite, cis);
            return true;
        }

        if (global.seconds % 30 == 0 && cis.lastLogggedHandleStk !== global.seconds) {
            cis.lastLogggedHandleStk = global.seconds;
            console.log('handleNonSTKTrades called', cis.tradingsymbol, 'position', cis.position.quantity, 'ma20', cis.ma20, 'last price', cis.tick.last_price, 'open', cis.tick.ohlc.open, global.clock, '\n\n');
        }
    }

    return false; // if no short condition matched
}
