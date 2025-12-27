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
const riskService = require('../services/riskService');
const brokerService = require('../services/brokerService');

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

        // 1. Basic Validation
        if (!symbol || !side || !quantity) {
            return res.status(400).json({ error: 'Symbol, side, and quantity are required' });
        }

        const orderDetails = { symbol, side, quantity, price };

        // 2. Risk Engine Validation
        const riskCheck = await riskService.validateOrder(req.user, orderDetails);

        if (!riskCheck.passed) {
            // Log the rejected attempt
            await AuditLog.create({
                eventType: 'order_rejected',
                userId: req.user._id,
                userName: req.user.name,
                targetType: 'order',
                description: `Risk Block: ${riskCheck.reason}`,
                severity: 'warning',
                sourceIP: req.ip
            });

            return res.status(400).json({
                error: 'Order rejected by Risk Engine',
                reason: riskCheck.reason
            });
        }

        // 3. Create Order Record (Status: Queued)
        const order = await Order.create({
            orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
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
                { rule: 'Risk Engine Validation', passed: true, checkedAt: new Date() }
            ]
        });

        // 4. Send to Broker (Async Execution)
        // In a real system, you might await this or use a queue. 
        // We'll await it to give immediate feedback for this "Manual" trade.
        const executionResult = await brokerService.placeOrder(order);

        const Position = require('../models/Position');

        // ...

        // 5. Update Order with Result
        order.status = executionResult.status;
        if (executionResult.status === 'executed') {
            order.filledQty = executionResult.filledQty;
            order.avgPrice = executionResult.avgPrice;
            order.executedAt = executionResult.executedAt;

            // Update Position (Simple Netting for Demo)
            let position = await Position.findOne({
                userId: req.user._id,
                symbol: order.symbol,
                status: 'open'
            });

            if (position) {
                if (position.side === order.side) {
                    // Average Up
                    const totalCost = (position.avgEntryPrice * position.quantity) + (order.avgPrice * order.filledQty);
                    position.quantity += order.filledQty;
                    position.avgEntryPrice = totalCost / position.quantity;
                } else {
                    // Reduce Position (simplification: not handling flip)
                    if (order.filledQty >= position.quantity) {
                        position.status = 'closed';
                        position.quantity = 0; // Fully closed
                        position.closedAt = new Date();
                    } else {
                        position.quantity -= order.filledQty;
                    }
                }
                position.currentPrice = order.avgPrice; // Update mark-to-market
                await position.save();
            } else {
                // Open new position
                await Position.create({
                    userId: req.user._id,
                    symbol: order.symbol,
                    side: order.side === 'BUY' ? 'LONG' : 'SHORT', // Map BUY/SELL to LONG/SHORT
                    quantity: order.filledQty,
                    avgEntryPrice: order.avgPrice,
                    currentPrice: order.avgPrice,
                    status: 'open',
                    exchange: order.exchange,
                    entryOrderId: order._id
                });
            }

        } else {
            order.rejectionReason = executionResult.rejectionReason;
        }

        order.latencyMs = new Date() - order.queuedAt;
        await order.save();

        // 6. Audit Log
        const logType = order.status === 'executed' ? 'order_placed' : 'order_rejected';
        await AuditLog.create({
            eventType: logType,
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'order',
            targetId: order._id,
            description: `${order.status.toUpperCase()}: ${side} ${quantity} ${symbol}`,
            metadata: { orderId: order.orderId, price: order.avgPrice },
            sourceIP: req.ip
        });

        res.status(201).json({
            success: true,
            message: order.status === 'executed' ? 'Order executed successfully' : 'Order rejected by broker',
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
