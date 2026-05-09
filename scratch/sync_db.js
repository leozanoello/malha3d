require('dotenv').config();
const { sequelize } = require('../models');

async function sync() {
  try {
    console.log('🔄 Sincronizando banco de dados (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Banco de dados sincronizado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na sincronização:', err);
    process.exit(1);
  }
}

sync();
