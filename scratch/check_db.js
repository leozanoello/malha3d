const { sequelize } = require('../config/database');

async function checkDB() {
  try {
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tables:', tables);
    
    for (const table of tables) {
      const desc = await sequelize.getQueryInterface().describeTable(table);
      console.log(`Table ${table} columns:`, Object.keys(desc));
    }
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

checkDB();
