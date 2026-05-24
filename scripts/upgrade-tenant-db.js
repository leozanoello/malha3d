const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../models');

async function upgrade() {
  try {
    console.log('🚀 Iniciando atualização do banco de dados para Multi-Tenancy...');
    const dialect = sequelize.getDialect();
    console.log(`Dialect ativo: ${dialect}`);
    
    const tables = [
      'projects',
      'finance_transactions',
      'clients',
      'budgets',
      'calendar_events',
      'crm_notes',
      'crm_tasks',
      'time_logs',
      'freelancers'
    ];
    
    for (const table of tables) {
      let hasColumn = false;
      if (dialect === 'sqlite') {
        const [results] = await sequelize.query(`PRAGMA table_info(${table});`);
        hasColumn = results.some(col => col.name === 'user_id');
      } else {
        const [results] = await sequelize.query(
          `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'user_id';`
        );
        hasColumn = results.length > 0;
      }
      
      if (!hasColumn) {
        console.log(`Adicionando coluna user_id à tabela ${table}...`);
        const columnType = dialect === 'sqlite' ? 'TEXT' : 'UUID REFERENCES users(id) ON DELETE SET NULL';
        await sequelize.query(`ALTER TABLE ${table} ADD COLUMN user_id ${columnType};`);
        console.log(`✅ Coluna adicionada com sucesso à tabela ${table}!`);
      } else {
        console.log(`ℹ️ A coluna user_id já existe na tabela ${table}.`);
      }
    }
    console.log('🎉 Atualização de esquema concluída com sucesso!');
  } catch (error) {
    console.error('❌ Falha na atualização do esquema do banco de dados:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexão encerrada.');
  }
}

upgrade();
