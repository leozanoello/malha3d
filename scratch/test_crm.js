const { Budget, KanbanColumn, sequelize } = require('../models');
const { Op } = require('sequelize');

async function testRoute() {
  try {
    console.log('--- Checking LEADS ---');
    const leadsColCount = await KanbanColumn.count({ where: { type: 'leads' } });
    console.log('Leads col count:', leadsColCount);

    console.log('--- Checking VENDAS ---');
    const vendasColCount = await KanbanColumn.count({ where: { type: 'vendas' } });
    console.log('Vendas col count:', vendasColCount);

    const budgetsData = await Budget.findAll();
    console.log('Total budgets:', budgetsData.length);

    console.log('Test PASSED');
    process.exit(0);
  } catch (error) {
    console.error('Test FAILED:', error);
    process.exit(1);
  }
}

testRoute();
