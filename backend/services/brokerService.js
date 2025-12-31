/**
 * Broker Integration Service - Dhan (DhanHQ)
 * 
 * @author Yash
 * @description Adapter for DhanHQ API integration.
 * Supports order placement, fetching positions, and live price monitoring.
 * Dhan uses a permanent Access Token or API Key, which is much more stable.
 */

const axios = require('axios');

// Environment variables
const TRADING_MODE = process.env.TRADING_MODE || 'PAPER';
const DHAN_CLIENT_ID = process.env.DHAN_CLIENT_ID;
const DHAN_ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN;

// API Base URL
const DHAN_BASE_URL = 'https://api.dhan.co';

// Common Instrument Mapping (NSE EQ)
// In production, this should be synced from Dhan's instrument list CSV/API
const INSTRUMENT_MAP = {
    'RELIANCE': '2885',
    'HDFCBANK': '1333',
    'INFY': '1594',
    'TCS': '11536',
    'ICICIBANK': '4963',
    'SBIN': '3045',
    'TATASTEEL': '3499',
    'ZOMATO': '5097'
};

/**
 * Fetch Account Summary / Connectivity Check
 */
const checkConnectivity = async () => {
    if (!DHAN_CLIENT_ID || !DHAN_ACCESS_TOKEN) {
        console.warn('[BrokerService] Missing Dhan credentials in .env');
        return false;
    }

    try {
        console.log('[BrokerService] Checking Dhan connectivity...');
        const response = await axios.get(`${DHAN_BASE_URL}/fundlimit`, {
            headers: {
                'access-token': DHAN_ACCESS_TOKEN,
                'client-id': DHAN_CLIENT_ID,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.status === 200) {
            console.log('[BrokerService] Dhan Connected Successfully');
            // Return connectivity status + current margin info
            return {
                connected: true,
                availableMargin: response.data.availabelBalance || 0,
                utilizedMargin: response.data.utilizedAmount || 0
            };
        }
        return false;
    } catch (error) {
        console.error('[BrokerService] Connectivity Error:', error.response?.data || error.message);
        return false;
    }
};

/**
 * Fetch Last Traded Price (LTP) via Dhan
 * Note: Dhan uses securityId for instruments
 */
const getLTP = async (exchange, symbol, securityId) => {
    if (TRADING_MODE !== 'LIVE' || !DHAN_ACCESS_TOKEN) {
        return { ltp: Math.random() * 1000 + 100 };
    }

    try {
        const secId = securityId || INSTRUMENT_MAP[symbol] || '';
        // Dhan's quote API
        const response = await axios.post(`${DHAN_BASE_URL}/marketfeed/ltp`, {
            instruments: [{
                exchangeSegment: exchange === 'NSE' ? 'NSE_EQ' : (exchange || 'NSE_EQ'),
                securityId: secId
            }]
        }, {
            headers: {
                'access-token': DHAN_ACCESS_TOKEN,
                'client-id': DHAN_CLIENT_ID
            }
        });

        if (response.data && response.data.data && response.data.data[0]) {
            return { ltp: response.data.data[0].lastPrice || 0 };
        }
        return { ltp: 0 };
    } catch (error) {
        console.error('[BrokerService] LTP Fetch Error:', error.response?.data || error.message);
        return { ltp: 0 };
    }
};

/**
 * Place order with Dhan
 */
const placeOrder = async (order) => {
    console.log(`[BrokerService] Placing order in ${TRADING_MODE} mode via Dhan:`, order.orderId);

    if (TRADING_MODE !== 'LIVE') {
        return simulateExecution(order);
    }

    try {
        // Map our order to Dhan format
        const securityId = order.metadata?.securityId || INSTRUMENT_MAP[order.symbol] || '';

        if (!securityId) {
            console.warn(`[BrokerService] No securityId found for symbol: ${order.symbol}`);
        }

        const dhanOrder = {
            dhanClientId: DHAN_CLIENT_ID,
            correlationId: order.orderId,
            transactionType: order.side, // BUY or SELL
            exchangeSegment: order.metadata?.exchangeSegment || 'NSE_EQ',
            productType: 'INTRADAY',
            orderType: order.price ? 'LIMIT' : 'MARKET',
            validity: 'DAY',
            securityId: securityId,
            quantity: order.quantity,
            price: order.price || 0
        };

        const response = await axios.post(`${DHAN_BASE_URL}/orders`, dhanOrder, {
            headers: {
                'access-token': DHAN_ACCESS_TOKEN,
                'client-id': DHAN_CLIENT_ID,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.status === 'success') {
            return {
                status: 'executed',
                filledQty: order.quantity,
                avgPrice: order.price || 0,
                exchangeOrderId: response.data.orderId,
                executedAt: new Date()
            };
        } else {
            return {
                status: 'rejected',
                rejectionReason: response.data.remarks || 'Dhan exchange rejection',
                executedAt: new Date()
            };
        }
    } catch (error) {
        console.error('[BrokerService] Dhan Execution Error:', error.response?.data || error.message);
        return {
            status: 'rejected',
            rejectionReason: 'Dhan API Connection Error',
            executedAt: new Date()
        };
    }
};

const simulateExecution = (order) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const isSuccess = Math.random() > 0.05;
            if (isSuccess) {
                resolve({
                    status: 'executed',
                    filledQty: order.quantity,
                    avgPrice: order.price || (Math.random() * 1000 + 100),
                    exchangeOrderId: `DHAN-SIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    executedAt: new Date()
                });
            } else {
                resolve({
                    status: 'rejected',
                    rejectionReason: 'Simulated Dhan rejection',
                    executedAt: new Date()
                });
            }
        }, 300);
    });
};

const isAuthenticated = () => {
    return !!DHAN_ACCESS_TOKEN;
};

module.exports = {
    checkConnectivity,
    getLTP,
    placeOrder,
    isAuthenticated,
    // Keep login for backward compatibility with frontend status
    login: checkConnectivity
};
