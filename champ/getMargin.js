import allInstruments from "../appv3/public/instruments/instrumentsAll.json" assert { type: "json" };
import getKiteConnectInstance from "../getKiteConnectInstanceRequire.js";
import readline from "readline";
import mongoose from "mongoose";
import fs from "fs";

// MongoDB connection
async function connectToDatabase() {
  try {
    const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    return false;
  }
}

// Constants
const optionNameMap = {
  "NIFTY 50": "NIFTY",
  "BANKNIFTY": "BANKNIFTY",
  "NIFTY MIDCAP 50": "MIDCPNIFTY",
  "FINNIFTY": "FINNIFTY",
};

const expiry = "2025-07-31"; // Replace with your expiry date

// Place LIMIT order at LTP
async function placeOrder(symbol, quantity, transactionType, price) {
  const orderParams = {
    tradingsymbol: symbol,
    exchange: "NFO",
    transaction_type: transactionType,
    order_type: "LIMIT",
    price: price,
    quantity: quantity,
    product: "NRML",
    validity: "DAY",
  };

  console.log(orderParams);
  try {
    const orderResponse = await kc.placeOrder("regular", orderParams);
    console.log(`✅ Order placed: ${symbol}, Response:`, orderResponse);
  } catch (error) {
    console.error(`❌ Error placing order for ${symbol}:`, error);
  }
}

// Deep ITM option selling
async function sellDeepITMOptions(indexLtpName) {
  try {
    const indexOptionName = optionNameMap[indexLtpName];
    const multiplier = 1;

    if (!indexOptionName) {
      console.error("Invalid index choice.");
      return;
    }

    const indexSymbol = `NSE:${indexLtpName}`;
    const ltpData = await kc.getQuote([indexSymbol]);
    const ltp = ltpData[indexSymbol]?.last_price;

    if (!ltp) {
      console.error(`Unable to fetch LTP for ${indexLtpName}.`);
      return;
    }

    const atmStrike = Math.round(ltp / 50) * 50;
    const depth = 3;

    console.log(`\n🔍 LTP of ${indexLtpName}: ₹${ltp}, ATM Strike: ₹${atmStrike}`);

    const deepItmCe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type == "CE" &&
        instrument.strike == (atmStrike - 50 * depth) &&
        instrument.expiry == expiry &&
        instrument.name == indexOptionName
    );

    const deepItmPe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type == "PE" &&
        instrument.strike == (atmStrike + 50 * depth) &&
        instrument.expiry == expiry &&
        instrument.name == indexOptionName
    );

    if (!deepItmCe || !deepItmPe) {
      console.error("Unable to find deep ITM CE or PE.");
      return;
    }

    const lotSize = deepItmCe.lot_size * multiplier;

    // Fetch LTPs of the options for placing LIMIT orders
    const ltpOptions = await kc.getQuote([
      `NFO:${deepItmCe.tradingsymbol}`,
      `NFO:${deepItmPe.tradingsymbol}`,
    ]);

    const ceLtp = ltpOptions[`NFO:${deepItmCe.tradingsymbol}`]?.last_price;
    const peLtp = ltpOptions[`NFO:${deepItmPe.tradingsymbol}`]?.last_price;

    if (!ceLtp || !peLtp) {
      console.error("Unable to fetch LTPs for CE/PE options.");
      return;
    }

    console.log(`\n🟩 Deep ITM CE to sell: ${deepItmCe.tradingsymbol} @ ₹${ceLtp}`);
    console.log(`🟩 Deep ITM PE to sell: ${deepItmPe.tradingsymbol} @ ₹${peLtp}`);
    console.log(`📦 Quantity (lot size × ${multiplier}): ${lotSize}\n`);

    await placeOrder(deepItmCe.tradingsymbol, lotSize, "SELL", ceLtp);
    await placeOrder(deepItmPe.tradingsymbol, lotSize, "SELL", peLtp);

    console.log("✅ LIMIT Sell orders placed for Deep ITM CE and PE.\n");

    // Save symbols to skip.json
    const skipSymbols = {
      skip: [deepItmCe.tradingsymbol, deepItmPe.tradingsymbol],
    };

    fs.writeFileSync("skip.json", JSON.stringify(skipSymbols, null, 2));
    console.log("✅ Saved to skip.json:", skipSymbols);

  } catch (error) {
    console.error("🔥 Error in sellDeepITMOptions:", error);
  }
}

// MAIN
const isConnected = await connectToDatabase();
if (!isConnected) {
  console.error("Failed to connect to MongoDB. Exiting...");
  process.exit();
}

const kc = await getKiteConnectInstance();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Select index for Deep ITM Option Sell:\n1: NIFTY 50\n2: BANKNIFTY\n3: NIFTY MIDCAP 50\n4: FINNIFTY\nYour choice: ",
  async (index) => {
    const indexMap = {
      1: "NIFTY 50",
      2: "BANKNIFTY",
      3: "NIFTY MIDCAP 50",
      4: "FINNIFTY",
    };

    const indexLtpName = indexMap[parseInt(index, 10)];

    if (!indexLtpName) {
      console.error("Invalid index selection.");
      rl.close();
      return;
    }

    console.log(`\n👉 Selected index: ${indexLtpName}\n`);
    await sellDeepITMOptions(indexLtpName);
    rl.close();
  }
);
