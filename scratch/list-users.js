require('dotenv').config();
console.log('SUPABASE_DB_URL:', process.env.SUPABASE_DB_URL ? 'Defined' : 'Not Defined');
const { User } = require('../models');

async function listUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    console.log('Users in database:');
    console.table(users.map(u => u.toJSON()));
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();
