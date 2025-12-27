/**
 * Broker Integration Service
 * 
 * @author Yash
 * @description Adapter pattern for broker interactions (Dhan, Zerodha, etc.)
 */

// Environment variable to toggle mode
const TRADING_MODE = process.env.TRADING_MODE || 'LIVE'; // Default to LIVE per user request

const placeOrder = async (order) => {
    console.log(`[BrokerService] Placing order in ${TRADING_MODE} mode:`, order.orderId);

    if (TRADING_MODE === 'LIVE') {
        // TODO: Integrate actual Broker API calls here
        // const response = await axios.post('https://api.dhan.co/orders', ...);
        // return response.data;

        // For now, even in LIVE mode, we simulate success but log a warning
        console.warn('!!! LIVE TRADING ENABLED BUT BROKER API NOT CONFIGURED !!!');
        console.warn('Simulating execution for safety.');
        return simulateExecution(order);
    } else {
        return simulateExecution(order);
    }
};

const simulateExecution = (order) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const isSuccess = Math.random() > 0.05; // 5% chance of rejection in simulation

            if (isSuccess) {
                resolve({
                    status: 'executed',
                    filledQty: order.quantity,
                    avgPrice: order.price || (Math.random() * 1000 + 100), // Mock price
                    exchangeOrderId: `EX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    executedAt: new Date()
                });
            } else {
                resolve({
                    status: 'rejected',
                    rejectionReason: 'Simulated exchange rejection (Price out of range)',
                    executedAt: new Date()
                });
            }
        }, 300); // 300ms latency
    });
};

module.exports = {
    placeOrder
};
