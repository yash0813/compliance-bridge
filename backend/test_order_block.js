const mongoose = require('mongoose');
require('dotenv').config();
const riskService = require('./services/riskService');
const User = require('./models/User');

async function testOrderValidation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-bridge');

        // Find the demo trader
        const user = await User.findOne({ role: 'trader' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const orderDetails = {
            symbol: 'RELIANCE',
            side: 'BUY',
            quantity: 1,
            price: 2500
        };

        console.log('Validating order...');
        const result = await riskService.validateOrder(user, orderDetails);
        console.log('Result:', result);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testOrderValidation();
