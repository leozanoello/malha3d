const { sequelize, KanbanColumn, Budget } = require('../models');

async function syncAndSeed() {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados...');
    // Sincroniza apenas o modelo Budget e KanbanColumn para garantir os novos campos
    await Budget.sync({ alter: true });
    await KanbanColumn.sync({ alter: true });
    console.log('✅ Modelos Budget e KanbanColumn sincronizados.');

    const columns = [
      { title: 'Lead Qualificado', color: '#00f2ff', statusKey: 'leads', type: 'vendas', order: 0 },
      { title: 'Reunião Agendada', color: '#f97316', statusKey: 'reuniao', type: 'vendas', order: 1 },
      { title: 'Proposta Enviada', color: '#a855f7', statusKey: 'proposta', type: 'vendas', order: 2 },
      { title: 'Em Negociação', color: '#eab308', statusKey: 'negociacao', type: 'vendas', order: 3 },
      { title: 'Aguardando Contrato', color: '#10b981', statusKey: 'contrato', type: 'vendas', order: 4 }
    ];

    for (const col of columns) {
      const [column, created] = await KanbanColumn.findOrCreate({
        where: { statusKey: col.statusKey, type: 'vendas' },
        defaults: col
      });
      if (created) {
        console.log(`✨ Coluna criada: ${col.title}`);
      } else {
        console.log(`ℹ️ Coluna já existe: ${col.title}`);
      }
    }

    // Opcional: Criar um deal de teste para ver o Forecast funcionando
    const testDeal = await Budget.findOrCreate({
      where: { name: 'Projeto Mansão Z' },
      defaults: {
        name: 'Projeto Mansão Z',
        estimatedValue: 15000,
        probability: 70,
        status: 'proposta',
        winStatus: 'aberto',
        expectedRevenueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15),
        visualStyle: 'Moderno / Minimalista',
        projectType: 'Arquitetônico',
        imagesCount: 5,
        animationSeconds: 30
      }
    });

    console.log('🚀 Sincronização e Seeding concluídos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  }
}

syncAndSeed();
