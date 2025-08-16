# 🔍 Debug Log Guide - Reset Functionality

## 📋 Overview

Debug log telah ditambahkan untuk memantau semua operasi reset dan string values yang digunakan dalam berbagai skenario game. Log ini akan membantu mendeteksi masalah doubling atau anomali lainnya.

## 🎯 Skenario yang Dimonitor

### 1. 🎮 Game Start (Mulai Game)
**Trigger:** `startGame()` function
**Debug Log:**
```
🎮 [START GAME] Starting new game with player name: "PlayerName"
   🏷️  Name length: X characters
   🔗 Socket ID: socket_id_here
🎮 [START GAME] Calling resetGame for initial setup
🔄 [CLIENT RESET] Starting reset - Reason: game_start
   📍 Before reset: x=X, y=Y, vx=X, vy=Y
   🏷️  Player ID: player_id_here
   🎮 Game state: isDead=false, gameLoopRunning=false
   📍 After local reset: x=50, y=300, vx=0, vy=0
   🏷️  New Player ID: new_player_id
   🌐 Sending resetPlayer to server with reason: game_start
   🎮 Starting game loop
✅ [CLIENT RESET] Reset completed - Reason: game_start
```

### 2. 💀 Death Respawn (Mati & Respawn)
**Trigger:** `showGameOver()` → Retry button click
**Debug Log:**
```
💀 [GAME OVER] Player died - Starting death sequence
   📍 Death position: x=X, y=Y, vx=X, vy=Y
   🏷️  Player ID: player_id_here
[DEBUG] Game loop stopped (Game Over)
💀 [GAME OVER] Death sequence completed - waiting for respawn
🔄 [RESPAWN] Retry button clicked - respawning player
🔄 [CLIENT RESET] Starting reset - Reason: death_respawn
   📍 Before reset: x=X, y=Y, vx=X, vy=Y
   🏷️  Player ID: player_id_here
   🎮 Game state: isDead=true, gameLoopRunning=false
   📍 After local reset: x=50, y=300, vx=0, vy=0
   🏷️  New Player ID: new_player_id
   🌐 Sending resetPlayer to server with reason: death_respawn
   🎮 Starting game loop
✅ [CLIENT RESET] Reset completed - Reason: death_respawn
```

### 3. 🏆 Victory Restart (Menang & Main Lagi)
**Trigger:** `showLevelComplete()` → Play again button click
**Debug Log:**
```
🏆 [LEVEL COMPLETE] Player reached finish - Starting victory sequence
   📍 Victory position: x=X, y=Y, vx=X, vy=Y
   🏷️  Player ID: player_id_here
[DEBUG] Game loop stopped (Level Complete)
🏆 [LEVEL COMPLETE] Victory sequence completed - waiting for restart
🔄 [PLAY_AGAIN] Play again button clicked - restarting level
🔄 [CLIENT RESET] Starting reset - Reason: victory_restart
   📍 Before reset: x=X, y=Y, vx=X, vy=Y
   🏷️  Player ID: player_id_here
   🎮 Game state: isDead=true, gameLoopRunning=false
   📍 After local reset: x=50, y=300, vx=0, vy=0
   🏷️  New Player ID: new_player_id
   🌐 Sending resetPlayer to server with reason: victory_restart
   🎮 Starting game loop
✅ [CLIENT RESET] Reset completed - Reason: victory_restart
```

## 🔧 Server-Side Debug Logs

### Player Creation
```
🟢 [NEW PLAYER] Creating player: PlayerName (socket_id)
   🏷️  Name: "PlayerName" (X characters)
   🔗 Socket ID: socket_id
   🎨 Generated color: "#XXXXXX" (7 characters)
   ✅ Player created successfully
   📊 Final player data: name="PlayerName", color="#XXXXXX"
   📡 Sent updatePlayers to all clients
```

### Reset Player Event
```
🔁 [RESET] Player: PlayerName (socket_id)
   📍 Before reset: x=X, y=Y, vx=X, vy=Y
   🏷️  String values: name="PlayerName" (X chars), color="#XXXXXX" (7 chars)
   🎯 Reset reason: game_start/death_respawn/victory_restart
   📍 After reset: x=50, y=300, vx=0, vy=0
   🏷️  String values: name="PlayerName" (X chars), color="#XXXXXX" (7 chars)
   ✅ Reset completed successfully
```

### Socket Events
```
📡 [SOCKET] Received updatePlayers event
   👥 Total players: X
   🆔 Set playerId to: player_id
   👤 My player state: name="PlayerName", color="#XXXXXX", pos=(X,Y)
```

## 🔍 Cara Mendeteksi Masalah

### 1. String Doubling Detection
**Indikator:**
- Name length > 20 characters
- Color length > 10 characters
- Repeated patterns dalam string

**Contoh Log Masalah:**
```
🏷️  String values: name="PlayerNamePlayerName" (20 chars), color="#XXXXXX#XXXXXX" (14 chars)
❌ STRING DOUBLING DETECTED!
```

### 2. Position/Value Issues
**Indikator:**
- Position tidak reset ke (50, 300)
- Velocity tidak reset ke (0, 0)
- Nilai tidak konsisten setelah reset

**Contoh Log Masalah:**
```
📍 After reset: x=100, y=400, vx=5, vy=10
❌ Reset failed - values not reset properly
```

### 3. Event Duplication
**Indikator:**
- Multiple reset events dalam waktu singkat
- Player ID berubah berulang kali
- Game loop start/stop berulang

## 🧪 Testing Scenarios

### Manual Testing
1. **Buka browser console** saat bermain game
2. **Jalankan skenario:**
   - Start game baru
   - Mati dan respawn
   - Menang dan main lagi
3. **Monitor log** untuk anomali

### Automated Testing
```bash
# Jalankan test script
node test_reset_scenarios.js
```

### Expected Log Pattern
```
✅ Normal flow:
🎮 [START GAME] → 🔄 [CLIENT RESET] → 🔁 [RESET] → ✅ Reset completed

❌ Problematic flow:
🎮 [START GAME] → 🔄 [CLIENT RESET] → 🔄 [CLIENT RESET] → 🔁 [RESET] → 🔁 [RESET]
```

## 📊 Monitoring Checklist

- [ ] String values tidak berubah saat reset
- [ ] Position selalu reset ke (50, 300)
- [ ] Velocity selalu reset ke (0, 0)
- [ ] Player ID konsisten
- [ ] Reset reason tercatat dengan benar
- [ ] Tidak ada event duplication
- [ ] Game loop start/stop normal

## 🚨 Troubleshooting

### Jika String Doubling Terdeteksi:
1. Cek apakah ada string concatenation (`+=`)
2. Cek apakah ada event handler duplication
3. Cek apakah ada recursive calls

### Jika Position Tidak Reset:
1. Cek server-side reset logic
2. Cek client-side reset logic
3. Cek network connectivity

### Jika Event Duplication:
1. Cek button click handlers
2. Cek game loop logic
3. Cek socket event listeners

---

**Debug log ini akan membantu mendeteksi masalah doubling atau anomali lainnya dalam reset functionality. Monitor log secara berkala untuk memastikan sistem berjalan dengan normal.**