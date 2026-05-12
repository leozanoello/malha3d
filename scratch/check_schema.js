const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.SUPABASE_DB_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function checkSchema() {
  try {
    const [budgetsColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Budgets'
    `);
    
    console.log('--- Budgets Columns ---');
    budgetsColumns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

    const [kanbanColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'KanbanColumns'
    `);
    
    console.log('\n--- KanbanColumns Columns ---');
    kanbanColumns.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  } catch (error) {
    console.error('Schema check failed:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
