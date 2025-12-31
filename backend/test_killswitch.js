const mongoose = require('mongoose');
require('dotenv').config();
const SystemSettings = require('./models/SystemSettings');

async function testKillSwitch() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/compliance-bridge');
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({ masterKillSwitch: true });
        } else {
            settings.masterKillSwitch = true;
            await settings.save();
        }
        console.log('Kill switch set to:', settings.masterKillSwitch);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testKillSwitch();
