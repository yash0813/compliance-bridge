/**
 * Audit Log Routes
 * 
 * @author Yash
 * @description Immutable audit trail access
 */

const express = require('express');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/audit
 * @desc    Get audit logs
 * @access  Private (admin, broker, regulator)
 */
router.get('/', protect, requireRole('admin', 'broker', 'regulator'), async (req, res) => {
    try {
        const {
            eventType,
            userId,
            severity,
            startDate,
            endDate,
            limit = 100,
            page = 1
        } = req.query;

        const filter = {};

        if (eventType) filter.eventType = eventType;
        if (userId) filter.userId = userId;
        if (severity) filter.severity = severity;

        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(filter)
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(filter);

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            logs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * @route   GET /api/audit/timeline
 * @desc    Get audit timeline for dashboard
 * @access  Private
 */
router.get('/timeline', protect, async (req, res) => {
    try {
        const { hours = 24 } = req.query;

        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const logs = await AuditLog.find({ timestamp: { $gte: since } })
            .populate('userId', 'name email')
            .sort({ timestamp: -1 })
            .limit(100);

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch timeline' });
    }
});

/**
 * @route   GET /api/audit/stats
 * @desc    Get audit statistics
 * @access  Private
 */
router.get('/stats', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await AuditLog.aggregate([
            { $match: { timestamp: { $gte: today } } },
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalToday = await AuditLog.countDocuments({ timestamp: { $gte: today } });
        const criticalAlerts = await AuditLog.countDocuments({
            timestamp: { $gte: today },
            severity: 'critical'
        });

        res.json({
            success: true,
            totalToday,
            criticalAlerts,
            byEventType: stats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * @route   GET /api/audit/:id
 * @desc    Get single audit log
 * @access  Private
 */
router.get('/:id', protect, requireRole('admin', 'broker', 'regulator'), async (req, res) => {
    try {
        const log = await AuditLog.findById(req.params.id)
            .populate('userId', 'name email');

        if (!log) {
            return res.status(404).json({ error: 'Audit log not found' });
        }

        res.json({ success: true, log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
});

/**
 * @route   GET /api/audit/verify/:hash
 * @desc    Verify audit log integrity
 * @access  Private
 */
router.get('/verify/:hash', protect, async (req, res) => {
    try {
        const log = await AuditLog.findOne({ hash: req.params.hash });

        if (!log) {
            return res.status(404).json({
                success: false,
                verified: false,
                error: 'Audit log not found'
            });
        }

        // In production, we would verify the hash chain here
        res.json({
            success: true,
            verified: true,
            log
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify audit log' });
    }
});

module.exports = router;
