import mongoose from 'mongoose';

const cisSchema = new mongoose.Schema({
    tradingSymbol: { type: String, required: true },
    buyStrategy: { type: String },
    buyQty: { type: Number },
    buyPrice: { type: Number },
    buyTime: { type: Date },
    sellType: { type: String, enum: ['target', 'stopLoss', 'manual'], default: 'target' },
    sellStrategy: { type: String },
    stopLossStrategy: { type: String },
    sellQty: { type: Number },
    sellPrice: { type: Number },
    sellTime: { type: Date },
    haveLivePosition: { type: Boolean, default: false },
    holdingTime: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    targetStrategy: { type: String },
    targetPrice: { type: Number },
    hasTarget: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

// Middleware to calculate holding time and profit when both buy and sell fields are available
cisSchema.pre('save', function (next) {
    if (this.buyTime && this.sellTime) {
        this.holdingTime = Math.abs((this.sellTime - this.buyTime) / (1000 * 60)); // Minutes
    }
    if (this.sellPrice && this.buyPrice && this.sellQty) {
        this.profit = (this.sellPrice - this.buyPrice) * this.sellQty;
    }
    next();
});

const Cis = mongoose.models.Cis || mongoose.model('Cis', cisSchema);
export default Cis;
