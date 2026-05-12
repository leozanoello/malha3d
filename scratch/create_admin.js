const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const email = 'admin@malha3d.com';
    const password = 'admin123';
    
    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log('User already exists. Updating password...');
      user.password = password; 
      await user.save();
    } else {
      console.log('Creating new admin user...');
      await User.create({
        name: 'Admin Master',
        email,
        password,
        role: 'admin',
        isActive: true
      });
    }
    console.log('Success: admin@malha3d.com is ready with password admin123');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createAdmin();
