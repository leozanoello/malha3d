const { sequelize } = require('../models');

async function migrate() {
  const queryInterface = sequelize.getQueryInterface();
  const tableName = 'budgets';
  
  try {
    const tableInfo = await queryInterface.describeTable(tableName);
    
    const columnsToAdd = [
      { name: 'order', type: 'INTEGER', defaultValue: 0 },
      { name: 'architectural_style', type: 'STRING', allowNull: true },
      { name: 'total_area', type: 'DECIMAL(10,2)', allowNull: true },
      { name: 'deliverables', type: 'JSON', defaultValue: [] },
      { name: 'temperature', type: 'STRING', defaultValue: 'Morno' }
    ];

    for (const col of columnsToAdd) {
      if (!tableInfo[col.name]) {
        console.log(`Adding column ${col.name} to ${tableName}...`);
        // Note: SQLite doesn't support JSON type natively but Sequelize handles it. 
        // For addColumn in SQLite, we use raw types.
        let type = col.type;
        if (type === 'JSON') type = 'TEXT'; 
        
        await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN "${col.name}" ${type}`);
      } else {
        console.log(`Column ${col.name} already exists.`);
      }
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
