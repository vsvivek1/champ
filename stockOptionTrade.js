
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


const path = require('path');
const scriptDirectory  = __dirname
const FILE_LOCATION  =  path.join( scriptDirectory);
const fs = require('fs').promises;

const spreadPercentageThreshold=.5;; // 0.5%

var margin;

let scripts1=[];

let targetPc=1.2; // target at 150% of opening range

let targetType="pc"

var hour,minute,second;


async function clock(){


  setInterval(()=>{

    let date=new Date()
    hour=date.getHours();
    minute= date.getMinutes()
    second=date.getSeconds()



  },1000)
}

 async function setHasPositionFlag(kite){
  try {

   let scripts=scripts1;
      const positions = await kite.getPositions();
      const netPositions = positions.net;

     scripts1.forEach(s => (s.hasPosition = false));

// mark scripts that actually have positions
netPositions.forEach(pos => {

  //s.alreadyTraded=true;
  

  const script = scripts1.find(
    s => s.tradingsymbol === pos.tradingsymbol
  );

script.alreadyTraded=true;
  if (pos.quantity === 0) return;
  if (script) {
    script.hasPosition = true;
  }
});
      console.log("✅ Position check completed.");
    } catch (err) {
      console.error("❌ Error checking positions:", err.message || err);
    }
  }

  async function setHasReverseOrderFlag(kite){

    try {

     let scripts=scripts1;
        const orders = await kite.getOrders();
  
        scripts1.forEach(script => {
          const order = orders.find(pos => pos.tradingsymbol === script.tradingsymbol && pos.status=="OPEN" && pos.transaction_type=="SELL");
          script.hasReverseOrder = order !=undefined;
        });
  
        console.log("✅ Reverse Order check completed.");
      } catch (err) {
        console.error("❌ Error checking Reverse orders:", err.message || err);
      }  
  }


  async function placeMissingReverseOrders(kite){
    try {

      let orders=await kite.getOrders();
      var latestOrder=false;


     let scripts=scripts1;
        for(const script of scripts1) {
          if(script.hasPosition 
            
            && !script.hasReverseOrder
            
            // && script.buyOrderCompleted && !script.sellOrderPlaced




          ) {


            // orders.filter(o=>o.tradingsymbol==script.tradingsymbol && o.transaction_type=="BUY").forEach(o=>{
            //   console.log("Found existing buy order ",script.tradingsymbol," Order ID:",o)}
            // );



       


           
            if(!script.target || script.target == undefined|| script.target==null || isNaN(script.target) ) {

              script.target=(script.target==0)?(Math.max(script.quote.last_price*1.5,.5)):script.quote.upper_circuit_limit*.9;
              //console.error(`❌ Cannot place Reverse Sell Order for ${script.tradingsymbol} as target price is undefined.`);
              //continue;
            }


     if(targetType=="pc"){

             latestOrder = orders.filter(o=>o.tradingsymbol==script.tradingsymbol && o.transaction_type=="BUY" && o.status=="COMPLETE").reduce((latest, current) =>
  current.order_timestamp > latest.order_timestamp ? current : latest
);


console.log("latest order for ",script.tradingsymbol,latestOrder,targetType)

            if(latestOrder){  

              script.buyPrice=latestOrder.price
              script.target= Math.ceil(latestOrder.average_price*targetPc / 0.05) * 0.05;

            }

          }


            ///
             console.log(`Placing missing Reverse Sell Order for ${script.tradingsymbol}..Price=.`,script.target,latestOrder,"lo");
            try {
              const orderId = await kite.placeOrder("regular", {
                exchange: script.exchange,                 // NSE | NFO | BSE
                tradingsymbol: script.tradingsymbol,
                transaction_type: "SELL",         // BUY | SELL
                quantity: script.lot_size*1,                    // lot size × lots
                order_type: "LIMIT", 
                price: script.target,           // MARKET | LIMIT | SL | SL-M
                product: "NRML",                  // MIS | NRML | CNC
                validity: "DAY"
              });
  
              script.sellOrderPlaced = true;
              console.log(`✅ Reverse Sell Order placed for ${script.tradingsymbol}. Order ID:`, orderId.order_id);
            } catch (err) {
              console.error(`❌ Reverse Sell Order placement failed for ${script.tradingsymbol}:`, err.message || err);
            }
          }
        }
  
        console.log("✅ Missing Reverse Orders check completed.");
      } catch (err) {
        console.error("❌ Error placing missing Reverse orders:", err.message || err);
      }     


  }
async function startTimer(kite) {


 

  setInterval(async () => {
    await setHasPositionFlag(kite);
    await setHasReverseOrderFlag(kite );

    await placeMissingReverseOrders(kite);

    console.log("Timer tick - checking positions");
 margin=await kite.getMargins();
  
  }, 5 * 60 * 1000); // every 5 minutes 
}

async function writeJsonToFile(jsonData, fileName) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty formatting

        // Write JSON string to file
        await fs.writeFile(fileName, jsonString);

        

        //console.log('JSON data has been written to', fileName);

      

        return;
    } catch (err) {
        console.error('Error writing JSON to file:', err);

        return;
    }
}
async function readTodayJsonFile(filePath) {
  try {
    // const today = new Date().toISOString().split("T")[0];
    // const filePath = `${FILE_LOCATION}/stockOption_${today}.json`;

    const data = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(data);

    console.log(`✅ Loaded ${json.length} records from ${filePath}`);
    return json;

  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("❌ Today's JSON file not found");
    } else {
      console.error("❌ Error reading JSON file:", err);
    }
    return false
  }
}
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function startTicker(ticker,kite) {


  let scripts=scripts1;
  ticker.on("order_update", async orderUpdate => {

     let cis=scripts1.find(s=>parseInt(s.instrument_token)==orderUpdate .instrument_token)


if(!cis) return;


if(orderUpdate.status=="COMPLETE " &&orderUpdate.transaction_type=="SELL" && !cis.sellOrderCompleted){

  cis.sellOrderCompleted =true
  console.log("Sell order completed for ",cis.tradingsymbol)
  return;

}

if(orderUpdate.status=="COMPLETE" && orderUpdate.transaction_type=="BUY" && !cis.buyOrderCompleted){
  cis.buyOrderCompleted =true

      if(targetType=="pc"){
          let orders=await kite.getOrders();

            const latestOrder = orders.filter(o=>o.tradingsymbol==cis.tradingsymbol && o.transaction_type=="BUY" && o.status=="COMPLETE").reduce((latest, current) =>
  current.order_timestamp > latest.order_timestamp ? current : latest
);


            if(latestOrder){  
              cis.target= Math.ceil(latestOrder.average_price*targetPc / 0.05) * 0.05;

            }{

              console.log("Setting target for ",cis.tradingsymbol," at ",cis.target, "ERROR chec k line 297")
            }

          }

kite.placeOrder("regular", {
      exchange: cis.exchange,                 // NSE | NFO | BSE
      tradingsymbol: cis.tradingsymbol,
      transaction_type: "SELL",         // BUY | SELL
      quantity: cis.lot_size*1,                    // lot size × lots
      order_type: "LIMIT", 
      price: cis.target,           // MARKET | LIMIT | SL | SL-M
      product: "NRML",                  // MIS | NRML | CNC
      validity: "DAY"
    }).then(orderId=>{

      cis.sellOrderPlaced=true
      console.log("✅ Sell Order placed. Order ID:", orderId);
    }).catch(err=>{
      cis.sellOrderPlaced=false;
      console.error("❌ Sell Order placement failed:", err.message || err);
    }); 


}else if(orderUpdate.status=="REJECTED"){

  // console.log(orderUpdate,"order update")
  // console.log(cis,"cis in rejected")
 cis.buyOrderCompleted =true
}



   // console.log("🔄 Order Update:", orderUpdate.status_message,orderUpdate.tradingsymbol);
  });

  let multiplier=1
  ticker.on("connect", () => {
    console.log("🟢 Kite Ticker connected");

    const tokens = scripts
      .map(s => parseInt(s.instrument_token))
      .filter(Boolean);

      

    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeFull, tokens);

    console.log("📡 Subscribed tokens:", tokens.length);
  });

  ticker.on("ticks", async ticks=> {
   
    ticks.forEach(async tick  => {

  


  let slExeCutionPrice=tick.depth.buy[0].price;

  let lowestOfferToSell=tick.depth.sell[0].price;





  let cis=scripts1.find(s=>parseInt(s.instrument_token)===tick.instrument_token)
  if(!cis) {
    console.log('no cis line 370');

return;
  }


 let priceAtNineThirty=cis.quote.ohlc.high /// main entry for buy order
let allDayHigh=tick.ohlc.high;
  


  if(cis.hasPosition){

    cis.highestSinceBuy= Math.max(cis.highestSinceBuy ||0,tick.last_price)

   if(new Date().getSeconds() % 30 === 0){

console.log("has position, skipping buy order for ",cis.tradingsymbol,"target=",cis.target, "last price=",tick.last_price, "stopLoss=",cis.stopLoss,"open=",tick.ohlc.open,"best offer= ",tick.depth.buy[0].price)

   }

 

if(

  (tick.last_price<allDayHigh*.89 && !cis.stopLossTriggered) ||  //intraday momentum stop loss at 12% below high of the day

  (cis.highestSinceBuy>tick.last_price*1.05 && !cis.stopLossTriggered) ||  //trailing stop loss at 5% below highest since buy

  (tick.depth.buy[0].price<priceAtNineThirty*0.9 && !cis.stopLossTriggered) ||
  
  (slExeCutionPrice<=cis.stopLoss && !cis.stopLossTriggered) || 
  (slExeCutionPrice<tick.ohlc.open && !cis.stopLossTriggered  ) ||
   (slExeCutionPrice<cis.buyPrice*.95 && !cis.stopLossTriggered  ) 

)
  
  
  {
  
  //the stop loss condtion


  cis.stopLossTriggered=true;

if(slExeCutionPrice<tick.ohlc.open ){
  console.log("Stoploss triggered for ",cis.tradingsymbol," at price ",tick.last_price," as price dropped below 90% of open price ",tick.ohlc.open);
}

if(slExeCutionPrice<=cis.stopLoss ){
  console.log("Stoploss triggered for ",cis.tradingsymbol," at price ",tick.last_price," as price dropped below inbuild stoploss ",cis.stopLoss);
}




  
if(!cis.buyOrderId)

  {
  cis.buyOrderId=await kite.getOrders().then(orders=>{
    let openBuyOrder=orders.find(o=>o.tradingsymbol==cis.tradingsymbol && o.status=="OPEN" && o.transaction_type=="SELL")
    return openBuyOrder?openBuyOrder.order_id:null;
  }).catch(err=>{
    console.error("❌ Error fetching orders for stoploss:", err.message || err);
    return null;
  });

  }
 
let modified= await kite.modifyOrder("regular", cis.buyOrderId, {
    price: slExeCutionPrice,
  
  }).then(modifiedOrder=>{
    console.log("✅ Stoploss Sell Order modified for ",cis.tradingsymbol," New Price=",tick.last_price);
    return modifiedOrder;
  }).catch(err=>{
    console.error("❌ Stoploss Sell Order modification failed for ",cis.tradingsymbol,":", err.message || err);
    return null;
  });

  return;

}

////has Position block ends here
  return;
}

if(new Date().getHours()>9){

  //// no trade after 10 

  return;

}



if(cis.alreadyTraded){

//console.log("Already traded once today, skipping buy order for ",cis.tradingsymbol)
  return;
}


if(tick.last_price<allDayHigh*.95){ 
//console.log("Skipping ",cis.tradingsymbol," as price below 95% of days high . LTP=",tick.last_price," High=",allDayHigh)

//filter to remove high spread scripts    //
return;
}


if((tick.depth.sell[0].price- tick.depth.buy[0].price)/tick.depth.sell[0].price*100>spreadPercentageThreshold){
 // console.log("High spread for ",cis.tradingsymbol," skipping buy order. Spread%=",((tick.depth.sell[0].price- tick.depth.buy[0].price)/tick.depth.sell[0].price*100).toFixed(2)) ;
  return;
}


if(lowestOfferToSell<1 || tick.last_price<1){

 console.log("LTP less than 1 rs   ",cis.tradingsymbol," skipping buy order. LTP=",tick.last_price," Open=",tick.ohlc.open,"lowestOfferToSell=",lowestOfferToSell)
  return;
}


let availableMargin=margin.equity.net;;





  if(tick.ohlc.high>=lowestOfferToSell*2){  
   console.log("Last Skipping ",cis.tradingsymbol," as price surged double from open price. LTP=",lowestOfferToSell," High=",tick.ohlc.high)
 
    //filter to remove high spread scripts
    return
}


//priceAtNineThirty
 if(lowestOfferToSell>=tick.ohlc.open*1.2){  
   console.log("Last Skipping ",cis.tradingsymbol," as price surged is 20 %away from entry point of 930 . LTP=",lowestOfferToSell," High=",tick.ohlc.high)
 
   ///not a filter. /// use as an entry signal;
    return
}

if(lowestOfferToSell*cis.lot_size>availableMargin){
 console.log( "Insufficient margin to place order for ",cis.tradingsymbol," Required:",tick.last_price*cis.lot_size," Available:",availableMargin)
  return;
}

  // console.log("spread for ",cis.tradingsymbol," skipping buy order. Spread%=",((tick.depth.sell[0].price- tick.depth.buy[0].price)/tick.depth.sell[0].price*100).toFixed(2),"%") ;


//// filter out gap down
if(tick.ohlc.open>=lowestOfferToSell){

 console.log("LTP less than open price for ",cis.tradingsymbol," skipping buy order. LTP=",tick.last_price," Open=",tick.ohlc.open)
  return;
}


if(tick.ohlc.open<tick.last_price) ///passed filter then buy

  //if(lowestOfferToSell>=priceAtNineThirty && !cis.ordered && !cis.buyOrderCompleted && !cis.hasPosition )
    
    {


    cis.orderd=true;

  try {
    const orderId = await kite.placeOrder("regular", {
      exchange: cis.exchange,                 // NSE | NFO | BSE
      tradingsymbol: cis.tradingsymbol,
      transaction_type: "BUY",         // BUY | SELLgAndhi@2108
      quantity: cis.lot_size*multiplier,                    // lot size × lots
      order_type: "LIMIT", 
      price: lowestOfferToSell,           // MARKET | LIMIT | SL | SL-M
      product: "NRML",                  // MIS | NRML | CNC
      validity: "DAY"
    });

   // console.log("✅ Order placed. Order ID:", orderId);

    cis.orderPlacementSuccess=true
    return orderId;

  } catch (err) {
    cis.ordered=true
    cis.orderPlacementSuccess=false;
    console.error("BUY ❌ Order placement failed:", err.message || err,cis.tradablesymbol);
    return null;
  }
    console.log("Order placed for:", cis.tradingsymbol);
    cis.ordered = true;
  }
      
  // console.log(
  //       `📈 ${tick.instrument_token} | LTP: ${tick.last_price} | OI: ${tick.oi}`,cis.tradingsymbol,cis.quote.last_price
  //     );


    });
  });

  
  ticker.on("disconnect", reason => {
    console.log("🔴 Ticker disconnected:", reason);
  });

  ticker.on("error", err => {
    console.error("❌ Ticker error:", err);
  });

  ticker.on("reconnect", attempt => {
    console.log("🔁 Reconnecting... Attempt:", attempt);
  });

  ticker.connect();
}




async function main(){
clock();
  if(new Date().getHours()>=15){
    console.log("Market closed, exiting.");
    return;
  }

  //  if(new Date().getHours()==9 && new Date().getMinutes()<30){
  //   console.log("not opened.");
  //   return;
  // }

     let today = new Date().toISOString().split('T')[0];
  let todayFile = `${scriptDirectory}/stockOption_${today}.json`;

  console.log("Today's file path:", todayFile);

     await connectToDatabase()
let accesstoken=await getTodaysAccessToken();

let kite=await getKiteConnectInstance(accesstoken);
let kiteTicker=await getTickerInstance (accesstoken);
 margin=await kite.getMargins();


//console.log(    "access token in stockOption.js",kiteTicker)

  // 🔴 EARLY EXIT
  if (await fileExists(todayFile)) {
    scripts1=await readTodayJsonFile(todayFile);
    console.log(`✅ File already exists for today: ${todayFile}`);
 await setHasPositionFlag(kite);
    await setHasReverseOrderFlag(kite);

    await placeMissingReverseOrders(kite);

   
    startTicker(kiteTicker,kite);

    startTimer(kite);

   // console.log("⏭️ Skipping execution.");
    return;
  }

  // ==============================
  // NORMAL FLOW STARTS HERE
  // ==============================


 

let j=await downLoadAllInstrumentsAndReturnJson(accesstoken);

let month=new Date().getMonth()+1;
month=1;
let scripts=j.filter(item=>item.expiry.includes(`-0${month}-`)&&item.exchange=="NFO" && item.segment.includes("OPT"    ))    ;

let stocks=scripts.map(item=>item.name).filter(i=>i!=   "NIFTY" && i!="BANKNIFTY"  ).
filter((value, index, self) => self.indexOf(value) === index).map(item=>"NSE:"+item);  ;


console.log(stocks,"stocksat line 383")
//  stocks = [
//   "NSE:RELIANCE",
//   "NSE:TCS",
//   "NFO:BANKNIFTY25JAN45000CE"
// ];

//console.log(stocks)
let quotes= await kite.getQuote(stocks)

let step=1;;

let tradables=[]

let loop=0;
let symbolQuotes=[];

stocks.forEach(async stockItem =>{

  let stockData=quotes[stockItem];

 
  if(stockData==undefined|| stockData=={}) return;


  let price=stockData.last_price
   let pe=scripts.filter(item=>item.strike<=price && item.instrument_type=="PE" &&item.name==stockItem.split(":")[1]).sort((a,b)=>b.strike-a.strike)[0];

    let ce=scripts.filter(item=>item.strike>=price && item.instrument_type=="CE" &&item.name==stockItem.split(":")[1]).sort((a,b)=>a.strike-b.strike)[0];
symbolQuotes.push(pe);
   symbolQuotes.push(ce);
   tradables.push("NFO:"+ce.tradingsymbol);
   tradables.push("NFO:"+pe.tradingsymbol);
  // console.log(stockItem,pe.tradingsymbol,pe.strike,stockData.last_price,ce.strike);


});

     let pos  = await kite.getPositions();

pos.net.forEach(position=>{
  let ts=position.tradingsymbol;
  if(!tradables.find(i=>i=="NFO:"+ts)){
    tradables.push("NFO:"+ts);
    console.log("Adding existing missing symbol in  position to  tradable:",ts)
  }
});


///get posiions and push to tradables if not present 


let tradebleQuotes= await kite.getQuote(tradables)
//console.log("Tradables:",tradebleQuotes );
//c//onsole.log("in stockOption.js , json data length=",quotes);

let finalScripts=[];

tradables.forEach(item=>{

  let script=  scripts.find(i=>"NFO:"+  i.tradingsymbol==item);
  if(!script) return;
  script.tickSymbol=item;

  //let tick=stock.quote;
  script.quote=tradebleQuotes[item];

  if(!script.quote){
    console.error("❌ No quote data for ",item);
    return;
  }

 script.openingRange=script.quote.ohlc.high - script.quote.ohlc.low
  script.target=script.quote.ohlc.high + script.openingRange
  script.stopLoss=script.quote.ohlc.low - script.openingRange

  finalScripts.push(script);

   // console.log("Processing item:",item,script)

    return
   
   // console.log(`Option: ${item}  Last Price: ${data.last_price}  OI: ${data.open_interest}  Change in OI: ${data.change_in_open_interest}`)
}
);

     
let fileName = `${FILE_LOCATION}/stockOption_${today}.json`;
writeJsonToFile(finalScripts    , fileName)
writeJsonToFile(finalScripts    , `${FILE_LOCATION}/stockOption_latest.json`)


//startTicker(ticker,kite) 
  await closeDatabaseConnection()
}



main()
