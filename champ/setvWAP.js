export function setVWAP(cis) {
    const candles = cis.minuteData;
    if (!candles || candles.length == 0) return;

    let totalPV = 0;
    let totalVolume = 0;

    for (const c of candles) {
        const typicalPrice = (c.high + c.low + c.close) / 3;
        totalPV += typicalPrice * c.volume;
        totalVolume += c.volume;
    }

    cis.vwap = totalVolume > 0 ? totalPV / totalVolume : null;
}