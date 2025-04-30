// Utility function to update `cis` flags
export const setLastPriceStatusWithOpen = (cis) => {
    if (!cis || !cis.tick || typeof cis.tick.last_price !== "number" || !cis.tick.ohlc) {
        

        return;
        
        //throw new Error("Invalid `cis` structure or data.");
    }

    cis.isAboveOpen = cis.tick.last_price > cis.tick.ohlc.open;
    cis.isPriceLessThanOne = cis.tick.last_price < 1;


    cis.lastSeenHighForPosition = Math.max(cis.tick.last_price, cis.lastSeenHighForPosition);
    cis.lastSeenHigh = Math.max(cis.tick.last_price, cis.lastSeenHigh);

    // Calculate current profit
    let prof = cis.lot_size * cis.tick.last_price;
    cis.highestProfit = Math.max(prof, cis.highestProfit);

    cis.oi=cis.tick


    cis.buyStrategy = 'nil';
    cis.targetPrice = 'nil'
    cis.stopLossPrice = 'nill'
    cis.inbuiltTarget = false
    cis.inbuiltStopLoss = false

  //  return cis;
};
