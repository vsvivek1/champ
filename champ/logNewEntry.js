// Simple ANSI color helpers
const color = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m"
};

export function logNewEntry({
  cis,
  qty,
  price,
  global
}) {

  console.log(
    `\n${color.bold}${color.cyan}🚀 NEW ENTRY 🚀${color.reset}`
  );

  console.log(
    `${color.yellow}Symbol:${color.reset} ${cis.tradingsymbol}  |  ` +
    `${color.yellow}Thread:${color.reset} ${global.instrumentName}  |  ` +
    `${color.yellow}Time:${color.reset} ${global.clock}\n`
  );

  console.table([
    {
      Section: "ENTRY",
      Strategy: cis.buyStrategy,
      "Entry Health": cis.entryHealth,
      Quantity: qty,
      Price: price,
      Ordered: cis.ordered
    },
    {
      Section: "RISK",
      Target: cis.targetPrice,
      StopLoss: cis.stopLossPrice,
      "Inbuilt Target": cis.inbuiltTarget,
      "Inbuilt SL": cis.inbuiltStopLoss
    },
    {
      Section: "MARKET",
      "Last Price": cis.tick.last_price,
      "Avg Range": cis.averageRange,
      "Return Points": cis.returnPoints
    }
  ]);

  console.log(
    `${color.magenta}────────────────────────────────────────${color.reset}\n`
  );
}
