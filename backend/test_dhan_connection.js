/**
 * Dhan Broker Connection Test Script
 */
require('dotenv').config();
const brokerService = require('./services/brokerService');

async function testDhanConnection() {
    console.log('Testing DhanHQ Broker Connection...');
    console.log('Client ID:', process.env.DHAN_CLIENT_ID);

    try {
        const success = await brokerService.checkConnectivity();
        if (success) {
            console.log('✅ SUCCESS: Platform successfully authenticated with DhanHQ.');
            process.exit(0);
        } else {
            console.error('❌ FAILED: Authentication failed. Please check your Dhan Client ID and Access Token.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ ERROR during connection test:', error.message);
        process.exit(1);
    }
}

testDhanConnection();
