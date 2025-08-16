const io = require('socket.io-client');

console.log('🧪 Testing Reset Scenarios with Debug Logs...\n');

class ResetScenarioTester {
    constructor() {
        this.socket = null;
        this.testResults = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.socket = io('http://localhost:5111');
            
            this.socket.on('connect', () => {
                console.log('✅ Connected to server');
                resolve();
            });
            
            this.socket.on('connect_error', (error) => {
                console.error('❌ Connection failed:', error);
                reject(error);
            });
        });
    }

    async testScenario(scenarioName, testFunction) {
        console.log(`\n🎯 Testing Scenario: ${scenarioName}`);
        console.log('=' .repeat(50));
        
        try {
            await testFunction();
            console.log(`✅ Scenario ${scenarioName} completed successfully`);
        } catch (error) {
            console.error(`❌ Scenario ${scenarioName} failed:`, error);
        }
    }

    async testGameStart() {
        console.log('🎮 Testing Game Start Scenario');
        
        // Create player
        this.socket.emit('newPlayer', 'TestPlayer_Start');
        await this.wait(200);
        
        // Simulate game start reset
        console.log('🔄 Simulating game start reset...');
        this.socket.emit('resetPlayer', 'game_start');
        await this.wait(200);
        
        // Check state
        this.socket.emit('getPlayerState');
        await this.wait(100);
    }

    async testDeathRespawn() {
        console.log('💀 Testing Death Respawn Scenario');
        
        // Simulate death reset
        console.log('🔄 Simulating death respawn...');
        this.socket.emit('resetPlayer', 'death_respawn');
        await this.wait(200);
        
        // Check state
        this.socket.emit('getPlayerState');
        await this.wait(100);
    }

    async testVictoryRestart() {
        console.log('🏆 Testing Victory Restart Scenario');
        
        // Simulate victory reset
        console.log('🔄 Simulating victory restart...');
        this.socket.emit('resetPlayer', 'victory_restart');
        await this.wait(200);
        
        // Check state
        this.socket.emit('getPlayerState');
        await this.wait(100);
    }

    async testMultipleResets() {
        console.log('🔄 Testing Multiple Resets Scenario');
        
        const resetReasons = ['test_1', 'test_2', 'test_3', 'test_4', 'test_5'];
        
        for (let i = 0; i < resetReasons.length; i++) {
            console.log(`   Performing reset ${i + 1}/${resetReasons.length} with reason: ${resetReasons[i]}`);
            this.socket.emit('resetPlayer', resetReasons[i]);
            await this.wait(100);
        }
        
        // Final check
        this.socket.emit('getPlayerState');
        await this.wait(100);
    }

    async testStringIntegrity() {
        console.log('🔍 Testing String Integrity After Multiple Resets');
        
        // Perform multiple resets
        for (let i = 0; i < 3; i++) {
            this.socket.emit('resetPlayer', `integrity_test_${i}`);
            await this.wait(100);
        }
        
        // Check final state
        this.socket.emit('getPlayerState');
        await this.wait(100);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            console.log('🔌 Disconnected from server');
        }
    }
}

// Run all scenarios
async function runAllScenarios() {
    const tester = new ResetScenarioTester();
    
    try {
        await tester.connect();
        
        // Test all scenarios
        await tester.testScenario('Game Start', () => tester.testGameStart());
        await tester.testScenario('Death Respawn', () => tester.testDeathRespawn());
        await tester.testScenario('Victory Restart', () => tester.testVictoryRestart());
        await tester.testScenario('Multiple Resets', () => tester.testMultipleResets());
        await tester.testScenario('String Integrity', () => tester.testStringIntegrity());
        
        console.log('\n🎉 All scenarios completed!');
        console.log('📊 Check the server logs above for detailed debug information');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        tester.disconnect();
        process.exit(0);
    }
}

// Start testing
runAllScenarios();