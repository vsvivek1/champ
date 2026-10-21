const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5000 });

wss.on("connection", (ws) => {
  console.log("Mac connected");

  ws.send("Scale monitoring active");

  // Example alert
  setTimeout(() => {
    ws.send("Weight exceeded limit!");
  }, 5000);
});