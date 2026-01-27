
/*

tods:

1. pick posistion and set the flag hasPosition=true or fase;
2. corect the strike selection logic
3. check the spread before placing order
4. place target if not placed



*/


const { get } = require('mongoose');
const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const { getKiteConnectInstance,getTickerInstance } = require('./getKiteConnectInstance.js');


const path = require('path');
const scriptDirectory  =  path.dirname( process.argv[1] );
const FILE_LOCATION  =  path.join( scriptDirectory);
const fs = require('fs').promises;

const spreadPercentageThreshold=0.5; // 0.5%

let scripts1=[];








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


async function main(){

     let today = new Date().toISOString().split('T')[0];
  let todayFile = `${FILE_LOCATION}/stockOption_${today}.json`;

     await connectToDatabase()
let accesstoken=await getTodaysAccessToken();

let kite=await getKiteConnectInstance(accesstoken);
let kiteTicker=await getTickerInstance (accesstoken);


//console.log(    "access token in stockOption.js",kiteTicker)

  // 🔴 EARLY EXIT
  if (await fileExists(todayFile) && false) {
    scripts1=await readTodayJsonFile(todayFile);



    console.log(`✅ File already exists for today: ${todayFile}`);
 
    return;
  }

  // ==============================
  // NORMAL FLOW STARTS HERE
  // ==============================


 

let j=await downLoadAllInstrumentsAndReturnJson(accesstoken);

let month=new Date().getMonth()+1;
let year=new Date().getFullYear();
month=1;
let scripts=j.filter(item=>item.expiry.includes(`-0${month}-`)&&item.exchange=="NFO" && item.segment.includes("OPT"    ))    ;


console.log("Total option scripts for month ",month,":",scripts.length);

let stocks=scripts.map(item=>item.name).filter(i=>i!=   "NIFTY" && i!="BANKNIFTY"  ).
filter((value, index, self) => self.indexOf(value) === index).map(item=>"NSE:"+item);  ;


console.log(stocks.length,"stocksat line 383")




//  stocks = [
//   "NSE:RELIANCE",
//   "NSE:TCS",
//   "NFO:BANKNIFTY25JAN45000CE"
// ];

//console.log(stocks)
let quotes= await kite.getQuote(stocks)

if(!quotes){
  console.error("❌ No quotes fetched, exiting.");
  return;
} 

console.log("Quotes fetched for stocks",Object.keys(quotes).length);

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



   await closeDatabaseConnection()
}



main()
