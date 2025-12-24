/**
 * Position Routes
 * 
 * @author Yash
 * @description Position management and P&L tracking
 */

const express = require('express');
const Position = require('../models/Position');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/positions
 * @desc    Get all positions
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const { status = 'open', symbol } = req.query;

        const filter = {};

        // Traders see only their positions
        if (req.user.role === 'trader') {
            filter.userId = req.user._id;
        }

        if (status) filter.status = status;
        if (symbol) filter.symbol = symbol.toUpperCase();

        const positions = await Position.find(filter)
            .populate('userId', 'name email')
            .populate('strategyId', 'name')
            .sort({ openedAt: -1 });

        // Calculate totals
        const totalUnrealizedPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
        const totalRealizedPnL = positions.reduce((sum, p) => sum + p.realizedPnL, 0);

        res.json({
            success: true,
            count: positions.length,
            totalUnrealizedPnL,
            totalRealizedPnL,
            positions
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch positions' });
    }
});

/**
 * @route   GET /api/positions/summary
 * @desc    Get position summary (for dashboard)
 * @access  Private
 */
router.get('/summary', protect, async (req, res) => {
    try {
        const filter = req.user.role === 'trader' ? { userId: req.user._id } : {};

        const openFilter = { ...filter, status: 'open' };

        const positions = await Position.find(openFilter);

        const summary = {
            totalPositions: positions.length,
            longPositions: positions.filter(p => p.side === 'LONG').length,
            shortPositions: positions.filter(p => p.side === 'SHORT').length,
            totalExposure: positions.reduce((sum, p) => sum + (p.avgEntryPrice * p.quantity), 0),
            unrealizedPnL: positions.reduce((sum, p) => sum + p.unrealizedPnL, 0),
            realizedPnL: positions.reduce((sum, p) => sum + p.realizedPnL, 0),
            topGainers: positions
                .filter(p => p.unrealizedPnL > 0)
                .sort((a, b) => b.unrealizedPnL - a.unrealizedPnL)
                .slice(0, 3),
            topLosers: positions
                .filter(p => p.unrealizedPnL < 0)
                .sort((a, b) => a.unrealizedPnL - b.unrealizedPnL)
                .slice(0, 3)
        };

        res.json({ success: true, summary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

/**
 * @route   POST /api/positions
 * @desc    Create a position (usually done automatically from orders)
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { symbol, side, quantity, avgEntryPrice, strategyId } = req.body;

        const position = await Position.create({
            userId: req.user._id,
            strategyId,
            symbol: symbol.toUpperCase(),
            side,
            quantity,
            avgEntryPrice,
            currentPrice: avgEntryPrice
        });

        res.status(201).json({ success: true, position });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create position' });
    }
});

/**
 * @route   PUT /api/positions/:id/close
 * @desc    Close a position
 * @access  Private
 */
router.put('/:id/close', protect, async (req, res) => {
    try {
        const { exitPrice } = req.body;
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        // Check ownership
        if (req.user.role === 'trader' && position.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        position.status = 'closed';
        position.closedAt = new Date();
        position.currentPrice = exitPrice || position.currentPrice;

        // Calculate realized P&L
        const multiplier = position.side === 'LONG' ? 1 : -1;
        position.realizedPnL = multiplier * (position.currentPrice - position.avgEntryPrice) * position.quantity;
        position.unrealizedPnL = 0;

        await position.save();

        res.json({ success: true, message: 'Position closed', position });
    } catch (error) {
        res.status(500).json({ error: 'Failed to close position' });
    }
});

/**
 * @route   PUT /api/positions/:id/update-price
 * @desc    Update current price (for P&L calculation)
 * @access  Private
 */
router.put('/:id/update-price', protect, async (req, res) => {
    try {
        const { currentPrice } = req.body;
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({ error: 'Position not found' });
        }

        position.currentPrice = currentPrice;
        await position.save();

        res.json({ success: true, position });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update price' });
    }
});

module.exports = router;
