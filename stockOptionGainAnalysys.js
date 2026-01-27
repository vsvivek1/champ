
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

function extractTickSymbols(instruments) {
  return instruments
    .map(i => i.tickSymbol)
    .filter(Boolean);
}
async function fetchFreshQuotes(kite, tickSymbols) {

  // Kite allows max ~500 symbols per request → batch it
  const BATCH = 400;
  let allQuotes = {};

  for (let i = 0; i < tickSymbols.length; i += BATCH) {
    const batch = tickSymbols.slice(i, i + BATCH);
    const quotes = await kite.getQuote(batch);
    allQuotes = { ...allQuotes, ...quotes };
  }

  return allQuotes; // object keyed by tickSymbol
}
function attachFinalQuotes(instruments, quotes) {
  return instruments.map(i => ({
    ...i,
    finalQuote: quotes[i.tickSymbol] || null
  }));
}
function getTopGainersVsClose(instruments, topN = 10) {

  return instruments
    .filter(i => i.finalQuote && i.finalQuote.ohlc && i.finalQuote.last_price > 0)
    .map(i => ({
      tickSymbol: i.tickSymbol,
      tradingsymbol: i.tradingsymbol,
      last: i.finalQuote.last_price,
      close: i.finalQuote.ohlc.close,
      gain: i.finalQuote.last_price - i.finalQuote.ohlc.close,
      pct: ((i.finalQuote.last_price - i.finalQuote.ohlc.close) / i.finalQuote.ohlc.close) * 100,
      volume: i.finalQuote.volume,
      oi: i.finalQuote.oi
    }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, topN);
}
function getHighBreakInstruments(instruments) {
  return instruments.filter(i =>
    i.quote &&
    i.finalQuote &&
    i.quote.ohlc &&
    i.finalQuote.ohlc &&
    i.finalQuote.last_price > i.quote.ohlc.high
  );
}
function getTop20AfterHighBreak(instruments) {

  return instruments
    .filter(i => i.finalQuote && i.finalQuote.ohlc && i.finalQuote.last_price > 0)
    .map(i => ({
      tickSymbol: i.tickSymbol,
      tradingsymbol: i.tradingsymbol,
      last: i.finalQuote.last_price,
      open: i.finalQuote.ohlc.open,   // TODAY OPEN
      highBreakLevel: i.quote.ohlc.high, // FIRST QUOTE HIGH
      gain: i.finalQuote.last_price - i.finalQuote.ohlc.open,
      pct: ((i.finalQuote.last_price - i.finalQuote.ohlc.open) / i.finalQuote.ohlc.open) * 100,
      volume: i.finalQuote.volume,
      oi: i.finalQuote.oi
    }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 20);
}

function getTopNearHigh(instruments, topN = 10) {

  return instruments
    .filter(i => i.finalQuote && i.finalQuote.ohlc && i.finalQuote.last_price > 0)
    .map(i => ({
      tickSymbol: i.tickSymbol,
      tradingsymbol: i.tradingsymbol,
      last: i.finalQuote.last_price,
      high: i.finalQuote.ohlc.high,
      diff: i.finalQuote.last_price - i.finalQuote.ohlc.high,
      pct: ((i.finalQuote.last_price - i.finalQuote.ohlc.high) / i.finalQuote.ohlc.high) * 100,
      volume: i.finalQuote.volume,
      oi: i.finalQuote.oi
    }))
    .sort((a, b) => b.diff - a.diff)
    .slice(0, topN);
}

async function scanBreakoutAndTopGainers(kite, instrumentsArray) {

  // fetch fresh quotes
  const tickSymbols = instrumentsArray.map(i => i.tickSymbol).filter(Boolean);
  const quotes = await fetchFreshQuotes(kite, tickSymbols);

  // attach as finalQuote
  const instrumentsWithFinalQuote = attachFinalQuotes(instrumentsArray, quotes);

  // 1️⃣ filter where first high is broken
  const highBreakList = getHighBreakInstruments(instrumentsWithFinalQuote);

  console.log(`\n⚡ HIGH BROKEN OPTIONS COUNT: ${highBreakList.length}\n`);

  // 2️⃣ from them get top 20 gainers vs open
  const top20 = getTop20AfterHighBreak(highBreakList);

  console.log("\n🔥 TOP 20 GAINERS AFTER HIGH BREAK (vs TODAY OPEN)\n");
  console.table(top20.map(i => ({
    symbol: i.tradingsymbol,
    last: i.last,
    open: i.open,
    firstHigh: i.highBreakLevel,
    gain: i.gain.toFixed(2),
    pct: i.pct.toFixed(2) + "%",
    vol: i.volume,
    oi: i.oi
  })));

  return top20;
}

// async function scanOptionGainers(kite, instrumentsArray) {

//   // 1. extract symbols
//   const tickSymbols = instrumentsArray
//     .map(i => i.tickSymbol)
//     .filter(Boolean);

//   // 2. fetch fresh quotes
//   const quotes = await fetchFreshQuotes(kite, tickSymbols);


//   console.log(quotes);

//   process.exit();

//   // 3. attach as finalQuote
//   const instrumentsWithFinalQuote = attachFinalQuotes(instrumentsArray, quotes);

//   // 4. calculate gainers
//   const topVsClose = getTopGainersVsClose(instrumentsWithFinalQuote, 10);
//   const topVsHigh  = getTopNearHigh(instrumentsWithFinalQuote, 10);

//   // 5. logs
//   console.log("\n🔥 TOP OPTION GAINERS vs CLOSE\n");
//   console.table(topVsClose.map(i => ({
//     symbol: i.tradingsymbol,
//     last: i.last,
//     close: i.close,
//     gain: i.gain.toFixed(2),
//     pct: i.pct.toFixed(2) + "%",
//     vol: i.volume,
//     oi: i.oi
//   })));

//   console.log("\n🚀 OPTIONS NEAR / ABOVE DAY HIGH\n");
//   console.table(topVsHigh.map(i => ({
//     symbol: i.tradingsymbol,
//     last: i.last,
//     high: i.high,
//     diff: i.diff.toFixed(2),
//     pct: i.pct.toFixed(2) + "%",
//     vol: i.volume,
//     oi: i.oi
//   })));

//   return { topVsClose, topVsHigh, instrumentsWithFinalQuote };
// }
function getTopGainersVsOpen(instruments, topN = 10) {

  return instruments
    .filter(i => i.finalQuote && i.finalQuote.ohlc && i.finalQuote.last_price > 0)
    .map(i => ({
      tickSymbol: i.tickSymbol,
      tradingsymbol: i.tradingsymbol,
      last: i.finalQuote.last_price,
      open: i.finalQuote.ohlc.open,
      gain: i.finalQuote.last_price - i.finalQuote.ohlc.open,
      pct: ((i.finalQuote.last_price - i.finalQuote.ohlc.open) / i.finalQuote.ohlc.open) * 100,
      volume: i.finalQuote.volume,
      oi: i.finalQuote.oi
    }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, topN);
}
async function scanOptionGainers(kite, instrumentsArray) {

  const tickSymbols = instrumentsArray.map(i => i.tickSymbol).filter(Boolean);

  const quotes = await fetchFreshQuotes(kite, tickSymbols);


  console.log(quotes);

  const instrumentsWithFinalQuote = attachFinalQuotes(instrumentsArray, quotes);

  const topVsOpen = getTopGainersVsOpen(instrumentsWithFinalQuote, 10);
  const topVsHigh = getTopNearHigh(instrumentsWithFinalQuote, 10);

  console.log("\n🔥 TOP OPTION GAINERS vs TODAY OPEN\n");
  console.table(topVsOpen.map(i => ({
    symbol: i.tradingsymbol,
    last: i.last,
    open: i.open,
    gain: i.gain.toFixed(2),
    pct: i.pct.toFixed(2) + "%",
    vol: i.volume,
    oi: i.oi
  })));

  console.log("\n🚀 OPTIONS NEAR / ABOVE DAY HIGH\n");
  console.table(topVsHigh.map(i => ({
    symbol: i.tradingsymbol,
    last: i.last,
    high: i.high,
    diff: i.diff.toFixed(2),
    pct: i.pct.toFixed(2) + "%",
    vol: i.volume,
    oi: i.oi
  })));

  return { topVsOpen, topVsHigh };
}


function getTopGainers(quotes) {

  // 1️⃣ Convert object → array and keep symbol
  const arr = Object.entries(quotes).map(([symbol, data]) => ({
    symbol,
    ...data
  }));

  // ---------- GAIN vs CLOSE (ABSOLUTE) ----------
  const top10VsClose = arr
    .map(item => ({
      ...item,
      gainClose: item.last_price - item.ohlc.close
    }))
    .sort((a, b) => b.gainClose - a.gainClose)
    .slice(0, 10);

  // ---------- GAIN vs HIGH (ABSOLUTE) ----------
  const top10VsHigh = arr
    .map(item => ({
      ...item,
      gainHigh: item.last_price - item.ohlc.high
    }))
    .sort((a, b) => b.gainHigh - a.gainHigh)
    .slice(0, 10);

  // ---------- % GAIN vs CLOSE ----------
  const top10PctVsClose = arr
    .map(item => ({
      ...item,
      pctClose: ((item.last_price - item.ohlc.close) / item.ohlc.close) * 100
    }))
    .sort((a, b) => b.pctClose - a.pctClose)
    .slice(0, 10);

  // ---------- % DISTANCE FROM HIGH ----------
  const top10PctVsHigh = arr
    .map(item => ({
      ...item,
      pctHigh: ((item.last_price - item.ohlc.high) / item.ohlc.high) * 100
    }))
    .sort((a, b) => b.pctHigh - a.pctHigh)
    .slice(0, 10);

  return {
    top10VsClose,
    top10VsHigh,
    top10PctVsClose,
    top10PctVsHigh
  };
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


async function main(){

     let today = new Date().toISOString().split('T')[0];
  let todayFile = `${FILE_LOCATION}/stockOption_${today}.json`;

     await connectToDatabase()
let accesstoken=await getTodaysAccessToken();

let kite=await getKiteConnectInstance(accesstoken);
let kiteTicker=await getTickerInstance (accesstoken);


//console.log(    "access token in stockOption.js",kiteTicker)

  // 🔴 EARLY EXIT
  if (await fileExists(todayFile)) {
    scripts1=await readTodayJsonFile(todayFile);

  let tickSymbols =  extractTickSymbols(scripts1) 
  var quotes2 = await fetchFreshQuotes(kite, tickSymbols);

const openEqualsLow = Object.entries(quotes2)
  .filter(([symbol, q]) => q.ohlc && q.ohlc.open === q.ohlc.low)
  .map(([symbol, q]) => ({
    symbol,
    open: q.ohlc.open,
    low: q.ohlc.low,
    last: q.last_price,
    high: q.ohlc.high,
    volume: q.volume,
    oi: q.oi
  }));

console.log("\n🔥 OPEN = LOW SCRIPTS\n");
console.table(openEqualsLow);


   // await scanOptionGainers(kite, scripts1);

console.log("the end")
    return;

    let stocks=scripts1.map(item=>item.name).filter(i=>i!=   "NIFTY" && i!="BANKNIFTY"  ).
filter((value, index, self) => self.indexOf(value) === index).map(item=>"NSE:"+item);  ;
let quotes= await kite.getQuote(stocks)



const result = getTopGainers(quotes);


// ================= PRETTY PRINT =================

console.log("\n🔥 TOP 10 GAINERS vs CLOSE (ABS)\n");
console.table(result.top10VsClose.map(i => ({
  symbol: i.symbol,
  last: i.last_price,
  close: i.ohlc.close,
  gain: i.gainClose.toFixed(2)
})));

console.log("\n🚀 TOP 10 NEAR DAY HIGH (ABS)\n");
console.table(result.top10VsHigh.map(i => ({
  symbol: i.symbol,
  last: i.last_price,
  high: i.ohlc.high,
  diff: i.gainHigh.toFixed(2)
})));

console.log("\n📈 TOP 10 GAINERS vs CLOSE (%)\n");
console.table(result.top10PctVsClose.map(i => ({
  symbol: i.symbol,
  pct: i.pctClose.toFixed(2) + "%"
})));

console.log("\n⚡ TOP 10 CLOSEST TO HIGH (%)\n");
console.table(result.top10PctVsHigh.map(i => ({
  symbol: i.symbol,
  pct: i.pctHigh.toFixed(2) + "%"
})));

    console.log(`✅ File already exists for today: ${todayFile}`);
 
    return;
  }

  // ==============================
  // NORMAL FLOW STARTS HERE
  // ==============================


 






//  stocks = [
//   "NSE:RELIANCE",
//   "NSE:TCS",
//   "NFO:BANKNIFTY25JAN45000CE"
// ];

//console.log(stocks)
let quotes= await kite.getQuote(stocks)




   await closeDatabaseConnection()
}



main()
