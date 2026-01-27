

function connectKiteTicker(ticker,scripts) {



  ticker.on("connect", () => {
    console.log("🟢 Kite Ticker connected");

    const tokens = scripts
      .map(s => s.instrument_token)
      .filter(Boolean);

    ticker.subscribe(tokens);
    ticker.setMode(ticker.modeFull, tokens);

    console.log("📡 Subscribed tokens:", tokens.length);
  });

  ticker.on("ticks", ticks => {
    ticks.forEach(tick => {
      console.log(
        `📈 ${tick.instrument_token} | LTP: ${tick.last_price} | OI: ${tick.open_interest}`
      );
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
  return ticker;
}

module.exports = { connectKiteTicker };
