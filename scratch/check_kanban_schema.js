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
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'KanbanColumn'
    `);
    
    console.log('--- KanbanColumn Columns ---');
    columns.forEach(c => console.log(c.column_name));

  } catch (error) {
    console.error('Schema check failed:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
