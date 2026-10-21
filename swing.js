
/*

tods:

1. pick posistion and set the flag hasPosition=true or fase;
2. corect the strike selection logic
3. check the spread before placing order
4. place target if not placed

5. once traded dont trade again
6. below 1 rs no trade
7. no trade below open
8.

*/

console.log("🚀 stockOptionTrade starting", new Date().toISOString());
console.log("CWD:", process.cwd());

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED PROMISE REJECTION');
  console.error('Reason:', reason);
  console.error('Promise:', promise);

  if (reason instanceof Error) {
    console.error(reason.stack);
  } else {
    console.error(JSON.stringify(reason, null, 2));
  }
});

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION');
  console.error(err.stack || err);
});

const { get } = require('mongoose');
const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const { getKiteConnectInstance,getTickerInstance } = require('./getKiteConnectInstance.js');
const dayjs = require("dayjs");

const path = require('path');
const scriptDirectory  = __dirname
const FILE_LOCATION  =  path.join( scriptDirectory);
const fs = require('fs').promises;
var margin;

var tgt=.3
var trasanction_price=0;


main();
async function main(){


      await connectToDatabase()
    let accesstoken=await getTodaysAccessToken();
    
    let kite=await getKiteConnectInstance(accesstoken);
    let ticker=await getTickerInstance (accesstoken);
     margin=await kite.getMargins();
     
    // console.log("Margin data ",ticker)
    ticker.connect();
 ticker.on("connect", () => {
    console.log("🟢 Kite Ticker connected");})
     ticker.on("ready", () => {
        console.log("Ticker is ready");
      });
    

      // let tokens=[256265]
      //   ticker.subscribe(tokens);
        
    //ticker.setMode(ticker.modeFull, tokens);

    ticker.on("order_update", async orderUpdate => {

      //  console.log("🔔 Order Update:", orderUpdate)    ;

    let { instrument_token, status, transaction_type, tradingsymbol, quantity,price,average_price } = orderUpdate;

    if (status != "COMPLETE") {
        return;
    }


    if(transaction_type==="SELL"){

        trasanction_price=average_price-tgt;
    }else{
        trasanction_price=average_price+tgt;


    }
    const today = dayjs().format("YYYY-MM-DD");

    var from = `${today} 09:15:00`;
    const to = `${today} 15:30:00`;

    try {

        let historicalData = await kite.getHistoricalData(
            instrument_token,
            "minute",
            from,
            to,
            false,
            true
        );

        let lastThreeCandles = historicalData.slice(-3);

        let lowOfLastThreeCandles = Math.min(
            ...lastThreeCandles.map(c => c.low)
        );

        console.log(
            `Low of last three candles for ${tradingsymbol}: ${lowOfLastThreeCandles}`
        );

        let stopLossTriggerPrice = lowOfLastThreeCandles;

        let stopLossPrice =
            Math.round(stopLossTriggerPrice * 0.95 / 0.05) * 0.05;

        // let slOrder = await kite.placeOrder("regular", {
        //     exchange: "NFO",
        //     tradingsymbol: tradingsymbol,
        //     transaction_type:
        //         transaction_type === "BUY" ? "SELL" : "BUY",
        //     quantity: quantity,
        //     order_type: "SL",
        //     price: stopLossPrice,
        //     trigger_price: stopLossTriggerPrice,
        //     product: "NRML",
        //     validity: "DAY"
        // });


             let slOrder = await kite.placeOrder("regular", {
            exchange: "NFO",
            tradingsymbol: tradingsymbol,
            transaction_type:
                transaction_type === "BUY" ? "SELL" : "BUY",
            quantity: quantity,
            order_type: "LIMIT",
            price: trasanction_price,
         
            product: "NRML",
            validity: "DAY"
        });

        console.log(
            `Stop-loss order placed for ${tradingsymbol}. Order ID: ${slOrder}`
        );

    } catch (error) {

        console.log(error);

    }

}); // <- THIS was wrong

} // <- closes main()

