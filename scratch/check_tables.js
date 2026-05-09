require('dotenv').config();
const { sequelize } = require('../models');

async function check() {
  try {
    const [results] = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log('Tables:', results);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
