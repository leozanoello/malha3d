/**
 * Script de migration — adiciona 2 campos novos no modelo Budget
 * - panoramas360, animationAI
 * + 15 sub-campos _Diurna/_Noturna/_Misto para 5 categorias
 *
 * Uso: node scripts/add-entregaveis-fields.js
 */

const { sequelize } = require('../models');
const sequelizePkg = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const desc = await qi.describeTable('budgets');
  const cols = Object.keys(desc);

  const newCols = [
    // Principais (totais consolidados — só fica em paridade com o schema)
    ['panoramas360', 'INTEGER DEFAULT 0'],
    ['animationAI', 'INTEGER DEFAULT 0'],
    // Sub-campos Diurna/Noturna/Misto
    ['imagesCountDiurna', 'INTEGER DEFAULT 0'],
    ['imagesCountNoturna', 'INTEGER DEFAULT 0'],
    ['imagesCountMisto', 'INTEGER DEFAULT 0'],
    ['animationSecondsDiurna', 'INTEGER DEFAULT 0'],
    ['animationSecondsNoturna', 'INTEGER DEFAULT 0'],
    ['animationSecondsMisto', 'INTEGER DEFAULT 0'],
    ['floorPlansCountDiurna', 'INTEGER DEFAULT 0'],
    ['floorPlansCountNoturna', 'INTEGER DEFAULT 0'],
    ['floorPlansCountMisto', 'INTEGER DEFAULT 0'],
    ['panoramas360Diurna', 'INTEGER DEFAULT 0'],
    ['panoramas360Noturna', 'INTEGER DEFAULT 0'],
    ['panoramas360Misto', 'INTEGER DEFAULT 0'],
    ['animationAIDiurna', 'INTEGER DEFAULT 0'],
    ['animationAINoturna', 'INTEGER DEFAULT 0'],
    ['animationAIMisto', 'INTEGER DEFAULT 0']
  ];

  for (const [name, type] of newCols) {
    if (!cols.includes(name)) {
      try {
        await qi.addColumn('budgets', name, { type: sequelizePkg.DataTypes.INTEGER, defaultValue: 0 });
        console.log('✅ Coluna budgets.' + name + ' adicionada');
      } catch (err) {
        console.error('❌ Falha ao adicionar budgets.' + name + ':', err.message);
      }
    } else {
      console.log('⏭ Coluna budgets.' + name + ' já existe');
    }
  }

  await sequelize.close();
}

migrate().catch(err => { console.error(err); process.exit(1); });
