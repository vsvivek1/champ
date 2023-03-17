const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  dateAndTime: {
    type: Date,
    required: true
  },
  tradingSymbol: {
    type: String,
    required: true
  },
  instrumentToken: {
    type: Number,
    required: true
  },
  buyingPrice: {
    type: Number
  },
  buyingTime: {
    type: Date
  },
  strategy: {
    type: String
  },
  sellingPrice: {
    type: Number
  },
  sellingTime: {
    type: Date
  },
  typeOfExit: {
    type: String
  },
  profit: {
    type: Number
  },
  quantity: {
    type: Number,
    required: true
  }
});

tradeSchema.methods.calculateProfitOrLoss = function() {
  if (this.buyingPrice && this.sellingPrice && this.quantity) {
    const cost = this.buyingPrice * this.quantity;
    const revenue = this.sellingPrice * this.quantity;
    const pnl = revenue - cost;
    this.profit = pnl;
  } else {
    throw new Error('Unable to calculate profit or loss for this trade');
  }
};

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
