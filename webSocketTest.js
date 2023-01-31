const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:4000');

// console.log(socket)

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Send a message to the server
 socket.emit('subscribe-orders',
      
  JSON.stringify([260105, 256265, 264969, 39466754, 39466242, 39465730, 39465218, 39464706, 39464194, 39463682, 39463426, 39462914, 39462402, 39461890, 39460866, 39460354, 39461378, 39432962, 39432450, 39431938, 39431426, 39430658, 39430146, 39429634, 39408386, 39407874, 39407362, 39406850, 39406338, 39405826, 39405570, 39405058, 39404546, 39404034, 39403522, 39403010, 39402498, 39369474, 39367938, 39367426, 39366914, 39366146, 39364610, 39340290, 41698562, 39339778, 41698050, 39339266, 41697538, 39339010, 41697282, 39338498, 41696770, 39337986, 39337474, 10544386, 10543362, 39314690, 10539010, 39315202, 39314178, 10537474, 39313666, 10534402, 39313410, 10534146, 39312898, 10533378, 39312386, 10532866, 10528258, 39311362, 39311874, 10527234, 39282434, 39282946, 39283458, 39281410, 39281922, 39280898, 39280642, 39280130, 39279618, 39279106, 39278594, 39255810, 39255298, 39254786, 39254274, 39253762, 39253250, 39252994, 39252482, 39251970, 39251458, 39250946, 39250434, 39220994, 39220482, 39219970]));
 
 
 
 
  socket.on('send-realtime-subscription', (tick) => {

    console.log({tick});
//    ticks.push(tick);
  });
});

socket.on('message', (data) => {
  console.log(`Received message: ${data}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// This code creates a new WebSocket client, connects to a WebSocket server running on http://localhost:8000 and sends a message to the server when the connection is open. It listens for messages received from the server and logs them in the console. And also it listens for the disconnect event and logs the disconnection.

// You can use socket.io-client package to connect to the WebSocket server.

// Please note that this is just a basic example and you should adjust it to your specific requirements and testing scenarios.



