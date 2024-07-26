import {io4200,app,server4200} from '../server.js'

import http from 'http';

export default function a() {

  const server = http.createServer(app);
  //const io = new SocketIoServer(server);

  io4200 .on('connection', (socket) => {
    console.log('A user connected');

    // Function to emit the 'cis' variable
    function emitCis(cis) {
      socket.emit('cisUpdate', cis);
    }

    // Example usage of emitCis
    let cis = { key: 'value' }; // Replace with your actual variable
   // emitCis(cis);

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    // Export the emit function so it can be used elsewhere
    socket.emitCis = emitCis;
  });

  /* server.listen(port, () => {
    console.log(`Socket.IO server is running on port ${port}`);
  }); */

  //return io;
}
