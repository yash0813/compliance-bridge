/**
 * Risk Management Service
 * 
 * @author Yash
 * @description Centralized risk validation logic
 */

const Position = require('../models/Position');
const Order = require('../models/Order');
const SystemSettings = require('../models/SystemSettings');

const validateOrder = async (user, orderDetails) => {
    const FAIL = (reason) => ({ passed: false, reason });
    const PASS = () => ({ passed: true });

    // 0. Check Global Master Kill Switch
    const systemSettings = await SystemSettings.findOne();
    if (systemSettings && systemSettings.masterKillSwitch) {
        return FAIL('Trading is halted platform-wide (Master Kill Switch active)');
    }

    // 1. Check Account Status
    if (user.isPaused) {
        return FAIL('Account is paused (Kill Switch active)');
    }
    if (!user.isActive) {
        return FAIL('Account is deactivated');
    }

    const settings = user.riskSettings || {};

    // Default safety limits if not set
    const MAX_POSITIONS = settings.maxOpenPositions || 10;
    const MAX_EXPOSURE = settings.maxExposure || 1000000;
    const MAX_ORDERS_PER_MIN = settings.maxOrdersPerMinute || 20;

    console.log(`[RiskService] Limits: MaxPos=${MAX_POSITIONS}, MaxExp=${MAX_EXPOSURE}`); // DEBUG

    // 2. Check Order Rate Limit
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentOrders = await Order.countDocuments({
        userId: user._id,
        createdAt: { $gte: oneMinuteAgo }
    });

    if (recentOrders >= MAX_ORDERS_PER_MIN) {
        return FAIL(`Order rate limit exceeded (${MAX_ORDERS_PER_MIN}/min)`);
    }

    // 3. Check Max Open Positions (Only for new positions, not exits)
    // We assume 'exit' is if we have an opposing position, but for simplicity here:
    // We'll check total net positions.
    const positions = await Position.find({ userId: user._id });
    console.log(`[RiskService] Validation - Current Positions: ${positions.length}`); // DEBUG

    // Check if symbol already exists
    const existingPos = positions.find(p => p.symbol === orderDetails.symbol);

    // If it's a new symbol and we are at limit
    if (!existingPos && positions.length >= MAX_POSITIONS) {
        return FAIL(`Max open positions limit reached (${MAX_POSITIONS})`);
    }

    // 4. Check Max Exposure
    // Calculate current exposure
    const currentExposure = positions.reduce((sum, p) => sum + (p.currentPrice * Math.abs(p.quantity)), 0);
    // Estimate new exposure
    const newExposure = orderDetails.price * orderDetails.quantity;

    if (currentExposure + newExposure > MAX_EXPOSURE) {
        return FAIL(`Max exposure limit exceeded (Limit: ₹${MAX_EXPOSURE})`);
    }

    return PASS();
};

module.exports = {
    validateOrder
};
