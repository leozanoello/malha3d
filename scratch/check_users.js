require('dotenv').config();
const { User } = require('../models');
const { sequelize } = require('../config/database');

async function check() {
  try {
    const users = await User.findAll();
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.name} | ${u.email} | Role: ${u.role} | Parent: ${u.parentId}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
