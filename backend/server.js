/**
 * Compliance-Bridge Backend API Server
 * 
 * @author Yash
 * @description Express server with MongoDB for SEBI-compliant trading platform
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const strategyRoutes = require('./routes/strategies');
const auditRoutes = require('./routes/audit');
const positionRoutes = require('./routes/positions');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://yash0813.github.io'],
    credentials: true
}));
app.use(express.json());

// Request logging (dev only)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/positions', positionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Compliance-Bridge API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           COMPLIANCE-BRIDGE API SERVER                     ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}                          ║
║  📡 API Base URL: http://localhost:${PORT}/api              ║
║  🔒 CORS enabled for frontend origins                      ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
