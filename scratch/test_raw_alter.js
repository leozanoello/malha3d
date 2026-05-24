const { sequelize } = require('../models');

async function testRawAlter() {
  try {
    console.log('Testing raw SQL alter table...');
    
    // SQLite check: PRAGMA table_info(projects)
    // Postgres check: query information_schema.columns
    const dialect = sequelize.getDialect();
    console.log('Dialect is:', dialect);
    
    let hasColumn = false;
    if (dialect === 'sqlite') {
      const [results] = await sequelize.query("PRAGMA table_info(projects);");
      hasColumn = results.some(col => col.name === 'user_id');
    } else {
      const [results] = await sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'user_id';"
      );
      hasColumn = results.length > 0;
    }
    
    console.log('Column user_id exists in projects:', hasColumn);
    
    if (!hasColumn) {
      console.log('Adding column user_id to projects...');
      const columnType = dialect === 'sqlite' ? 'TEXT' : 'UUID REFERENCES users(id) ON DELETE SET NULL';
      await sequelize.query(`ALTER TABLE projects ADD COLUMN user_id ${columnType};`);
      console.log('Column added successfully!');
    } else {
      console.log('Column already exists.');
    }
    
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await sequelize.close();
  }
}

testRawAlter();
