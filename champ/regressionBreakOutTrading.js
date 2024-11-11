import regression from 'regression';

/**
 * Perform regression-based breakout trading analysis.
 * @param {Object} cis - Data containing minute-wise OHLC data in 15-minute blocks.
 * @returns {boolean} - Returns true if the condition on the last two candles is met.
 */
export function regressionBreakoutTrading(cis) {
    const { minuteData } = cis;

    // Ensure we have full 15-minute blocks
    if (minuteData.length % 15 !== 0) {
 //console.log('oops',cis.tradingsymbol,cis.minuteData);
 
return false;
        //throw new Error("Data should be in completed 15-minute blocks.");
    }

    // Split minuteData into 15-minute blocks
    const blocks = [];
    for (let i = 0; i < minuteData.length; i += 15) {
        blocks.push(minuteData.slice(i, i + 15));
    }

    // Iterate over each completed 15-minute block, excluding the last one (for prediction)
    const completedBlocks = blocks.slice(0, -1);  // Exclude the incomplete block at the end
    const lastBlock = blocks[blocks.length - 1];   // Last block is the prediction block

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

        // Check conditions on penultimate and last candles in the prediction block
        const penultimateCandle = lastBlock[lastBlock.length - 2];
        const lastCandle = lastBlock[lastBlock.length - 1];
        const penultimatePrediction = predictedValues[predictedValues.length - 2];
        const lastPrediction = predictedValues[predictedValues.length - 1];



        console.log(
'penultimateCandle.close ',penultimateCandle.close, 
'penultimatePrediction.highPrediction',penultimatePrediction.highPrediction,
'lastCandle.close',lastCandle.close


        );
        
        if (
            penultimateCandle.close < penultimatePrediction.highPrediction &&
            lastCandle.close > lastPrediction.highPrediction
        ) {
            return true;
        }
    }

    return false; // Condition not met in any of the blocks
}
