export function handleLongLowerShadowTrades(cis, kite) {
    if (
        cis.liveMinute.hasLongLowerShadow &&
        global.seconds == 59 &&
        cis.tick.last_price > cis.tick.ohlc.open
    ) {
        cis.targetPrice = cis.tick.last_price + cis.liveMinute.range;
        cis.stopLossPrice = cis.tick.last_price - cis.liveMinute.range;
        cis.inbuiltTarget = true;
        cis.inbuiltStopLoss = true;
        cis.buyStrategy = 'hasLongLowerShadowAboveOpenAt59';
        executeBuy(cis, kite, Math.ceil(cis.tick.last_price));
        return true; // Indicates a trade was executed
    }
    return false;
}