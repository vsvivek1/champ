const mongoose = require('mongoose');

const tradeStrategySchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: false
  },
  tradingSymbol: {
    type: String,
    required: false
  },
  Date: {
    type: Date,
    required: false
  }, 
  
  timeOfBuy: {
    type: Date,
    required: false
  },
  buyPrice: {
    type: Number,
    required: false
  },
  quantity: {
    type: Number,
    required: false
  },
  strategyName: {
    type: String,
    required: false
  },
  sellPrice: {
    type: Number,
    required: false
  },
  sellType: {
    type: String,
    required: false
  },
  sellTime: {
    type: Date,
    required: false
  },
  pnl: {
    type: Number,
    required: false
  },
  cycleComplete: {
    type: Boolean,
    required: false
  }
});

const TradeStrategy = mongoose.model('TradeStrategy', tradeStrategySchema);

module.exports = TradeStrategy;
