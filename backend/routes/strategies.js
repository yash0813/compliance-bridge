/**
 * Strategy Routes
 * 
 * @author Yash
 * @description Strategy management with certification workflow
 */

const express = require('express');
const Strategy = require('../models/Strategy');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/strategies
 * @desc    Get all strategies
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const { status, type } = req.query;

        const filter = {};

        // Traders see only their strategies
        if (req.user.role === 'trader') {
            filter.userId = req.user._id;
        }

        if (status) filter['certification.status'] = status;
        if (type) filter.type = type;

        const strategies = await Strategy.find(filter)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: strategies.length,
            strategies
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch strategies' });
    }
});

/**
 * @route   POST /api/strategies
 * @desc    Create a new strategy
 * @access  Private (traders)
 */
router.post('/', protect, async (req, res) => {
    try {
        const {
            name, description, type = 'White Box',
            tradingPairs = [], exchange = 'NSE',
            riskSettings = {}
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Strategy name is required' });
        }

        const strategy = await Strategy.create({
            name,
            description,
            userId: req.user._id,
            type,
            disclosureLevel: type === 'White Box' ? 'Full' : type === 'Black Box' ? 'None' : 'Partial',
            tradingPairs,
            exchange,
            riskSettings: {
                maxPositionSize: riskSettings.maxPositionSize || 100,
                maxLossPerTrade: riskSettings.maxLossPerTrade || 5000,
                maxDailyLoss: riskSettings.maxDailyLoss || 25000,
                maxOpenPositions: riskSettings.maxOpenPositions || 5
            },
            versionHistory: [{
                version: '1.0.0',
                releasedAt: new Date(),
                changelog: 'Initial version',
                tradeCount: 0
            }]
        });

        // Audit log
        await AuditLog.create({
            eventType: 'strategy_created',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'strategy',
            targetId: strategy._id,
            targetName: strategy.name,
            description: `Strategy created: ${name}`,
            sourceIP: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Strategy created successfully',
            strategy
        });

    } catch (error) {
        console.error('Strategy error:', error);
        res.status(500).json({ error: 'Failed to create strategy' });
    }
});

/**
 * @route   GET /api/strategies/:id
 * @desc    Get single strategy
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const strategy = await Strategy.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('certification.certifiedBy', 'name');

        if (!strategy) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        res.json({ success: true, strategy });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch strategy' });
    }
});

/**
 * @route   PUT /api/strategies/:id
 * @desc    Update a strategy
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
    try {
        const strategy = await Strategy.findById(req.params.id);

        if (!strategy) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        // Check ownership
        if (req.user.role === 'trader' && strategy.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this strategy' });
        }

        const { name, description, tradingPairs, riskSettings, isActive, isPaused } = req.body;

        if (name) strategy.name = name;
        if (description) strategy.description = description;
        if (tradingPairs) strategy.tradingPairs = tradingPairs;
        if (riskSettings) strategy.riskSettings = { ...strategy.riskSettings, ...riskSettings };
        if (isActive !== undefined) strategy.isActive = isActive;
        if (isPaused !== undefined) strategy.isPaused = isPaused;

        await strategy.save();

        // Audit log
        await AuditLog.create({
            eventType: 'strategy_updated',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'strategy',
            targetId: strategy._id,
            targetName: strategy.name,
            description: `Strategy updated: ${strategy.name}`,
            sourceIP: req.ip
        });

        res.json({ success: true, strategy });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update strategy' });
    }
});

/**
 * @route   PUT /api/strategies/:id/certify
 * @desc    Certify a strategy (broker/admin only)
 * @access  Private
 */
router.put('/:id/certify', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const strategy = await Strategy.findById(req.params.id);

        if (!strategy) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        strategy.certification = {
            status: 'certified',
            certifiedBy: req.user._id,
            certifiedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            rejectionReason: null
        };

        await strategy.save();

        // Audit log
        await AuditLog.create({
            eventType: 'strategy_certified',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'strategy',
            targetId: strategy._id,
            targetName: strategy.name,
            description: `Strategy certified: ${strategy.name}`,
            severity: 'info',
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'Strategy certified', strategy });
    } catch (error) {
        res.status(500).json({ error: 'Failed to certify strategy' });
    }
});

/**
 * @route   PUT /api/strategies/:id/reject
 * @desc    Reject a strategy (broker/admin only)
 * @access  Private
 */
router.put('/:id/reject', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const { reason } = req.body;
        const strategy = await Strategy.findById(req.params.id);

        if (!strategy) {
            return res.status(404).json({ error: 'Strategy not found' });
        }

        strategy.certification = {
            status: 'rejected',
            certifiedBy: null,
            certifiedAt: null,
            expiresAt: null,
            rejectionReason: reason || 'Did not meet compliance requirements'
        };

        await strategy.save();

        res.json({ success: true, message: 'Strategy rejected', strategy });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject strategy' });
    }
});

module.exports = router;
