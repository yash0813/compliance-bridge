/**
 * Strategy Model
 * 
 * @author Yash
 * @description Trading strategy schema with certification and versioning
 */

const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
    // Basic info
    name: {
        type: String,
        required: [true, 'Strategy name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Classification (SEBI compliance)
    type: {
        type: String,
        enum: ['White Box', 'Black Box', 'Grey Box'],
        default: 'White Box'
    },
    disclosureLevel: {
        type: String,
        enum: ['Full', 'Partial', 'None'],
        default: 'Full'
    },
    // Certification status
    certification: {
        status: {
            type: String,
            enum: ['certified', 'under-review', 'unverified', 'rejected'],
            default: 'unverified'
        },
        certifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        certifiedAt: {
            type: Date,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    // Versioning
    version: {
        type: String,
        default: '1.0.0'
    },
    versionHistory: [{
        version: String,
        releasedAt: Date,
        changelog: String,
        tradeCount: { type: Number, default: 0 }
    }],
    // Performance metrics
    metrics: {
        totalTrades: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
        profitFactor: { type: Number, default: 0 },
        maxDrawdown: { type: Number, default: 0 },
        sharpeRatio: { type: Number, default: 0 },
        totalPnL: { type: Number, default: 0 }
    },
    // Risk settings
    riskSettings: {
        maxPositionSize: { type: Number, default: 100 },
        maxLossPerTrade: { type: Number, default: 5000 },
        maxDailyLoss: { type: Number, default: 25000 },
        maxOpenPositions: { type: Number, default: 5 }
    },
    // Trading settings
    tradingPairs: [{
        type: String
    }],
    exchange: {
        type: String,
        enum: ['NSE', 'BSE', 'MCX', 'NFO'],
        default: 'NSE'
    },
    executionWindow: {
        startTime: { type: String, default: '09:15' },
        endTime: { type: String, default: '15:30' }
    },
    capitalAllocation: {
        type: Number,
        default: 100000
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    isPaused: {
        type: Boolean,
        default: false
    },
    // Timestamps
    lastTradeAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
strategySchema.index({ userId: 1 });
strategySchema.index({ 'certification.status': 1 });

module.exports = mongoose.model('Strategy', strategySchema);
