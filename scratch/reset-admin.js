require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    const user = await User.findOne({ where: { email: 'admin@malha3d.com' } });
    if (!user) {
      console.log('User admin@malha3d.com not found. Creating it...');
      await User.create({
        name: 'Admin Global',
        email: 'admin@malha3d.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isActive: true
      });
      console.log('User admin@malha3d.com created with password: admin123');
    } else {
      user.password = await bcrypt.hash('admin123', 10);
      await user.save();
      console.log('Password for admin@malha3d.com reset to: admin123');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
