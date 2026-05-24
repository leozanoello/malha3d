require('dotenv').config();
const { sequelize } = require('../models');

async function syncDb() {
  console.log("Starting DB synchronization...");
  try {
    await sequelize.authenticate();
    console.log("Connected to DB successfully.");
    await sequelize.sync({ alter: true });
    console.log("Database synchronized (alter: true) successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database synchronization failed:", error);
    process.exit(1);
  }
}

syncDb();
