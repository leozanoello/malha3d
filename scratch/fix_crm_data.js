require('dotenv').config();
const { sequelize } = require('../config/database');
const Budget = require('../models/Budget');
const KanbanColumn = require('../models/KanbanColumn');

async function fixData() {
  try {
    console.log('🔄 Iniciando correção de dados no banco configurado...');
    
    // 1. Atualizar Colunas
    await KanbanColumn.update({ statusKey: 'novo_lead' }, { where: { statusKey: 'novo' } });
    await KanbanColumn.update({ statusKey: 'em_negociacao' }, { where: { statusKey: 'em_andamento' } });
    await KanbanColumn.update({ statusKey: 'aguardando_resposta' }, { where: { statusKey: 'respondido' } });
    console.log('✅ Colunas atualizadas.');

    // 2. Atualizar Leads
    await Budget.update({ status: 'novo_lead' }, { where: { status: 'novo' } });
    await Budget.update({ status: 'em_negociacao' }, { where: { status: 'em_andamento' } });
    await Budget.update({ status: 'aguardando_resposta' }, { where: { status: 'respondido' } });
    console.log('✅ Leads atualizados.');

    console.log('🚀 Sucesso!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Erro:', e);
    process.exit(1);
  }
}

fixData();
