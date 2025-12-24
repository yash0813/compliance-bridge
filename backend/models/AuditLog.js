/**
 * AuditLog Model
 * 
 * @author Yash
 * @description Immutable audit trail for all system events
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
    // Event details
    eventType: {
        type: String,
        enum: [
            'login', 'logout', 'password_change',
            'order_placed', 'order_executed', 'order_rejected', 'order_cancelled',
            'strategy_created', 'strategy_updated', 'strategy_certified',
            'user_created', 'user_blocked', 'user_unblocked',
            'kill_switch_activated', 'kill_switch_deactivated',
            'ip_added', 'ip_removed', 'ip_verified',
            'system_alert', 'compliance_check'
        ],
        required: true
    },
    // Actor (who performed the action)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    userName: {
        type: String,
        default: 'System'
    },
    userRole: {
        type: String,
        default: null
    },
    // Target (what was affected)
    targetType: {
        type: String,
        enum: ['user', 'order', 'strategy', 'system', 'ip', null],
        default: null
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    targetName: {
        type: String,
        default: null
    },
    // Event data
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Source information
    sourceIP: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    // Status
    severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
        default: 'info'
    },
    // Integrity (immutable audit)
    hash: {
        type: String,
        default: null
    },
    previousHash: {
        type: String,
        default: null
    },
    // Timestamp is auto-generated and cannot be modified
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, {
    timestamps: false // We use our own immutable timestamp
});

// Generate hash for integrity before save
auditLogSchema.pre('save', async function (next) {
    if (!this.hash) {
        // Get previous log's hash for chain
        const previousLog = await this.constructor.findOne().sort({ _id: -1 });
        this.previousHash = previousLog ? previousLog.hash : '0000000000000000';

        // Generate hash of this log
        const dataToHash = `${this.eventType}|${this.userId}|${this.description}|${this.timestamp}|${this.previousHash}`;
        this.hash = crypto.createHash('sha256').update(dataToHash).digest('hex').substring(0, 16);
    }
    next();
});

// Prevent updates to audit logs (immutable)
auditLogSchema.pre('updateOne', function (next) {
    const error = new Error('Audit logs are immutable and cannot be modified');
    next(error);
});

// Index for faster queries
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
