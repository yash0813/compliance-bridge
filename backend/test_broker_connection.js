/**
 * Broker Connection Test Script
 * Run this to verify if the credentials in .env are correct.
 */
require('dotenv').config();
const brokerService = require('./services/brokerService');

async function testConnection() {
    console.log('Testing Angel One Broker Connection...');
    console.log('Client ID:', process.env.ANGEL_CLIENT_ID);

    try {
        const success = await brokerService.login();
        if (success) {
            console.log('✅ SUCCESS: Platform successfully authenticated with Angel One.');

            // Try fetching a sample LTP as a second check (e.g., NIFTY 50)
            // Note: This requires the market to be open or the API to respond with last data
            // Exchange: NSE, Symbol: NIFTY, Token: 99926000 (Example for Nifty 50)
            const ltpData = await brokerService.getLTP('NSE', 'NIFTY', '99926000');
            console.log('Sample Market Data (NIFTY):', ltpData);

            process.exit(0);
        } else {
            console.error('❌ FAILED: Authentication failed. Please check your Client ID, Password, and TOTP Secret.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ ERROR during connection test:', error.message);
        process.exit(1);
    }
}

testConnection();
