import { connectToDatabase } from "../../connectToDatabase.js";
import { KiteTicker } from "kiteconnect";
import getKiteConnectInstance from "../../getKiteConnectInstanceRequire.js";
import nifty500 from "./nifty500.json" assert { type: "json" };

let con = connectToDatabase();

let kite = await getKiteConnectInstance();
let ticker;

global.nifty500 = nifty500;
global.kite = kite;
global.con = con;
global.aboveOpen = [];
global.belowOpen = [];
global.aboveOpenSymbols = new Set();
global.belowOpenSymbols = new Set();
global.aboveOpenMatchingATP = new Set();
global.belowOpenMatchingATP = new Set();

function processTicks(ticks) {
  const aboveOpenSet = new Set(global.aboveOpen.map((item) => item.instrument_token));
  const belowOpenSet = new Set(global.belowOpen.map((item) => item.instrument_token));

  ticks.forEach((tick) => {
    const { instrument_token, last_price, average_traded_price, ohlc } = tick;
    const tradingsymbol = nifty500.find((n) => n.instrument_token === instrument_token)?.tradingsymbol;

    if (!tradingsymbol) return; // Skip if the symbol isn't in nifty500

    if (last_price > ohlc.open) {
      // Add to aboveOpen if not already present
      if (!aboveOpenSet.has(instrument_token)) {
        global.aboveOpen.push(tick);
        global.aboveOpenSymbols.add(tradingsymbol);
        aboveOpenSet.add(instrument_token);
      }

      // Remove from belowOpen if it exists there
      if (belowOpenSet.has(instrument_token)) {
        global.belowOpen = global.belowOpen.filter((item) => item.instrument_token !== instrument_token);
        global.belowOpenSymbols.delete(tradingsymbol);
        belowOpenSet.delete(instrument_token);
      }

      // Check if last_price equals average_traded_price
      if (last_price> average_traded_price) {
        global.aboveOpenMatchingATP.add(tradingsymbol);
      } else {
        global.aboveOpenMatchingATP.delete(tradingsymbol);
      }
    } else if (last_price < ohlc.open) {
      // Add to belowOpen if not already present
      if (!belowOpenSet.has(instrument_token)) {
        global.belowOpen.push(tick);
        global.belowOpenSymbols.add(tradingsymbol);
        belowOpenSet.add(instrument_token);
      }

      // Remove from aboveOpen if it exists there
      if (aboveOpenSet.has(instrument_token)) {
        global.aboveOpen = global.aboveOpen.filter((item) => item.instrument_token !== instrument_token);
        global.aboveOpenSymbols.delete(tradingsymbol);
        aboveOpenSet.delete(instrument_token);
      }

      // Check if last_price equals average_traded_price
      if (last_price < average_traded_price) {
        global.belowOpenMatchingATP.add(tradingsymbol);
      } else {
        global.belowOpenMatchingATP.delete(tradingsymbol);
      }
    } else {
      // If neither above nor below, remove from both lists
      if (aboveOpenSet.has(instrument_token)) {
        global.aboveOpen = global.aboveOpen.filter((item) => item.instrument_token !== instrument_token);
        global.aboveOpenSymbols.delete(tradingsymbol);
        global.aboveOpenMatchingATP.delete(tradingsymbol);
        aboveOpenSet.delete(instrument_token);
      }

      if (belowOpenSet.has(instrument_token)) {
        global.belowOpen = global.belowOpen.filter((item) => item.instrument_token !== instrument_token);
        global.belowOpenSymbols.delete(tradingsymbol);
        global.belowOpenMatchingATP.delete(tradingsymbol);
        belowOpenSet.delete(instrument_token);
      }
    }
  });
}

function initTicker() {
  ticker = new KiteTicker({
    api_key: kite.api_key,
    access_token: kite.access_token,
  });

  ticker.connect();
  ticker.on("connect", subscribe);
  ticker.on("ticks", onTicks);
  ticker.on("order_update", orderUpdates);
}

async function orderUpdates(order) {
  // Handle order updates if needed
}

function onTicks(ticks) {
  processTicks(ticks);

  //console.log("Above Open Symbols (Trading Symbols):", Array.from(global.aboveOpenSymbols));
  //console.log("Below Open Symbols (Trading Symbols):", Array.from(global.belowOpenSymbols));
  console.log("Above Open Matching ATP:", Array.from(global.aboveOpenMatchingATP));
  console.log("Below Open Matching ATP:", Array.from(global.belowOpenMatchingATP));
}

async function fetchHistoricalData(instrument, dataType, fromTime, toTime){

    const data = await kite.getHistoricalData(instrument, dataType, fromTime, toTime);

    return data;



}

async function fetchMinuteData(){


    
}

async function subscribe() {
  try {
    const instrumentTokens = global.nifty500.map((i) => parseInt(i.instrument_token));

    ticker.unsubscribe([]);
    ticker.subscribe(instrumentTokens);
    ticker.setMode(ticker.modeFull, instrumentTokens);
  } catch (error) {
    console.error("Error subscribing to instruments:", error);
  }
}

// Initialize the ticker
initTicker();
