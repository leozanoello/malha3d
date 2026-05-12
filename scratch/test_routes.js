require('dotenv').config();
const { Budget, Client, User, KanbanColumn } = require('../models');
const { sequelize } = require('../config/database');

async function testNegociacoes() {
  console.log('--- Testing Negociacoes Route Logic ---');
  try {
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
    console.log('Deals processed.');

    const teamMembers = (await User.findAll({ 
      attributes: ['id', 'name', 'role'],
      order: [['name', 'ASC']] 
    })).map(u => u.get({ plain: true }));
    console.log('Team members fetched:', teamMembers.length);

    const allDealsForStats = await Budget.findAll();
    const allPlain = allDealsForStats.map(d => d.get({ plain: true }));
    console.log('All deals for stats fetched.');

    console.log('✅ Negociacoes logic OK');
  } catch (error) {
    console.error('❌ Negociacoes logic FAILED:', error);
  }
}

async function testOrcamentos() {
  console.log('\n--- Testing Orcamentos Route Logic ---');
  try {
    const budgets = (await Budget.findAll({ order: [['createdAt', 'DESC']] })).map(b => b.get({ plain: true }));
    console.log('Budgets fetched:', budgets.length);
    console.log('✅ Orcamentos logic OK');
  } catch (error) {
    console.error('❌ Orcamentos logic FAILED:', error);
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('DB Connection OK');
    await testNegociacoes();
    await testOrcamentos();
  } catch (err) {
    console.error('DB Connection FAILED:', err);
  } finally {
    await sequelize.close();
  }
}

run();
