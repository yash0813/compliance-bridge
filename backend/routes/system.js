const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const { protect, requireRole } = require('../middleware/auth');

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

module.exports = router;
