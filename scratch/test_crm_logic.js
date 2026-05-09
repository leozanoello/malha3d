require('dotenv').config();
const { Budget, KanbanColumn } = require('../models');

async function testCRM() {
  try {
    const columns = (await KanbanColumn.findAll({ where: { type: 'vendas' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const dealsRaw = await Budget.findAll({ 
      where: { winStatus: 'aberto' },
      order: [['order', 'ASC'], ['createdAt', 'DESC']] 
    });
    console.log('✅ CRM Data fetched successfully');
    console.log('Columns:', columns.length);
    console.log('Deals:', dealsRaw.length);
    process.exit(0);
  } catch (err) {
    console.error('❌ CRM Test Failed:', err);
    process.exit(1);
  }
}

testCRM();
