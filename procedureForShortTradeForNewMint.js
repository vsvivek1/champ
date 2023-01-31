module.exports = function procedureForLongTradeForNewMint(){


///ProcedureForShort if range break down

entry=true;
console.log(entryPrice,last_price,entry,
  'previous_price',previous_price)

setOrderPlacedByMint(instrument_token,true)


let p=instruments.filter(p1=>p1.instrument_token==instrument_token)[0];
//build orderarray

console.log('p',p)

let tradingsymbol = p.tradingsymbol;
// let lot_size = p.quantity;
let lot_size = 1;
let order_type = "LIMIT";
let Price = p.pricePoints.yesterday.low;
let transaction_type = "SELL";
let arr = buildOrderArray(
  tradingsymbol,
  transaction_type,

  lot_size,
  order_type,
  Price
);


console.log(arr)
//place order

}

