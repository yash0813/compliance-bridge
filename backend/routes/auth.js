/**
 * Authentication Routes
 * 
 * @author Yash
 * @description Login, register, and token management
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Generate JWT Token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['trader', 'broker', 'admin', 'regulator'])
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role = 'trader' } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role
        });

        // Log the registration
        await AuditLog.create({
            eventType: 'user_created',
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            targetType: 'user',
            targetId: user._id,
            description: `New ${role} account created: ${email}`,
            sourceIP: req.ip
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            user: user.toPublicJSON(),
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user with password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated. Contact admin.' });
        }

        // Update login stats
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        // Log the login
        await AuditLog.create({
            eventType: 'login',
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            targetType: 'user',
            targetId: user._id,
            description: `User logged in: ${user.email}`,
            sourceIP: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            user: user.toPublicJSON(),
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            user: user.toPublicJSON()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal, but we log it)
 * @access  Private
 */
router.post('/logout', protect, async (req, res) => {
    try {
        await AuditLog.create({
            eventType: 'logout',
            userId: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            targetType: 'user',
            targetId: req.user._id,
            description: `User logged out: ${req.user.email}`,
            sourceIP: req.ip
        });

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * @route   POST /api/auth/me/ips
 * @desc    Add a static IP to whitelist
 * @access  Private
 */
router.post('/me/ips', protect, [
    body('ip').isIP().withMessage('Please enter a valid IP address'),
    body('label').notEmpty().withMessage('Label is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ip, label, location } = req.body;
        const user = await User.findById(req.user._id);

        // Check duplicates
        if (user.whitelistedIPs.some(i => i.ip === ip)) {
            return res.status(400).json({ error: 'IP already whitelisted' });
        }

        user.whitelistedIPs.push({
            ip,
            label,
            location: location || 'Unknown',
            verified: false // Requires manual/admin verification in real app
        });

        await user.save();

        await AuditLog.create({
            eventType: 'security_update',
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            description: `Added IP to whitelist: ${ip}`,
            sourceIP: req.ip
        });

        res.json({ success: true, ips: user.whitelistedIPs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add IP' });
    }
});

/**
 * @route   DELETE /api/auth/me/ips/:ipId
 * @desc    Remove a static IP from whitelist
 * @access  Private
 */
router.delete('/me/ips/:ipId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.whitelistedIPs = user.whitelistedIPs.filter(
            ip => ip._id.toString() !== req.params.ipId
        );

        await user.save();

        await AuditLog.create({
            eventType: 'security_update',
            userId: user._id,
            userName: user.name,
            userRole: user.role,
            description: `Removed IP from whitelist`,
            sourceIP: req.ip
        });

        res.json({ success: true, ips: user.whitelistedIPs });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove IP' });
    }
});

module.exports = router;
