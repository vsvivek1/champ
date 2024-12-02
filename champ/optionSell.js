import { connectToDatabase } from "../connectToDatabase.js";
import allInstruments from "../appv3/public/instruments/instrumentsAll.json" assert { type: "json" };
import getKiteConnectInstance from "../getKiteConnectInstanceRequire.js";
import readline from "readline";

let con = connectToDatabase();
let kc = await getKiteConnectInstance();

const lotSizeMap = {
  "NIFTY 50": 50,
  "BANKNIFTY": 25,
  "NIFTY MIDCAP 50": 75,
  "FINNIFTY": 40,
};

// Map LTP symbol to options `name` field
const optionNameMap = {
  "NIFTY 50": "NIFTY",
  "BANKNIFTY": "BANKNIFTY",
  "NIFTY MIDCAP 50": "MIDCPNIFTY",
  "FINNIFTY": "FINNIFTY",
};

const depth = 10; // Levels below for OTM options
const expiry = "2024-11-28"; // Replace with actual expiry date

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLtpAndTradeOptions(indexLtpName, reverse = false) {
  try {
    const indexOptionName = optionNameMap[indexLtpName];
    const lotSize = lotSizeMap[indexLtpName] * 10;

    if (!indexOptionName || !lotSize) {
      console.error("Invalid index choice.");
      return;
    }

    // Fetch the LTP for the selected index
    const niftySymbol = `NSE:${indexLtpName}`;
    const ltpData = await kc.getQuote([niftySymbol]);
    const niftyLtp = ltpData[niftySymbol]?.last_price;

    if (!niftyLtp) {
      console.error(`Unable to fetch LTP for ${indexLtpName}.`);
      return;
    }

    console.log(`LTP of ${indexLtpName}: ${niftyLtp}`);

    // Calculate ATM strike price
    const atmStrike = Math.round(niftyLtp / 50) * 50;
    console.log("ATM Strike Price:", atmStrike,indexOptionName,expiry);

    //process.exit();

    // Find ATM CE and PE
    const atmCe = allInstruments.find(
      (instrument) =>
        instrument.strike == atmStrike &&
        instrument.instrument_type === "CE" &&
        instrument.expiry === expiry &&
        instrument.name === indexOptionName
    );

    const atmPe = allInstruments.find(
      (instrument) =>
        instrument.strike == atmStrike &&
        instrument.instrument_type === "PE" &&
        instrument.expiry === expiry &&
        instrument.name === indexOptionName
    );

    if (!atmCe || !atmPe) {
      console.error(
        `Unable to find ATM CE or PE for ${indexOptionName} with expiry ${expiry}. Check available instruments.`
      );
      return;
    }

    console.log(`ATM CE: ${atmCe.tradingsymbol}`);
    console.log(`ATM PE: ${atmPe.tradingsymbol}`);

    // Find 10 levels below OTM CE and PE
    const otmCe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type === "CE" &&
        instrument.strike == atmStrike + 50 * depth &&
        instrument.expiry === expiry &&
        instrument.name === indexOptionName
    );

    const otmPe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type === "PE" &&
        instrument.strike == atmStrike - 50 * depth &&
        instrument.expiry === expiry &&
        instrument.name === indexOptionName
    );

    if (!otmCe || !otmPe) {
      console.error("Unable to find OTM CE or PE.");
      return;
    }

    console.log(`OTM CE (10 levels above): ${otmCe.tradingsymbol}`);
    console.log(`OTM PE (10 levels below): ${otmPe.tradingsymbol}`);

    if (reverse) {
      console.log("Executing reverse operation...");
      await placeOrder(atmCe.tradingsymbol, lotSize, "BUY");
      await placeOrder(atmPe.tradingsymbol, lotSize, "BUY");
      console.log("Buy orders placed for ATM CE and PE.");

      await delay(10000);

      await placeOrder(otmCe.tradingsymbol, lotSize, "SELL");
      await placeOrder(otmPe.tradingsymbol, lotSize, "SELL");
      console.log("Sell orders placed for OTM CE and PE.");
    } else {
      console.log("Executing standard operation...");
      await placeOrder(otmCe.tradingsymbol, lotSize, "BUY");
      await placeOrder(otmPe.tradingsymbol, lotSize, "BUY");
      console.log("Buy orders placed for OTM CE and PE.");

      await delay(10000);

      await placeOrder(atmCe.tradingsymbol, lotSize, "SELL");
      await placeOrder(atmPe.tradingsymbol, lotSize, "SELL");
      console.log("Sell orders placed for ATM CE and PE.");
    }

    await confirmSquareOffLoop();
  } catch (error) {
    console.error("Error during trading:", error);
  }
}

async function placeOrder(symbol, quantity, transactionType) {
  const orderParams = {
    tradingsymbol: symbol,
    exchange: "NFO",
    transaction_type: transactionType,
    order_type: "MARKET",
    quantity: quantity,
    product: "MIS",
    validity: "DAY",
  };

  try {
    const orderResponse = await kc.placeOrder("regular", orderParams);
    console.log(`Order placed: ${symbol}, Response:`, orderResponse);
  } catch (error) {
    console.error(`Error placing order for ${symbol}:`, error);
  }
}

// User prompt for index and reverse operation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Select index: (1: NIFTY 50, 2: BANKNIFTY, 3: NIFTY MIDCAP 50, 4: FINNIFTY): ",
  async (index) => {
    const indexMap = {
      1: "NIFTY 50",
      2: "BANKNIFTY",
      3: "NIFTY MIDCAP 50",
      4: "FINNIFTY",
    };

    const indexLtpName = indexMap[parseInt(index, 10)];

    if (!indexLtpName) {
      console.error("Invalid choice. Please select a valid index.");
      rl.close();
      return;
    }

    rl.question("Do you want to execute the reverse operation? (y/n): ", async (answer) => {
      const reverse = answer.toLowerCase() === "y";
      console.log(`Index selected: ${indexLtpName}, Reverse operation: ${reverse}`);
      await getLtpAndTradeOptions(indexLtpName, reverse);
      rl.close();
    });
  }
);
