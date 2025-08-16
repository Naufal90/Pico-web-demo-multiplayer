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
  console.log(`🟢 [NEW PLAYER] Creating player: ${name} (${socket.id})`);
  console.log(`   🏷️  Name: "${name}" (${name.length} characters)`);
  console.log(`   🔗 Socket ID: ${socket.id}`);
  
  const color = '#' + Math.floor(Math.random()*16777215).toString(16);
  console.log(`   🎨 Generated color: "${color}" (${color.length} characters)`);
  
  players[socket.id] = {
    id: socket.id,
    name: name || 'Player',
    x: 50,
    y: 300,
    vx: 0,
    vy: 0,
    color: color
  };
  
  console.log(`   ✅ Player created successfully`);
  console.log(`   📊 Final player data: name="${players[socket.id].name}", color="${players[socket.id].color}"`);
  
  io.emit('updatePlayers', players);
  console.log(`   📡 Sent updatePlayers to all clients`);
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
  
  socket.on('resetPlayer', (resetReason = 'unknown') => {
  if (players[socket.id]) {
    const player = players[socket.id];
    console.log(`🔁 [RESET] Player: ${player.name} (${socket.id})`);
    console.log(`   📍 Before reset: x=${player.x}, y=${player.y}, vx=${player.vx}, vy=${player.vy}`);
    console.log(`   🏷️  String values: name="${player.name}" (${player.name.length} chars), color="${player.color}" (${player.color.length} chars)`);
    console.log(`   🎯 Reset reason: ${resetReason}`);
    
    // Perform reset
    player.x = 50;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    
    console.log(`   📍 After reset: x=${player.x}, y=${player.y}, vx=${player.vx}, vy=${player.vy}`);
    console.log(`   🏷️  String values: name="${player.name}" (${player.name.length} chars), color="${player.color}" (${player.color.length} chars)`);
    console.log(`   ✅ Reset completed successfully`);
    
    io.emit('updatePlayers', players);
  } else {
    console.log(`❌ [RESET] Player not found: ${socket.id}`);
  }
});

  socket.on('getPlayerState', () => {
    if (players[socket.id]) {
      socket.emit('playerState', players[socket.id]);
    } else {
      socket.emit('playerState', { x: 0, y: 0, vx: 0, vy: 0, name: '', color: '' });
    }
  });
});

http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});