import { connectToDatabase } from "../connectToDatabase.js";
import allInstruments from "../appv3/public/instruments/instrumentsAll.json" assert { type: "json" };
import getKiteConnectInstance from "../getKiteConnectInstanceRequire.js";
import readline from "readline";

let con = connectToDatabase();
let kc = await getKiteConnectInstance();

const niftySymbol = "NSE:NIFTY 50"; // Symbol for NIFTY
const lotSize = 50; // Lot size for NIFTY options
const depth = 10; // Levels below for OTM options
const expiry = "2024-11-21"; // Replace with actual expiry date

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLivePnL() {
  try {
    const positions = await kc.getPositions();
    const netPositions = positions.net;

    if (netPositions.length === 0) {
      console.log("No positions available.");
      return { pnl: 0, positions: [] };
    }

    let totalPnL = 0;
    const positionDetails = [];

    netPositions.forEach((position) => {
      const pnl = position.unrealized || 0;
      totalPnL += pnl;
      positionDetails.push({
        symbol: position.tradingsymbol,
        quantity: position.quantity,
        pnl,
      });
    });

    return { pnl: totalPnL, positions: positionDetails };
  } catch (error) {
    console.error("Error fetching live P&L:", error);
    return { pnl: 0, positions: [] };
  }
}

async function squareOffPositions() {
  try {
    const positions = await kc.getPositions();
    const netPositions = positions.net;

    if (netPositions.length === 0) {
      console.log("No positions to square off.");
      return;
    }

    console.log("Existing positions to square off:");
    netPositions.forEach((position) => {
      console.log(
        `Symbol: ${position.tradingsymbol}, Quantity: ${position.quantity}, Type: ${
          position.buy_or_sell
        }`
      );
    });

    for (const position of netPositions) {
      const quantity = Math.abs(position.quantity);
      const transactionType = position.quantity > 0 ? "SELL" : "BUY";

      console.log(`Squaring off position: ${position.tradingsymbol}`);
      await placeOrder(position.tradingsymbol, quantity, transactionType);
    }

    console.log("All positions squared off successfully.");
  } catch (error) {
    console.error("Error during square-off operation:", error);
  }
}

async function confirmSquareOffLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const { pnl, positions } = await getLivePnL();

    console.log("\nLive P&L:");
    console.log(`Total P&L: ${pnl.toFixed(2)}`);
    positions.forEach((pos) => {
      console.log(
        `Symbol: ${pos.symbol}, Quantity: ${pos.quantity}, Unrealized P&L: ${pos.pnl.toFixed(2)}`
      );
    });

    await new Promise((resolve) => {
      rl.question("\nDo you want to square off all positions? (yes/no): ", async (answer) => {
        if (answer.toLowerCase() === "yes") {
          console.log("Square-off confirmed. Proceeding...");
          await squareOffPositions();
          rl.close();
          resolve();
          process.exit(0); // Exit the loop after square-off
        } else {
          console.log("Square-off canceled. Showing live P&L again...");
          resolve();
        }
      });
    });
    await delay(5000); // Refresh P&L every 5 seconds
  }
}

async function getLtpAndTradeOptions(reverse = false) {
  try {
    // Fetch the LTP for NIFTY
    const ltpData = await kc.getLTP([niftySymbol]);
    const niftyLtp = ltpData[niftySymbol]?.last_price;

    if (!niftyLtp) {
      console.error("Unable to fetch LTP for NIFTY 50.");
      return;
    }

    console.log(`LTP of NIFTY 50: ${niftyLtp}`);

    // Calculate ATM strike price
    const atmStrike = Math.round(niftyLtp / 50) * 50;
    console.log("ATM Strike Price:", atmStrike);

    // Find ATM CE and PE
    const atmCe = allInstruments.find(
      (instrument) =>
        instrument.strike == atmStrike &&
        instrument.instrument_type === "CE" &&
        instrument.expiry === expiry &&
        instrument.name === "NIFTY"
    );

    const atmPe = allInstruments.find(
      (instrument) =>
        instrument.strike == atmStrike &&
        instrument.instrument_type === "PE" &&
        instrument.expiry === expiry &&
        instrument.name === "NIFTY"
    );

    if (!atmCe || !atmPe) {
      console.error("Unable to find ATM CE or PE.");
      return;
    }

    console.log(`ATM CE: ${atmCe.tradingsymbol}`);
    console.log(`ATM PE: ${atmPe.tradingsymbol}`);

    // Find 4 levels below OTM CE and PE
    const otmCe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type === "CE" &&
        instrument.strike == atmStrike + 50 * depth &&
        instrument.expiry === expiry &&
        instrument.name === "NIFTY"
    );

    const otmPe = allInstruments.find(
      (instrument) =>
        instrument.instrument_type === "PE" &&
        instrument.strike == atmStrike - 50 * depth &&
        instrument.expiry === expiry &&
        instrument.name === "NIFTY"
    );

    if (!otmCe || !otmPe) {
      console.error("Unable to find OTM CE or PE.");
      return;
    }

    console.log(`OTM CE (10 levels above): ${otmCe.tradingsymbol}`);
    console.log(`OTM PE (10 levels below): ${otmPe.tradingsymbol}`);

    if (reverse) {
      // Reverse operation: Buy ATM and Sell OTM
      console.log("Executing reverse operation...");
      await placeOrder(atmCe.tradingsymbol, lotSize, "BUY");
      await placeOrder(atmPe.tradingsymbol, lotSize, "BUY");
      console.log("Buy orders placed for ATM CE and PE.");

      // Wait for 10 seconds before selling OTM options
      console.log("Waiting for 10 seconds before selling OTM options...");
      await delay(10000);

      await placeOrder(otmCe.tradingsymbol, lotSize, "SELL");
      await placeOrder(otmPe.tradingsymbol, lotSize, "SELL");
      console.log("Sell orders placed for OTM CE and PE.");
    } else {
      // Standard operation: Buy OTM and Sell ATM
      console.log("Executing standard operation...");
      await placeOrder(otmCe.tradingsymbol, lotSize, "BUY");
      await placeOrder(otmPe.tradingsymbol, lotSize, "BUY");
      console.log("Buy orders placed for OTM CE and PE.");

      // Wait for 10 seconds before selling ATM options
      console.log("Waiting for 10 seconds before selling ATM options...");
      await delay(10000);

      await placeOrder(atmCe.tradingsymbol, lotSize, "SELL");
      await placeOrder(atmPe.tradingsymbol, lotSize, "SELL");
      console.log("Sell orders placed for ATM CE and PE.");
    }

    // Start square-off confirmation loop
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
    product: "NRML", // Use NRML for overnight or MIS for intraday
    validity: "DAY",
  };

  try {
    const orderResponse = await kc.placeOrder("regular", orderParams);
    console.log(`Order placed: ${symbol}, Response:`, orderResponse);
  } catch (error) {
    console.error(`Error placing order for ${symbol}:`, error);
  }
}

// User prompt for reverse operation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Do you want to execute the reverse operation? (yes/no): ", async (answer) => {
  const reverse = answer.toLowerCase() === "yes";
  console.log(`Reverse operation selected: ${reverse}`);
  await getLtpAndTradeOptions(reverse);
});
