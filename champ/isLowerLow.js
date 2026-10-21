export function isLowerLow(
    instrument,
    n = 2
) {

    // =========================
    // SAFETY CHECK
    // =========================

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

    // need minimum n candles
    if (candles.length < n) {

        return false;

    }

    // =========================
    // LAST N CANDLES
    // =========================

    const lastNCandles =
        candles.slice(-n);

    // =========================
    // CHECK LOWER LOWS
    // =========================

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

        // must keep making lower lows
        if (
            currentLow >= previousLow
        ) {

            return false;

        }

    }

    return true;

}
