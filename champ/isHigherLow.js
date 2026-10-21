export function isHigherLow(
    instrument,
    n = 2
) {

    if (
        !instrument ||
        !Array.isArray(
            instrument.minuteData
        )
    ) {

        return false;

    }

    const candles =
        instrument.minuteData;

    if (candles.length < n) {

        return false;

    }

    const lastNCandles =
        candles.slice(-n);

    // must keep making higher lows
    for (
        let i = 1;
        i < lastNCandles.length;
        i++
    ) {

        const currentLow =
            Number(
                lastNCandles[i].low
            );

        const previousLow =
            Number(
                lastNCandles[i - 1].low
            );

        if (
            currentLow <= previousLow
        ) {

            return false;

        }

    }

    return true;

}
