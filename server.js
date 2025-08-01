// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 5111;
const players = {};

app.use(express.static('public'));

io.on('connection', socket => {
  console.log(` Player connected: ${socket.id}`);

  socket.on('newPlayer', name => {
  console.log(`🟢 newPlayer: ${name} (${socket.id})`);
  players[socket.id] = {
    id: socket.id,
    name: name || 'Player',
    x: 50,
    y: 300,
    vx: 0,   // tambahkan
    vy: 0,   // tambahkan
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  };
  io.emit('updatePlayers', players);
});

  socket.on('move', data => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit('updatePlayers', players);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });
  
  socket.on('resetPlayer', () => {
  if (players[socket.id]) {
    players[socket.id].x = 50;
    players[socket.id].y = 300;
    players[socket.id].vx = 0;
    players[socket.id].vy = 0;
    io.emit('updatePlayers', players);
    console.log(`🔁 player Telah Di reset: ${socket.id}`);
  }
});
});

http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});