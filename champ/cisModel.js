// cisModel.js
import mongoose from 'mongoose';

const cisSchema = new mongoose.Schema({
    tradingSymbol: { type: String, required: true },
    buyStrategy: { type: String, required: true },
    buyQty: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    buyTime: { type: Date, required: true },
    sellType: { type: String, enum: ['target', 'stopLoss', 'manual'], default: 'target', required: true },
    sellStrategy: { type: String, required: true },
    stopLossStrategy: { type: String },
    sellQty: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    sellTime: { type: Date, required: true },
    haveLivePosition: { type: Boolean, default: false },
    holdingTime: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    targetStrategy: { type: String, required: true },
    targetPrice: { type: Number },
    hasTarget: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

// Middleware to automatically calculate holding time and profit
cisSchema.pre('save', function (next) {
    if (this.buyTime && this.sellTime) {
        this.holdingTime = Math.abs((this.sellTime - this.buyTime) / (1000 * 60)); // Minutes
    }
    if (this.sellPrice && this.buyPrice && this.sellQty) {
        this.profit = (this.sellPrice - this.buyPrice) * this.sellQty;
    }
    next();
});

const Cis = mongoose.model('Cis', cisSchema);
export default Cis;
