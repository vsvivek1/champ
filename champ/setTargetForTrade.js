// setTargetForTrade.js
import Cis from './cisModel.js';

export const setTargetForTrade = async (tradingSymbol, targetPrice, targetStrategy) => {
    try {
        const cis = await Cis.findOne({ tradingSymbol, haveLivePosition: true, hasTarget: false });
        if (!cis) {
            throw new Error(`Active trade with trading symbol ${tradingSymbol} not found or already has a target.`);
        }

        cis.targetPrice = targetPrice;
        cis.targetStrategy = targetStrategy;
        cis.hasTarget = true;

        await cis.save();
        console.log(`Target set for trade ${tradingSymbol}:`, cis);
        return cis;
    } catch (error) {
        console.error('Error setting target for trade:', error);
        throw error;
    }
};
