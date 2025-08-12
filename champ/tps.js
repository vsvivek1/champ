// ===== Imports =====
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

// ===== Setup Path =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Constants =====
const dataFile = path.join(__dirname, "tps_log.json");

// ===== Market Reference Time =====
const marketOpenTime = new Date();
marketOpenTime.setHours(9, 15, 0, 0);

// ===== Utility Functions =====

function getMarketTimeInMinutes() {
  const now = new Date();
  return Math.floor((now - marketOpenTime) / 60000);
}

function getCurrentDateString() {
  return new Date().toISOString().split("T")[0];
}

function updateJsonFile(tradingsymbol, minute, tps) {
  let jsonData = {};
  if (fs.existsSync(dataFile)) {
    const content = fs.readFileSync(dataFile, "utf8");
    jsonData = content ? JSON.parse(content) : {};
  }

  const date = getCurrentDateString();
  jsonData[date] = jsonData[date] || {};
  jsonData[date][tradingsymbol] = jsonData[date][tradingsymbol] || {};
  jsonData[date][tradingsymbol][minute] = tps;

  fs.writeFileSync(dataFile, JSON.stringify(jsonData, null, 2));
}

// ===== Main Function =====

export function startTPSLogger(kite, tradingsymbol, instrumentToken) {
  const ticker = new KiteTicker({
    api_key: kite._config.api_key,
    access_token: kite._config.access_token,
  });

  let tickCounter = 0;

  // Reset tick counter per second and accumulate
  function setupTickCounter() {
    let ticksThisSecond = 0;

    setInterval(() => {
      tickCounter += ticksThisSecond;
      ticksThisSecond = 0;
    }, 1000);

    return () => ticksThisSecond++;
  }

  const countTick = setupTickCounter();

  // Log TPS every minute at 50th second
  setInterval(() => {
    const now = new Date();
    const seconds = now.getSeconds();

    if (seconds === 50) {
      const minute = getMarketTimeInMinutes();
      const tps = Math.round(tickCounter / 50);
      if (minute >= 0) {
        console.log(`[${minute} min] TPS for ${tradingsymbol}: ${tps}`);
        updateJsonFile(tradingsymbol, minute, tps);
      }
      tickCounter = 0;
    }
  }, 1000);

  // Handle incoming ticks
  



  

}
