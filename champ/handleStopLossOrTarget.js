// handleStopLossOrTarget.js
import Cis from './cisModel.js';

export const handleStopLossOrTarget = async (tradingSymbol, sellPrice, sellType, sellStrategy, stopLossStrategy = null) => {
    try {
        // Find the CIS document by tradingSymbol and haveLivePosition
        const cis = await Cis.findOne({ tradingSymbol, haveLivePosition: true });
        if (!cis) {



            return;
            //throw new Error(`CIS document with trading symbol ${tradingSymbol} not found or no live position.`);
        }

        // Automatically set sellQty to the buyQty since the assumption is that they are the same
        cis.sellQty = cis.buyQty;
        cis.sellPrice = sellPrice;
        cis.sellTime = new Date();
        cis.sellType = sellType;
        cis.sellStrategy = sellStrategy;
        if (stopLossStrategy) {
            cis.stopLossStrategy = stopLossStrategy;
        }

        // Mark the position as closed
        cis.haveLivePosition = false;

        // Save the updated CIS document
        await cis.save();
       // console.log('Stop loss or target achieved:', cis);
        return cis;
    } catch (error) {
        console.error('Error handling stop loss or target:', error);
        return;
        //throw error;
    }
};
