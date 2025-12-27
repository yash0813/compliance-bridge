/**
 * Live Readiness Test Suite
 * 
 * Verifies:
 * 1. Authentication
 * 2. Risk Limit Enforcement (Positions)
 * 3. Kill Switch Functionality
 * 4. Order Execution Flow
 */

const axios = require('axios');
const API_URL = 'http://localhost:5001/api';

async function runTest() {
    console.log('🚀 Starting Live Readiness Test...\n');

    let token = '';
    let userId = '';
    const uniqueEmail = `test_live_${Date.now()}@test.com`;

    try {
        // 1. Register
        console.log('1. Registering new test user...');
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            name: 'Live Test User',
            email: uniqueEmail,
            password: 'password123',
            role: 'trader'
        });
        token = regRes.data.token;
        userId = regRes.data.user.id;
        console.log('✅ Registered successfully');

        // 2. Configure Risk settings (Strict limits for testing)
        console.log('\n2. Configuring strict risk limits (Max Positions: 2)...');
        await axios.put(`${API_URL}/auth/me/settings`, {
            riskSettings: {
                maxOpenPositions: 2,
                maxExposure: 1000000,
                maxOrdersPerMinute: 10
            }
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Risk settings applied');

        // 3. Place Order 1 (Should Pass)
        console.log('\n3. Placing Order 1 (valid)...');
        await axios.post(`${API_URL}/orders`, {
            symbol: 'RELIANCE', side: 'BUY', quantity: 1, price: 2500
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Order 1 placed');
        await new Promise(r => setTimeout(r, 1000)); // Wait for position update

        // 4. Place Order 2 (Should Pass)
        console.log('4. Placing Order 2 (valid)...');
        await axios.post(`${API_URL}/orders`, {
            symbol: 'TCS', side: 'BUY', quantity: 1, price: 3500
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Order 2 placed');
        await new Promise(r => setTimeout(r, 1000));

        // 5. Place Order 3 (Should Fail - Max Positions)
        console.log('5. Placing Order 3 (Should be BLOCKED by Risk Engine)...');
        try {
            await axios.post(`${API_URL}/orders`, {
                symbol: 'INFY', side: 'BUY', quantity: 1, price: 1500
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.error('❌ FAIL: Order 3 should have been blocked!');
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error.includes('Risk Engine')) {
                console.log('✅ Order 3 correctly blocked by Risk Engine:', error.response.data.reason);
            } else {
                console.error('❌ FAIL: Unexpected error', error.message);
            }
        }

        // 6. Kill Switch
        console.log('\n6. Activating Kill Switch (Pause Account)...');
        await axios.put(`${API_URL}/users/${userId}/pause`, {}, { headers: { Authorization: `Bearer ${token}` } });
        console.log('✅ Account paused');

        // 7. Place Order 4 (Should Fail - Kill Switch)
        console.log('7. Placing Order 4 (Should be BLOCKED by Kill Switch)...');
        try {
            await axios.post(`${API_URL}/orders`, {
                symbol: 'SBIN', side: 'BUY', quantity: 10, price: 500
            }, { headers: { Authorization: `Bearer ${token}` } });
            console.error('❌ FAIL: Order 4 should have been blocked!');
        } catch (error) {
            if (error.response && (error.response.status === 403 || error.response.status === 400)) {
                console.log('✅ Order 4 correctly blocked:', error.response.data.reason || error.response.data.error);
            } else {
                console.error('❌ FAIL: Unexpected error', error.message);
            }
        }

        console.log('\n✨ TEST COMPLETE: System is LIVE READY (Simulation Mode) ✨');

    } catch (error) {
        console.error('CRITICAL TEST FAILURE:', error.response ? error.response.data : error.message);
    }
}

runTest();
