async  function recordTradeInMongoose(){


    const Trade = require('./models/trade');

const trade = new Trade({
  dateAndTime: new Date(),
  tradingSymbol: 'AAPL',
  instrumentToken: 12345,
  buyingPrice: 100,
  buyingTime: new Date(),
  sellingPrice: 120,
  sellingTime: new Date(),
  typeOfExit: 'Target',
  quantity: 10
});

try {
  trade.calculateProfitOrLoss();
  console.log(trade.profit);
  await trade.save();
  console.log('Trade saved to database');
} catch (error) {
  console.error(error);
}

}