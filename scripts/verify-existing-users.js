require('dotenv').config();
const { User } = require('../models');
const { sequelize } = require('../config/database');

async function verifyAll() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco para verificação...');
    
    const [updatedCount] = await User.update(
      { isVerified: true },
      { where: { isVerified: false } }
    );
    
    console.log(`${updatedCount} usuários marcados como verificados.`);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
    process.exit(1);
  }
}

verifyAll();
