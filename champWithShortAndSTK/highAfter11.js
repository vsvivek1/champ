export const highAfter11AM = (cis) => {
    const maxLength = 105; // Number of minutes from 9:15 to 11:00

    // Check if the length of minuteData is greater than 105
    if (cis.minuteData.length > maxLength) {
        // Remove the first 105 entries
        cis.minuteData.splice(0, maxLength);
    }

    // Find the highest and lowest points after removing entries
    let highest = -Infinity;
    let lowest = Infinity;

    cis.minuteData.forEach((candle) => {
        if (candle.high > highest) {
            highest = candle.high;
        }
        if (candle.low < lowest) {
            lowest = candle.low;
        }
    });

    return {
        highest,
        lowest,
    };
};
