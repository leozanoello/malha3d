const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function checkUser() {
    try {
        await sequelize.authenticate();
        const user = await User.findOne({ where: { email: 'admin@malha3d.com' } });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('User found:', user.email);
        
        const isValid = await bcrypt.compare('admin123', user.password);
        console.log('Password valid:', isValid);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkUser();
