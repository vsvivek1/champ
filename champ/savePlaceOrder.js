// savePlaceOrder.js
import Cis from './cisModel.js';

export const savePlaceOrder = async (tradingSymbol, buyStrategy, buyQty, buyPrice, targetStrategy) => {
    try {
        const buyTime = new Date();
        const cis = new Cis({
            tradingSymbol,
            buyStrategy,
            buyQty,
            buyPrice,
            buyTime,
            haveLivePosition: true,
            targetStrategy,
            hasTarget: false // Initially set to false
        });

        const savedOrder = await cis.save();
        console.log('Order saved successfully:', savedOrder);
        return savedOrder;
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
};
