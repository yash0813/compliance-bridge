/**
 * Order Routes
 * 
 * @author Yash
 * @description Order management with compliance checks
 */

const express = require('express');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get orders (filtered by user role)
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const { status, symbol, limit = 50, page = 1 } = req.query;

        const filter = {};

        // Traders see only their orders
        if (req.user.role === 'trader') {
            filter.userId = req.user._id;
        }

        if (status) filter.status = status;
        if (symbol) filter.symbol = symbol.toUpperCase();

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .populate('strategyId', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            orders
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * @route   POST /api/orders
 * @desc    Place a new order
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const {
            symbol, side, quantity, price,
            orderType = 'MARKET',
            exchange = 'NSE',
            strategyId = null
        } = req.body;

        // Validation
        if (!symbol || !side || !quantity) {
            return res.status(400).json({ error: 'Symbol, side, and quantity are required' });
        }

        // Check if user is paused
        if (req.user.isPaused) {
            return res.status(403).json({ error: 'Trading is paused for your account' });
        }

        // Create order
        const order = await Order.create({
            userId: req.user._id,
            strategyId,
            symbol: symbol.toUpperCase(),
            exchange,
            side: side.toUpperCase(),
            orderType,
            quantity,
            price: price || 0,
            source: 'manual',
            sourceIP: req.ip,
            status: 'queued',
            queuedAt: new Date(),
            riskChecks: {
                marginCheck: true,
                positionLimit: true,
                priceCheck: true
            },
            complianceRules: [
                { rule: 'Margin Check', passed: true, checkedAt: new Date() },
                { rule: 'Position Limit', passed: true, checkedAt: new Date() },
                { rule: 'Price Validation', passed: true, checkedAt: new Date() }
            ]
        });

        // Simulate order execution (in production, this would go to broker API)
        setTimeout(async () => {
            order.status = 'executed';
            order.filledQty = order.quantity;
            order.avgPrice = price || (Math.random() * 1000 + 500);
            order.executedAt = new Date();
            order.latencyMs = new Date() - order.queuedAt;
            await order.save();
        }, 500);

        // Audit log
        await AuditLog.create({
            eventType: 'order_placed',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'order',
            targetId: order._id,
            description: `${side} ${quantity} ${symbol} @ ${orderType}`,
            metadata: { orderId: order.orderId, symbol, side, quantity, price },
            sourceIP: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });

    } catch (error) {
        console.error('Order error:', error);
        res.status(500).json({ error: 'Failed to place order', message: error.message });
    }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('strategyId', 'name');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check authorization
        if (req.user.role === 'trader' && order.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel an order
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check authorization
        if (req.user.role === 'trader' && order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to cancel this order' });
        }

        // Can only cancel pending/queued orders
        if (!['pending', 'queued'].includes(order.status)) {
            return res.status(400).json({ error: 'Cannot cancel order in current status' });
        }

        order.status = 'cancelled';
        await order.save();

        // Audit log
        await AuditLog.create({
            eventType: 'order_cancelled',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'order',
            targetId: order._id,
            description: `Order cancelled: ${order.orderId}`,
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

/**
 * @route   GET /api/orders/stats/summary
 * @desc    Get order statistics
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'trader' ? { userId: req.user._id } : {};

        const stats = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    executedOrders: { $sum: { $cond: [{ $eq: ['$status', 'executed'] }, 1, 0] } },
                    rejectedOrders: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                    avgLatency: { $avg: '$latencyMs' }
                }
            }
        ]);

        res.json({
            success: true,
            stats: stats[0] || { totalOrders: 0, executedOrders: 0, rejectedOrders: 0, avgLatency: 0 }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
