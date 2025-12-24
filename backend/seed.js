/**
 * Database Seed Script
 * 
 * @author Yash
 * @description Creates initial users and sample data
 * 
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Strategy = require('./models/Strategy');
const Order = require('./models/Order');
const Position = require('./models/Position');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-bridge');
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Strategy.deleteMany({});
        await Order.deleteMany({});
        await Position.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create demo users
        const users = await User.create([
            {
                name: 'Demo Trader',
                email: 'trader@demo.com',
                password: 'demo123',
                role: 'trader'
            },
            {
                name: 'Demo Broker',
                email: 'broker@demo.com',
                password: 'demo123',
                role: 'broker',
                brokerCode: 'BRK001'
            },
            {
                name: 'Demo Admin',
                email: 'admin@demo.com',
                password: 'demo123',
                role: 'admin'
            },
            {
                name: 'Demo Regulator',
                email: 'regulator@demo.com',
                password: 'demo123',
                role: 'regulator'
            },
            {
                name: 'Yash',
                email: 'yash.c0813@gmail.com',
                password: 'admin123',
                role: 'admin'
            }
        ]);
        console.log(`✅ Created ${users.length} users`);

        const trader = users[0];

        // Create sample strategies
        const strategies = await Strategy.create([
            {
                name: 'Mean Reversion NSE',
                description: 'Statistical mean reversion strategy for NSE stocks',
                userId: trader._id,
                type: 'White Box',
                disclosureLevel: 'Full',
                certification: {
                    status: 'certified',
                    certifiedAt: new Date(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                },
                version: '2.1.0',
                tradingPairs: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'],
                metrics: {
                    totalTrades: 1250,
                    winRate: 62.5,
                    profitFactor: 1.85,
                    maxDrawdown: 8.2,
                    sharpeRatio: 1.45,
                    totalPnL: 125000
                }
            },
            {
                name: 'Momentum Breakout',
                description: 'Breakout strategy based on momentum indicators',
                userId: trader._id,
                type: 'Grey Box',
                disclosureLevel: 'Partial',
                certification: {
                    status: 'under-review'
                },
                version: '1.0.0',
                tradingPairs: ['SBIN', 'ICICIBANK', 'BAJFINANCE'],
                metrics: {
                    totalTrades: 450,
                    winRate: 58.2,
                    profitFactor: 1.62,
                    maxDrawdown: 12.5,
                    sharpeRatio: 1.12,
                    totalPnL: 45000
                }
            }
        ]);
        console.log(`✅ Created ${strategies.length} strategies`);

        // Create sample orders
        const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN'];
        const orders = [];

        for (let i = 0; i < 20; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
            const price = Math.floor(Math.random() * 2000) + 500;
            const quantity = Math.floor(Math.random() * 100) + 10;

            orders.push({
                userId: trader._id,
                strategyId: strategies[0]._id,
                symbol,
                side,
                orderType: 'MARKET',
                quantity,
                price,
                avgPrice: price,
                filledQty: quantity,
                status: 'executed',
                broker: 'Zerodha',
                executedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                latencyMs: Math.floor(Math.random() * 50) + 10
            });
        }
        await Order.insertMany(orders);
        console.log(`✅ Created ${orders.length} orders`);

        // Create sample positions
        const positions = await Position.create([
            {
                userId: trader._id,
                strategyId: strategies[0]._id,
                symbol: 'RELIANCE',
                side: 'LONG',
                quantity: 50,
                avgEntryPrice: 2450,
                currentPrice: 2520,
                unrealizedPnL: 3500
            },
            {
                userId: trader._id,
                strategyId: strategies[0]._id,
                symbol: 'TCS',
                side: 'LONG',
                quantity: 25,
                avgEntryPrice: 3850,
                currentPrice: 3920,
                unrealizedPnL: 1750
            },
            {
                userId: trader._id,
                strategyId: strategies[1]._id,
                symbol: 'SBIN',
                side: 'SHORT',
                quantity: 100,
                avgEntryPrice: 625,
                currentPrice: 618,
                unrealizedPnL: 700
            }
        ]);
        console.log(`✅ Created ${positions.length} positions`);

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('Demo Accounts:');
        console.log('────────────────────────────────');
        console.log('| Email              | Role      |');
        console.log('────────────────────────────────');
        console.log('| trader@demo.com    | trader    |');
        console.log('| broker@demo.com    | broker    |');
        console.log('| admin@demo.com     | admin     |');
        console.log('| regulator@demo.com | regulator |');
        console.log('────────────────────────────────');
        console.log('Password for all: demo123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
