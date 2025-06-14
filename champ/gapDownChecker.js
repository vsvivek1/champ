// gapDownChecker.js

// Function to check if there is a gap down of more than 30%
export function checkGapDown(cis) {

    if(!cis|| !cis.pricePoints || !cis.pricePoints.d1){

        return;
    }
    const openPrice = cis.tick.ohlc.open;
    const closePrice = cis.pricePoints.d1.close;
    
    // Calculate the percentage gap down
    const gapDownPercent = ((closePrice - openPrice) * 100) / openPrice;

    // Log the data for debugging purposes
    //console.log(cis.tradingsymbol, closePrice, cis.tick.ohlc, 'returning', gapDownPercent, '%');

    // Return true if gap down is more than 30%, otherwise false

    cis.isGapDown=gapDownPercent < -30;
    return gapDownPercent < -20;
}

// Export the function for use in other files
//module.exports = { checkGapDown };
