require('dotenv').config();
const { KanbanColumn, Budget } = require('../models');

async function checkCounts() {
  try {
    const columns = await KanbanColumn.findAll({ where: { type: 'vendas' } });
    const budgets = await Budget.findAll({ where: { winStatus: 'aberto' } });
    
    console.log('Total open budgets in DB:', budgets.length);
    console.log('Status values present in open budgets in DB:', [...new Set(budgets.map(b => b.status))]);
    
    columns.forEach(col => {
      const colBudgets = budgets.filter(b => b.status === col.statusKey);
      console.log(`Column ${col.title} (Key: ${col.statusKey}): ${colBudgets.length} budgets`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCounts();
