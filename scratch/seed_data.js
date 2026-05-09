const { Client, Budget, FinanceTransaction, sequelize } = require('../models');

async function seedData() {
  try {
    console.log('🌱 Iniciando seeding de dados...');

    // 1. Criar Clientes/Parceiros (10)
    const clientData = [
      { name: 'Studio ArqTech', email: 'contato@arqtech.com', phone: '(11) 98888-7777', type: 'partner' },
      { name: 'Construtora Horizonte', email: 'eng@horizonte.com.br', phone: '(11) 97777-6666', type: 'client' },
      { name: 'Interiores & Co', email: 'design@interiores.com', phone: '(21) 96666-5555', type: 'client' },
      { name: 'Urbanismo Global', email: 'projects@urban.com', phone: '(31) 95555-4444', type: 'partner' },
      { name: 'Piero Arquitetura', email: 'piero@piero.arq.br', phone: '(41) 94444-3333', type: 'client' },
      { name: 'Meta Real Estate', email: 'sales@meta.com', phone: '(11) 93333-2222', type: 'client' },
      { name: 'EcoVila Empreendimentos', email: 'sustentavel@ecovila.com', phone: '(11) 92222-1111', type: 'client' },
      { name: 'Lux Decor', email: 'atendimento@lux.com', phone: '(11) 91111-0000', type: 'partner' },
      { name: 'Skyline Architects', email: 'contact@skyline.com', phone: '(11) 90000-9999', type: 'client' },
      { name: 'Z-Axis Visuals', email: 'zaxis@visuals.com', phone: '(11) 99999-8888', type: 'partner' }
    ];

    const clients = await Client.bulkCreate(clientData);
    console.log('✅ 10 Clientes/Parceiros criados.');

    // 2. Criar Leads/Negociações (20)
    const budgetData = [];
    const projectTypes = ['Renderização', 'Animação', 'Tour Virtual 360', 'Modelagem 3D'];
    const statuses = ['lead_novo', 'lead_contato', 'lead_qualificado', 'venda_negociacao', 'venda_aprovacao'];
    const styles = ['Moderno', 'Contemporâneo', 'Minimalista', 'Industrial', 'Escandinavo'];

    for (let i = 1; i <= 20; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      budgetData.push({
        name: `Projeto ${i} - ${client.name}`,
        email: client.email,
        phone: client.phone,
        projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
        description: `Briefing detalhado para o projeto de visualização ${i}.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        estimatedValue: Math.floor(Math.random() * 20000) + 5000,
        probability: Math.floor(Math.random() * 90) + 10,
        architecturalStyle: styles[Math.floor(Math.random() * styles.styles)],
        totalArea: Math.floor(Math.random() * 500) + 50,
        temperature: Math.random() > 0.5 ? 'Hot' : 'Warm',
        clientId: client.id,
        expectedRevenueDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
      });
    }

    await Budget.bulkCreate(budgetData);
    console.log('✅ 20 Leads/Negociações criados.');

    // 3. Criar Transações Financeiras (10)
    const transactionData = [
      { description: 'Entrada Edifício Alpha', amount: 5000, type: 'income', category: 'Projetos', date: new Date() },
      { description: 'Licença V-Ray (Anual)', amount: 2400, type: 'expense', category: 'Software', date: new Date() },
      { description: 'Parcela 2/3 Casa de Campo', amount: 3500, type: 'income', category: 'Projetos', date: new Date() },
      { description: 'Marketing Digital (Meta Ads)', amount: 1500, type: 'expense', category: 'Marketing', date: new Date() },
      { description: 'Compra de Assets 3D', amount: 450, type: 'expense', category: 'Assets', date: new Date() },
      { description: 'Consultoria Estrutural', amount: 2000, type: 'income', category: 'Consultoria', date: new Date() },
      { description: 'Energia Elétrica Studio', amount: 600, type: 'expense', category: 'Infra', date: new Date() },
      { description: 'Novo Monitor 4K', amount: 3200, type: 'expense', category: 'Hardware', date: new Date() },
      { description: 'Renderização Final Park Ave', amount: 8000, type: 'income', category: 'Projetos', date: new Date() },
      { description: 'Assinatura Adobe CC', amount: 220, type: 'expense', category: 'Software', date: new Date() }
    ];

    await FinanceTransaction.bulkCreate(transactionData);
    console.log('✅ 10 Transações financeiras criadas.');

    console.log('✨ Seeding concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seeding:', error);
    process.exit(1);
  }
}

seedData();
