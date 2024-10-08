const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    setInterval(() => {
        socket.emit('log', 'Current Memory Usage: ' + process.memoryUsage().heapUsed);
    }, 2000);
});

server.listen(5555, () => {
    console.log('listening on *:5555');
});
