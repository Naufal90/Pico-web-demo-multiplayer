const io = require('socket.io-client');

async function testReset() {
    console.log('🧪 Testing Reset Functionality...\n');
    
    const socket = io('http://localhost:5111');
    
    return new Promise((resolve) => {
        socket.on('connect', async () => {
            console.log('✅ Connected to server');
            
            // Create player
            socket.emit('newPlayer', 'TestPlayer');
            console.log('👤 Created player: TestPlayer');
            
            // Wait for player creation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Test 1: Check initial state
            console.log('\n📋 Test 1: Initial State Check');
            socket.emit('getPlayerState');
            
            socket.once('playerState', (state) => {
                console.log(`   Initial position: x=${state.x}, y=${state.y}`);
                console.log(`   Initial velocity: vx=${state.vx}, vy=${state.vy}`);
                console.log(`   Name: "${state.name}", Color: "${state.color}"`);
                
                // Test 2: Perform reset
                console.log('\n📋 Test 2: Performing Reset');
                socket.emit('resetPlayer');
                
                setTimeout(() => {
                    socket.emit('getPlayerState');
                    
                    socket.once('playerState', (resetState) => {
                        console.log(`   After reset - Position: x=${resetState.x}, y=${resetState.y}`);
                        console.log(`   After reset - Velocity: vx=${resetState.vx}, vy=${resetState.vy}`);
                        console.log(`   After reset - Name: "${resetState.name}", Color: "${resetState.color}"`);
                        
                        // Check if reset worked correctly
                        const positionCorrect = resetState.x === 50 && resetState.y === 300;
                        const velocityCorrect = resetState.vx === 0 && resetState.vy === 0;
                        const nameCorrect = resetState.name === 'TestPlayer';
                        const colorCorrect = resetState.color && resetState.color.length > 0;
                        
                        console.log('\n📊 Reset Results:');
                        console.log(`   Position reset: ${positionCorrect ? '✅ PASS' : '❌ FAIL'}`);
                        console.log(`   Velocity reset: ${velocityCorrect ? '✅ PASS' : '❌ FAIL'}`);
                        console.log(`   Name integrity: ${nameCorrect ? '✅ PASS' : '❌ FAIL'}`);
                        console.log(`   Color integrity: ${colorCorrect ? '✅ PASS' : '❌ FAIL'}`);
                        
                        // Test 3: Multiple resets
                        console.log('\n📋 Test 3: Multiple Resets');
                        let resetCount = 0;
                        const maxResets = 3;
                        
                        function performMultipleResets() {
                            if (resetCount < maxResets) {
                                resetCount++;
                                console.log(`   Performing reset #${resetCount}`);
                                socket.emit('resetPlayer');
                                
                                setTimeout(() => {
                                    socket.emit('getPlayerState');
                                    
                                    socket.once('playerState', (multiState) => {
                                        console.log(`   Reset #${resetCount} - Position: (${multiState.x},${multiState.y}), Velocity: (${multiState.vx},${multiState.vy})`);
                                        
                                        const isCorrect = multiState.x === 50 && multiState.y === 300 && 
                                                        multiState.vx === 0 && multiState.vy === 0;
                                        
                                        if (!isCorrect) {
                                            console.log(`   ❌ Reset #${resetCount} failed - values not reset properly`);
                                        } else {
                                            console.log(`   ✅ Reset #${resetCount} successful`);
                                        }
                                        
                                        if (resetCount < maxResets) {
                                            performMultipleResets();
                                        } else {
                                            // Final check for string doubling
                                            console.log('\n📋 Test 4: String Doubling Check');
                                            console.log(`   Final name: "${multiState.name}" (length: ${multiState.name.length})`);
                                            console.log(`   Final color: "${multiState.color}" (length: ${multiState.color.length})`);
                                            
                                            // Check for doubling patterns
                                            let hasDoubling = false;
                                            
                                            if (multiState.name.length > 20) {
                                                console.log(`   ⚠️  Name seems too long: "${multiState.name}"`);
                                                hasDoubling = true;
                                            }
                                            
                                            if (multiState.color.length > 10) {
                                                console.log(`   ⚠️  Color seems too long: "${multiState.color}"`);
                                                hasDoubling = true;
                                            }
                                            
                                            // Check for repeated patterns
                                            if (multiState.name.length > 10) {
                                                const half = Math.floor(multiState.name.length / 2);
                                                const firstHalf = multiState.name.substring(0, half);
                                                const secondHalf = multiState.name.substring(half);
                                                if (firstHalf === secondHalf) {
                                                    console.log(`   ❌ Name has repeated pattern: "${multiState.name}"`);
                                                    hasDoubling = true;
                                                }
                                            }
                                            
                                            if (multiState.color.length > 6) {
                                                const half = Math.floor(multiState.color.length / 2);
                                                const firstHalf = multiState.color.substring(0, half);
                                                const secondHalf = multiState.color.substring(half);
                                                if (firstHalf === secondHalf) {
                                                    console.log(`   ❌ Color has repeated pattern: "${multiState.color}"`);
                                                    hasDoubling = true;
                                                }
                                            }
                                            
                                            console.log('\n📊 FINAL RESULTS:');
                                            if (hasDoubling) {
                                                console.log('❌ STRING DOUBLING DETECTED!');
                                                console.log('   The reset function is causing string values to be doubled.');
                                            } else {
                                                console.log('✅ NO STRING DOUBLING DETECTED');
                                                console.log('   All reset operations are working correctly.');
                                            }
                                            
                                            socket.disconnect();
                                            resolve();
                                        }
                                    });
                                }, 50);
                            }
                        }
                        
                        performMultipleResets();
                    });
                }, 100);
            });
        });
    });
}

// Run the test
testReset().then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});