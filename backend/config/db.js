/**
 * MongoDB Database Connection
 * 
 * @author Yash
 * Uses mongoose to connect to MongoDB
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Try connecting to local MongoDB first
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-bridge', {
            serverSelectionTimeoutMS: 5000 // Fail fast if not running
        });

        console.log(`📦 MongoDB Connected: ${mongoose.connection.host}`);

    } catch (error) {
        console.warn('⚠️  Local MongoDB connection failed:', error.message);
        console.log('🔄 Attempting to start In-Memory MongoDB for development...');

        try {
            // Lazy load to avoid crash if not installed
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();

            await mongoose.connect(uri);
            console.log(`📦 Connected to In-Memory MongoDB: ${uri}`);

            // Seed default users for development
            const User = require('../models/User');
            const Strategy = require('../models/Strategy');
            const Position = require('../models/Position');
            const Order = require('../models/Order');

            // Check if users exist (should be 0)
            if (await User.countDocuments() === 0) {
                const users = await User.create([
                    { name: 'Demo Trader', email: 'trader@demo.com', password: 'demo123', role: 'trader' },
                    { name: 'Demo Admin', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
                    { name: 'Yash', email: 'yash.c0813@gmail.com', password: 'admin123', role: 'admin' },
                    { name: 'Demo Broker', email: 'broker@demo.com', password: 'demo123', role: 'broker' }
                ]);
                console.log('🌱 Seeded default users (trader@demo.com / demo123)');

                const trader = users[0];

                // Seed Strategies
                const strategies = await Strategy.create([
                    {
                        name: 'Momentum Alpha',
                        userId: trader._id,
                        type: 'White Box',
                        metrics: { totalTrades: 120, winRate: 68, totalPnL: 45000 }
                    },
                    {
                        name: 'Mean Reversion',
                        userId: trader._id,
                        type: 'Grey Box',
                        metrics: { totalTrades: 85, winRate: 55, totalPnL: 12000 }
                    }
                ]);

                // Seed Positions
                await Position.create([
                    {
                        userId: trader._id,
                        strategyId: strategies[0]._id,
                        symbol: 'RELIANCE',
                        side: 'LONG',
                        quantity: 50,
                        avgEntryPrice: 2450,
                        currentPrice: 2480,
                        unrealizedPnL: 1500
                    },
                    {
                        userId: trader._id,
                        strategyId: strategies[1]._id,
                        symbol: 'TCS',
                        side: 'SHORT',
                        quantity: 25,
                        avgEntryPrice: 3800,
                        currentPrice: 3750,
                        unrealizedPnL: 1250
                    }
                ]);

                // Seed some orders
                await Order.create([
                    {
                        userId: trader._id,
                        symbol: 'RELIANCE',
                        side: 'BUY',
                        quantity: 50,
                        price: 2450,
                        status: 'executed',
                        broker: 'Zerodha',
                        orderId: 'ORD-1001'
                    },
                    {
                        userId: trader._id,
                        symbol: 'TCS',
                        side: 'SELL',
                        quantity: 25,
                        price: 3800,
                        status: 'executed',
                        broker: 'Angel One',
                        orderId: 'ORD-1002'
                    }
                ]);
                console.log('🌱 Seeded sample Strategies, Positions, and Orders');
            }

        } catch (memError) {
            console.error('❌ Failed to start In-Memory MongoDB:', memError.message);
            console.log('⚠️  Server will start but API calls requiring DB will fail.');
        }
    }

    // Handle connection events
    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
    });
};

module.exports = connectDB;
