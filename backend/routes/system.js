const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');
const brokerService = require('../services/brokerService');

/**
 * @route   GET /api/system/settings
 * @desc    Get global system settings
 * @access  Private
 */
router.get('/settings', protect, async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

/**
 * @route   POST /api/system/kill-switch
 * @desc    Toggle master kill switch
 * @access  Private (admin, broker)
 */
router.post('/kill-switch', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const { active } = req.body;
        let settings = await SystemSettings.findOne();
        if (!settings) settings = await SystemSettings.create({});

        settings.masterKillSwitch = active;
        settings.lastUpdatedBy = req.user._id;
        await settings.save();

        await AuditLog.create({
            eventType: active ? 'kill_switch_activated' : 'kill_switch_deactivated',
            userId: req.user._id,
            userName: req.user.name,
            description: `Master Kill Switch ${active ? 'ACTIVATED' : 'DEACTIVATED'} by ${req.user.name}`,
            severity: 'critical'
        });

        res.json({ success: true, masterKillSwitch: active });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});


/**
 * @route   POST /api/system/broker-login
 * @desc    Manual trigger for broker session login
 * @access  Private (admin, broker)
 */
router.post('/broker-login', protect, requireRole('admin', 'broker'), async (req, res) => {
    try {
        const success = await brokerService.login();
        if (success) {
            await AuditLog.create({
                eventType: 'login',
                userId: req.user._id,
                userName: req.user.name,
                description: `Broker API Session manually authenticated by ${req.user.name}`,
                severity: 'info'
            });
            res.json({ success: true, message: 'Broker login successful' });
        } else {
            res.status(400).json({ success: false, error: 'Broker login failed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/system/broker-status
 * @desc    Get current broker connection status
 * @access  Private (admin, broker)
 */
router.get('/broker-status', protect, requireRole('admin', 'broker'), async (req, res) => {
    const statusInfo = await brokerService.checkConnectivity();
    res.json({
        success: true,
        mode: process.env.TRADING_MODE || 'PAPER',
        isLoggedIn: !!statusInfo,
        margin: statusInfo ? {
            available: statusInfo.availableMargin,
            utilized: statusInfo.utilizedMargin
        } : null
    });
});

module.exports = router;
