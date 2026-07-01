const { sequelize } = require('../config/database');

async function alterEnum() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB.');
    const values = ['3d', 'ArchViz', 'Modelagem', 'Renderização'];
    for (const val of values) {
      try {
        await sequelize.query(`ALTER TYPE enum_projects_category ADD VALUE '${val}'`);
        console.log(`Successfully added '${val}' to enum_projects_category`);
      } catch (err) {
        // Ignore "duplicate key value" or "already exists" errors
        if (err.message.includes('already exists')) {
          console.log(`Value '${val}' already exists.`);
        } else {
          console.error(`Error adding '${val}': ${err.message}`);
        }
      }
    }
    console.log('Enum alteration finished.');
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await sequelize.close();
  }
}

alterEnum();
