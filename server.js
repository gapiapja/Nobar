const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); 

// Hapus express.static(__dirname) karena frontend ada di Vercel

io.on('connection', (socket) => {
  socket.on('chat', (msg) => socket.broadcast.emit('chat', msg));
  socket.on('offer', (data) => socket.broadcast.emit('offer', data));
  socket.on('answer', (data) => socket.broadcast.emit('answer', data));
  socket.on('ice', (data) => socket.broadcast.emit('ice', data));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
