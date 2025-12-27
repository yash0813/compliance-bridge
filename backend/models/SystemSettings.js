const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    masterKillSwitch: {
        type: Boolean,
        default: false
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    systemMessage: {
        type: String,
        default: ''
    },
    tradingAvailability: {
        startTime: { type: String, default: '09:15' },
        endTime: { type: String, default: '15:30' }
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
