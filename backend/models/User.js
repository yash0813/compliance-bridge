/**
 * User Model
 * 
 * @author Yash
 * @description User schema for traders, brokers, admins, and regulators
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['trader', 'broker', 'admin', 'regulator'],
        default: 'trader'
    },
    avatar: {
        type: String,
        default: null
    },
    // Trader-specific fields
    strategies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Strategy'
    }],
    // Broker-specific fields
    brokerCode: {
        type: String,
        default: null
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
    // IP Whitelist (for SEBI compliance)
    whitelistedIPs: [{
        ip: String,
        label: String,
        addedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
    }],
    riskSettings: {
        maxMarginUsed: { type: Number, default: 80 },
        maxDailyLoss: { type: Number, default: 100000 },
        maxDrawdown: { type: Number, default: 5 },
        maxExposure: { type: Number, default: 5000000 },
        maxOpenPositions: { type: Number, default: 50 },
        maxOrdersPerMinute: { type: Number, default: 100 }
    },
    // Audit
    lastLogin: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude sensitive data)
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        isActive: this.isActive,
        isPaused: this.isPaused,
        riskSettings: this.riskSettings,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);
