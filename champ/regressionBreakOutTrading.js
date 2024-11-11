import regression from 'regression';

/**
 * Perform regression-based breakout trading analysis.
 * @param {Object} cis - Data containing minute-wise OHLC data in 15-minute blocks.
 * @returns {boolean} - Returns true if the condition on the last two candles is met.
 */
export function regressionBreakoutTrading(cis) {
    const { minuteData } = cis;

    // Take only the number of candles that are divisible by 15
    const fullCandlesData = minuteData.slice(0, Math.floor(minuteData.length / 15) * 15);

    // Ensure we have at least one 15-minute block
    if (fullCandlesData.length < 15) {
        console.log('Insufficient data for', cis.tradingsymbol);
        return false; // Data is not sufficient for analysis
    }

    // Split into 15-minute blocks
    const blocks = [];
    for (let i = 0; i < fullCandlesData.length; i += 15) {
        blocks.push(fullCandlesData.slice(i, i + 15));
    }

    // Identify the last full 15-minute block as the required block for prediction
    const completedBlocks = blocks.slice(0, -1);  // All but the last block
    const lastBlock = blocks[blocks.length - 1];  // The final full 15-minute block for prediction

    // Check if the lastBlock has at least two candles (this should always be true in this setup)
    if (lastBlock.length < 2) {
        console.log('Insufficient candles in last block for prediction in', cis.tradingsymbol);
        return false;
    }

    for (const block of completedBlocks) {
        // Prepare data points for regression
        const highs = block.map((candle, index) => [index + 1, candle.high]);
        const lows = block.map((candle, index) => [index + 1, candle.low]);

        // Calculate regression lines for the highs and lows
        const highRegression = regression.linear(highs);
        const lowRegression = regression.linear(lows);

        // Predict values for each minute in the next (last) block
        const predictedValues = lastBlock.map((_, minuteIndex) => {
            const x = minuteIndex + 1 + 15; // Shift x by 15 for the next block
            return {
                highPrediction: highRegression.predict(x)[1],
                lowPrediction: lowRegression.predict(x)[1]
            };
        });

        // Get the penultimate and last candle in the last block
        const penultimateCandle = lastBlock[lastBlock.length - 2];
        const lastCandle = lastBlock[lastBlock.length - 1];
        const penultimatePrediction = predictedValues[predictedValues.length - 2];
        const lastPrediction = predictedValues[predictedValues.length - 1];

        console.log(
            'penultimateCandle.close:', penultimateCandle.close, 
            'penultimatePrediction.highPrediction:', penultimatePrediction.highPrediction,
            'lastCandle.close:', lastCandle.close,
            'lastPrediction.highPrediction:', lastPrediction.highPrediction
        ); 

        // Check if penultimate and last candle conditions are met
        if (
            penultimateCandle.close < penultimatePrediction.highPrediction &&
            lastCandle.close > lastPrediction.highPrediction
        ) {
            return true;
        }
    }

    return false; // Condition not met in any of the blocks
}
