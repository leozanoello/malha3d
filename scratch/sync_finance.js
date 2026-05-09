require('dotenv').config();
const { FinanceTransaction } = require('../models');

async function syncFinance() {
  try {
    console.log('🔄 Sincronizando apenas FinanceTransaction...');
    await FinanceTransaction.sync({ alter: true });
    console.log('✅ FinanceTransaction sincronizado!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

syncFinance();
