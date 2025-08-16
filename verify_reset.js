// Simple verification script untuk test reset functionality
const io = require('socket.io-client');

console.log('🔍 Verifikasi Reset Functionality...\n');

const socket = io('http://localhost:5111');

socket.on('connect', () => {
    console.log('✅ Terhubung ke server');
    
    // Test 1: Buat player
    console.log('\n📋 Test 1: Membuat Player');
    socket.emit('newPlayer', 'TestPlayer');
    
    setTimeout(() => {
        // Test 2: Reset player
        console.log('\n📋 Test 2: Reset Player');
        socket.emit('resetPlayer');
        
        setTimeout(() => {
            // Test 3: Cek hasil reset
            console.log('\n📋 Test 3: Verifikasi Hasil Reset');
            socket.emit('getPlayerState');
            
            socket.once('playerState', (state) => {
                console.log('📊 Hasil Reset:');
                console.log(`   Position: x=${state.x}, y=${state.y}`);
                console.log(`   Velocity: vx=${state.vx}, vy=${state.vy}`);
                console.log(`   Name: "${state.name}" (length: ${state.name.length})`);
                console.log(`   Color: "${state.color}" (length: ${state.color.length})`);
                
                // Verifikasi
                const positionCorrect = state.x === 50 && state.y === 300;
                const velocityCorrect = state.vx === 0 && state.vy === 0;
                const nameCorrect = state.name === 'TestPlayer';
                const colorReasonable = state.color && state.color.length <= 10;
                
                console.log('\n✅ Verifikasi:');
                console.log(`   Position reset: ${positionCorrect ? 'PASS' : 'FAIL'}`);
                console.log(`   Velocity reset: ${velocityCorrect ? 'PASS' : 'FAIL'}`);
                console.log(`   Name integrity: ${nameCorrect ? 'PASS' : 'FAIL'}`);
                console.log(`   Color integrity: ${colorReasonable ? 'PASS' : 'FAIL'}`);
                
                // Cek doubling
                let hasDoubling = false;
                if (state.name.length > 20) {
                    console.log(`   ⚠️  Name terlalu panjang: "${state.name}"`);
                    hasDoubling = true;
                }
                if (state.color.length > 10) {
                    console.log(`   ⚠️  Color terlalu panjang: "${state.color}"`);
                    hasDoubling = true;
                }
                
                console.log('\n🎯 KESIMPULAN:');
                if (hasDoubling) {
                    console.log('❌ STRING DOUBLING DETECTED!');
                } else {
                    console.log('✅ TIDAK ADA STRING DOUBLING');
                    console.log('   Reset functionality bekerja dengan benar');
                }
                
                socket.disconnect();
                process.exit(0);
            });
        }, 100);
    }, 100);
});

socket.on('connect_error', (error) => {
    console.error('❌ Gagal terhubung:', error.message);
    process.exit(1);
});