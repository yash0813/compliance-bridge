/**
 * Order Model
 * 
 * @author Yash
 * @description Order schema for trading orders with audit trail
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Order identifiers
    orderId: {
        type: String,
        required: true,
        unique: true
    },
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
    // Order details
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
        enum: ['BUY', 'SELL'],
        required: true
    },
    orderType: {
        type: String,
        enum: ['MARKET', 'LIMIT', 'SL', 'SL-M'],
        default: 'MARKET'
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        default: 0
    },
    triggerPrice: {
        type: Number,
        default: 0
    },
    // Execution details
    filledQty: {
        type: Number,
        default: 0
    },
    avgPrice: {
        type: Number,
        default: 0
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'queued', 'processing', 'executed', 'partial', 'rejected', 'cancelled'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    // Broker routing
    broker: {
        type: String,
        enum: ['Zerodha', 'Angel One', 'Upstox', 'ICICI Direct'],
        default: 'Zerodha'
    },
    brokerOrderId: {
        type: String,
        default: null
    },
    // Risk & Compliance
    riskChecks: {
        marginCheck: { type: Boolean, default: false },
        positionLimit: { type: Boolean, default: false },
        priceCheck: { type: Boolean, default: false }
    },
    complianceRules: [{
        rule: String,
        passed: Boolean,
        checkedAt: Date
    }],
    // Timing
    signalTime: {
        type: Date,
        default: Date.now
    },
    queuedAt: {
        type: Date,
        default: null
    },
    executedAt: {
        type: Date,
        default: null
    },
    latencyMs: {
        type: Number,
        default: 0
    },
    // Source
    source: {
        type: String,
        enum: ['manual', 'strategy', 'api'],
        default: 'manual'
    },
    sourceIP: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Generate unique order ID before save
orderSchema.pre('save', function (next) {
    if (!this.orderId) {
        this.orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Index for faster queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ symbol: 1 });

module.exports = mongoose.model('Order', orderSchema);
