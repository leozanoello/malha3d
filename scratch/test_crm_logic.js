require('dotenv').config();
const { Budget, KanbanColumn, Client, User, sequelize } = require('../models');

async function testCRM() {
  try {
    await sequelize.authenticate();
    console.log('DB Connected');

    const columns = (await KanbanColumn.findAll({ where: { type: 'vendas' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    console.log('Columns fetched:', columns.length);

    const dealsRaw = await Budget.findAll({ 
      where: { winStatus: 'aberto' },
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'phone', 'email', 'company'] },
        { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
      ],
      order: [['order', 'ASC'], ['createdAt', 'DESC']] 
    });
    console.log('Deals fetched:', dealsRaw.length);

    const deals = dealsRaw.map(d => d.get({ plain: true }));
    
    const kanban = {};
    const pipelineTotals = {};
    columns.forEach(col => {
      const colDeals = deals.filter(d => d.status === col.statusKey);
      kanban[col.statusKey] = colDeals;
      pipelineTotals[col.statusKey] = colDeals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    });

    console.log('Kanban mapped successfully');

  } catch (error) {
    console.error('CRM Logic Error:', error);
  } finally {
    await sequelize.close();
  }
}

testCRM();
