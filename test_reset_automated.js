const io = require('socket.io-client');

// Test configuration
const SERVER_URL = 'http://localhost:5111';
const TEST_ITERATIONS = 10;

class ResetTester {
    constructor() {
        this.socket = null;
        this.testResults = [];
        this.currentTest = 0;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.socket = io(SERVER_URL);
            
            this.socket.on('connect', () => {
                console.log('✅ Connected to server');
                this.socket.emit('newPlayer', 'AutoTestPlayer');
                resolve();
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('❌ Connection failed:', error);
                reject(error);
            });
        });
    }

    async testResetFunctionality() {
        console.log('🧪 Starting automated reset tests...\n');
        
        // Test 1: Single reset
        await this.testSingleReset();
        
        // Test 2: Multiple consecutive resets
        await this.testMultipleResets();
        
        // Test 3: Reset with movement
        await this.testResetWithMovement();
        
        // Test 4: String value integrity
        await this.testStringIntegrity();
        
        this.printResults();
    }

    async testSingleReset() {
        console.log('📋 Test 1: Single Reset');
        
        // Get initial state
        const initialState = await this.getPlayerState();
        console.log(`   Initial state: x=${initialState.x}, y=${initialState.y}, vx=${initialState.vx}, vy=${initialState.vy}`);
        
        // Perform reset
        this.socket.emit('resetPlayer');
        
        // Wait and check result
        await this.wait(100);
        const finalState = await this.getPlayerState();
        
        const expected = { x: 50, y: 300, vx: 0, vy: 0 };
        const isCorrect = this.compareStates(finalState, expected);
        
        this.testResults.push({
            test: 'Single Reset',
            passed: isCorrect,
            expected: expected,
            actual: finalState
        });
        
        console.log(`   Final state: x=${finalState.x}, y=${finalState.y}, vx=${finalState.vx}, vy=${finalState.vy}`);
        console.log(`   Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    async testMultipleResets() {
        console.log('📋 Test 2: Multiple Consecutive Resets');
        
        const resetCount = 5;
        let allCorrect = true;
        
        for (let i = 0; i < resetCount; i++) {
            this.socket.emit('resetPlayer');
            await this.wait(50);
            
            const state = await this.getPlayerState();
            const expected = { x: 50, y: 300, vx: 0, vy: 0 };
            const isCorrect = this.compareStates(state, expected);
            
            if (!isCorrect) {
                allCorrect = false;
                console.log(`   Reset ${i + 1}: ❌ FAIL - Expected (50,300,0,0), got (${state.x},${state.y},${state.vx},${state.vy})`);
            } else {
                console.log(`   Reset ${i + 1}: ✅ PASS`);
            }
        }
        
        this.testResults.push({
            test: 'Multiple Resets',
            passed: allCorrect,
            expected: { x: 50, y: 300, vx: 0, vy: 0 },
            actual: await this.getPlayerState()
        });
        
        console.log(`   Overall Result: ${allCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    async testResetWithMovement() {
        console.log('📋 Test 3: Reset After Movement');
        
        // Move player to different position
        this.socket.emit('move', { x: 200, y: 250 });
        await this.wait(100);
        
        const movedState = await this.getPlayerState();
        console.log(`   After movement: x=${movedState.x}, y=${movedState.y}`);
        
        // Perform reset
        this.socket.emit('resetPlayer');
        await this.wait(100);
        
        const resetState = await this.getPlayerState();
        const expected = { x: 50, y: 300, vx: 0, vy: 0 };
        const isCorrect = this.compareStates(resetState, expected);
        
        this.testResults.push({
            test: 'Reset After Movement',
            passed: isCorrect,
            expected: expected,
            actual: resetState
        });
        
        console.log(`   After reset: x=${resetState.x}, y=${resetState.y}, vx=${resetState.vx}, vy=${resetState.vy}`);
        console.log(`   Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    async testStringIntegrity() {
        console.log('📋 Test 4: String Value Integrity');
        
        const state = await this.getPlayerState();
        const stringFields = ['name', 'color'];
        let hasDoubling = false;
        let doublingDetails = [];
        
        stringFields.forEach(field => {
            if (state[field] && typeof state[field] === 'string') {
                const value = state[field];
                
                // Check for suspiciously long strings
                if (value.length > 50) {
                    hasDoubling = true;
                    doublingDetails.push(`${field}: "${value}" (too long)`);
                }
                
                // Check for repeated patterns
                if (value.length > 10) {
                    const half = Math.floor(value.length / 2);
                    const firstHalf = value.substring(0, half);
                    const secondHalf = value.substring(half);
                    if (firstHalf === secondHalf) {
                        hasDoubling = true;
                        doublingDetails.push(`${field}: "${value}" (repeated pattern)`);
                    }
                }
            }
        });
        
        this.testResults.push({
            test: 'String Integrity',
            passed: !hasDoubling,
            expected: 'No doubling',
            actual: hasDoubling ? doublingDetails.join(', ') : 'No doubling detected'
        });
        
        console.log(`   Name: "${state.name}"`);
        console.log(`   Color: "${state.color}"`);
        console.log(`   Result: ${!hasDoubling ? '✅ PASS' : '❌ FAIL'}`);
        if (hasDoubling) {
            console.log(`   Doubling detected: ${doublingDetails.join(', ')}`);
        }
        console.log('');
    }

    async getPlayerState() {
        return new Promise((resolve) => {
            this.socket.emit('getPlayerState');
            
            const timeout = setTimeout(() => {
                resolve({ x: 0, y: 0, vx: 0, vy: 0, name: '', color: '' });
            }, 1000);
            
            this.socket.once('playerState', (state) => {
                clearTimeout(timeout);
                resolve(state);
            });
        });
    }

    compareStates(actual, expected) {
        return actual.x === expected.x && 
               actual.y === expected.y && 
               actual.vx === expected.vx && 
               actual.vy === expected.vy;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    printResults() {
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('========================');
        
        let passedTests = 0;
        let totalTests = this.testResults.length;
        
        this.testResults.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} - ${result.test}`);
            
            if (!result.passed) {
                console.log(`   Expected: ${JSON.stringify(result.expected)}`);
                console.log(`   Actual: ${JSON.stringify(result.actual)}`);
            }
            
            if (result.passed) passedTests++;
        });
        
        console.log('\n========================');
        console.log(`Overall: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! No doubling issues detected.');
        } else {
            console.log('⚠️  Some tests failed. Potential doubling issues detected.');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            console.log('🔌 Disconnected from server');
        }
    }
}

// Run the tests
async function runTests() {
    const tester = new ResetTester();
    
    try {
        await tester.connect();
        await tester.testResetFunctionality();
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        tester.disconnect();
        process.exit(0);
    }
}

// Add custom event handler to server for testing
console.log('🚀 Starting automated reset tests...');
runTests();