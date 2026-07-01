const { Setting } = require('../models');
const { sequelize } = require('../config/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Banco conectado.');
    const settings = await Setting.findAll();
    console.log(`Total de configurações encontradas: ${settings.length}`);
    settings.forEach(s => {
      console.log(`Key: ${s.key}, Group: ${s.group}, Value: ${s.value}`);
    });
  } catch (err) {
    console.error('Erro ao buscar configurações:', err);
  } finally {
    process.exit(0);
  }
}

run();
