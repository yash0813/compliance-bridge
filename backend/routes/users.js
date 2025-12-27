/**
 * User Management Routes
 * 
 * @author Yash
 * @description CRUD operations for users (admin only)
 */

const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (admin/broker only)
 * @access  Private
 */
router.get('/', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const { role, isActive } = req.query;

        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users: users.map(u => u.toPublicJSON())
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

/**
 * @route   PUT /api/users/:id/block
 * @desc    Block a user (admin only)
 * @access  Private
 */
router.put('/:id/block', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = false;
        await user.save();

        // Audit log
        await AuditLog.create({
            eventType: 'user_blocked',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'user',
            targetId: user._id,
            targetName: user.name,
            description: `User blocked: ${user.email}`,
            severity: 'warning',
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to block user' });
    }
});

/**
 * @route   PUT /api/users/:id/unblock
 * @desc    Unblock a user (admin only)
 * @access  Private
 */
router.put('/:id/unblock', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = true;
        await user.save();

        // Audit log
        await AuditLog.create({
            eventType: 'user_unblocked',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'user',
            targetId: user._id,
            targetName: user.name,
            description: `User unblocked: ${user.email}`,
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unblock user' });
    }
});

/**
 * @route   PUT /api/users/:id/pause
 * @desc    Pause user trading (Self or Admin/Broker)
 * @access  Private
 */
router.put('/:id/pause', protect, async (req, res) => {
    try {
        // Allow if admin/broker OR if pausing self
        if (req.user.role !== 'admin' && req.user.role !== 'broker' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: 'Not authorized to pause this account' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isPaused = true;
        await user.save();

        // Audit Log
        await AuditLog.create({
            eventType: 'account_paused',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'user',
            targetId: user._id,
            description: `Account paused (Kill Switch triggered)`,
            severity: 'critical',
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'Account trading paused successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to pause user' });
    }
});

/**
 * @route   PUT /api/users/:id/resume
 * @desc    Resume user trading
 * @access  Private
 */
router.put('/:id/resume', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isPaused = false;
        await user.save();

        res.json({ success: true, message: 'User trading resumed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resume user' });
    }
});

module.exports = router;
