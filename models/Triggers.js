const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  tradingsymbol: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  exitPrice: { type: Number, required: true },
  entryType: { type: String, enum: ['short', 'long'], required: true },
  exitType: { type: String,enum: ['target', 'stopLoss'], required: true },
  sellTime: { type: Date, required: true },
  triggerName: { type: String, required: true }
});

// Calculate pnl based on entryPrice and exitPrice
triggerSchema.virtual('pnl').get(function() {
  const pnlMultiplier = this.entryType  == 'short' ? -1 : 1;
  return pnlMultiplier * (this.exitPrice - this.entryPrice);
});

const Trigger = mongoose.model('Trigger', triggerSchema);

module.exports = Trigger;
