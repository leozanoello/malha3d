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

async function listTables() {
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('--- Public Tables ---');
    tables.forEach(t => console.log(t.table_name));

  } catch (error) {
    console.error('List tables failed:', error);
  } finally {
    await sequelize.close();
  }
}

listTables();
