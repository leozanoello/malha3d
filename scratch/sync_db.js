require('dotenv').config();
const { sequelize } = require('../config/database');
const models = require('../models');

async function run() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    console.log('Syncing database schema (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('Database schema synced successfully! All tables and columns are created.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

run();
