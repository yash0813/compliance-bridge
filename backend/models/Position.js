/**
 * Position Model
 * 
 * @author Yash
 * @description Open trading positions for P&L tracking
 */

const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    strategyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy',
        default: null
    },
    // Position details
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    exchange: {
        type: String,
        enum: ['NSE', 'BSE', 'MCX', 'NFO'],
        default: 'NSE'
    },
    side: {
        type: String,
        enum: ['LONG', 'SHORT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    avgEntryPrice: {
        type: Number,
        required: true
    },
    currentPrice: {
        type: Number,
        default: 0
    },
    // P&L
    unrealizedPnL: {
        type: Number,
        default: 0
    },
    realizedPnL: {
        type: Number,
        default: 0
    },
    pnlPercentage: {
        type: Number,
        default: 0
    },
    // Status
    status: {
        type: String,
        enum: ['open', 'closed', 'partial'],
        default: 'open'
    },
    // Timing
    openedAt: {
        type: Date,
        default: Date.now
    },
    closedAt: {
        type: Date,
        default: null
    },
    // Related orders
    entryOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    exitOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }
}, {
    timestamps: true
});

// Calculate P&L before save
positionSchema.pre('save', function (next) {
    if (this.currentPrice && this.avgEntryPrice && this.quantity) {
        const multiplier = this.side === 'LONG' ? 1 : -1;
        this.unrealizedPnL = multiplier * (this.currentPrice - this.avgEntryPrice) * this.quantity;
        this.pnlPercentage = ((this.currentPrice - this.avgEntryPrice) / this.avgEntryPrice) * 100 * multiplier;
    }
    next();
});

// Index for faster queries
positionSchema.index({ userId: 1, status: 1 });
positionSchema.index({ symbol: 1 });

module.exports = mongoose.model('Position', positionSchema);
