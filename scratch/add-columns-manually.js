const { sequelize } = require('../config/database');

async function run() {
  try {
    console.log('🔄 Tentando adicionar reset_token via raw query...');
    await sequelize.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);');
    console.log('✅ Coluna reset_token adicionada com sucesso.');
  } catch (err) {
    console.log('⚠️ reset_token já existe ou erro:', err.message);
  }

  try {
    console.log('🔄 Tentando adicionar reset_token_expires via raw query...');
    await sequelize.query('ALTER TABLE users ADD COLUMN reset_token_expires DATETIME;');
    console.log('✅ Coluna reset_token_expires adicionada com sucesso.');
  } catch (err) {
    console.log('⚠️ reset_token_expires já existe ou erro:', err.message);
  }

  process.exit(0);
}

run();
