/**
 * Authentication Middleware
 * 
 * @author Yash
 * @description JWT verification middleware for protected routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - require authentication
 */
const protect = async (req, res, next) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!req.user.isActive) {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Not authorized, token invalid' });
    }
};

/**
 * Require specific role(s)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This action requires one of these roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Optional auth - attach user if token exists, but don't require it
 */
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid, but that's okay - user is just not logged in
        }
    }

    next();
};

module.exports = { protect, requireRole, optionalAuth };
