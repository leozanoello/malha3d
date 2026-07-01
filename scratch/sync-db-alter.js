const { sequelize } = require('../config/database');
const { User } = require('../models');

async function syncAlter() {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados (alter: true)...');
    await sequelize.sync({ alter: true });
    console.log('✅ Banco de dados sincronizado e atualizado com as novas colunas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    process.exit(1);
  }
}

syncAlter();
