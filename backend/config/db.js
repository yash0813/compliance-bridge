/**
 * MongoDB Database Connection
 * 
 * @author Yash
 * Uses mongoose to connect to MongoDB
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-bridge');

        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('⚠️  Server will continue without database. Using mock data.');
        // Don't exit - allow server to run with mock data
    }
};

module.exports = connectDB;
