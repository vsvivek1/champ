// module.exports=
function 

getTickgenerator(instruments){



var random_sign = Math.random() - 0.5;

var randomTickNumber=(Math.random()*10*.05).toFixed(2)


instruments.forEach(e=>{
    var tick=random_sign*randomTickNumber*e.last_price*.001
e.last_price=e.last_price+tick
// console.log('tick',tick)
})

// 
return instruments




}


setInterval(()=>{

  let tick=getTickgenerator(instruments2)

  console.log('tick',tick[0].last_price)

},500)

var instruments2=[

    {
        "tradable": true,
        "mode": "full",
        "instrument_token": 14523906,
        "last_price": 15718.9,
        "last_quantity": 0,
        "average_price": 0,
        "volume": 0,
        "buy_quantity": 0,
        "sell_quantity": 0,
        "ohlc": {
            "open": 15650.1,
            "high": 15748,
            "low": 15611,
            "close": 15572.95
        },
        "change": 0.9372020073268,
        "last_trade_time": "2022-06-24T09:59:59.000Z",
        "timestamp": "2022-06-24T11:10:16.000Z",
        "oi": 10088050,
        "oi_day_high": 0,
        "oi_day_low": 0,
        "depth": {
            "buy": [
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                }
            ],
            "sell": [
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                },
                {
                    "quantity": 0,
                    "price": 0,
                    "orders": 0
                }
            ]
        }
    }
]