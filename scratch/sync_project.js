require('dotenv').config();
const { Project } = require('../models');

async function syncProject() {
  try {
    console.log('🔄 Sincronizando apenas Project...');
    await Project.sync({ alter: true });
    console.log('✅ Project sincronizado!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

syncProject();
