require('dotenv').config();
const { KanbanColumn, sequelize } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    const columns = await KanbanColumn.findAll({ where: { type: 'vendas' }, order: [['order', 'ASC']] });
    console.log(JSON.stringify(columns.map(c => c.get({ plain: true })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}
run();
