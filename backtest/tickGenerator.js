

// let tick=ticks[
module.exports= function makeTick(tick,symbol){
    var instruments2=[

        {
            "tradable": true,
            "mode": "full",
            "instrument_token": symbol,
            "last_price": tick.close,
            "last_quantity": 0,
            "average_price": 0,
            "volume": 0,
            "buy_quantity": 0,
            "sell_quantity": 0,
            "ohlc": {
                "open": tick.open,
                "high": tick.high,
                "low": tick.low,
                "close": tick.close
            },
            "change": 0.9372020073268,
            "last_trade_time": tick.date,
            "timestamp": "2022-06-24T11:10:16.000Z",
            "oi": 10088050,
            "oi_day_high": 0,
            "oi_day_low": 0,
            "depth": {
                "buy": [
                    {
                        "quantity": 0,
                        "price": tick.open,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.low,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.low,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.low,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.low,
                        "orders": 0
                    }
                ],
                "sell": [
                    {
                        "quantity": tick.high,
                        "price": 0,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.high,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.high,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.high,
                        "orders": 0
                    },
                    {
                        "quantity": 0,
                        "price": tick.high,
                        "orders": 0
                    }
                ]
            }
        }
    ]



    return instruments2;
}


