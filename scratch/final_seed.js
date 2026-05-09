const { Client, Project, Budget, FinanceTransaction, sequelize } = require('../models');

async function seedData() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced.');

    // 1. Create Contacts (Clients, Partners/Prestadores)
    const contactsData = [
      { name: 'Arquiteto João Silva', type: 'PF', email: 'joao@exemplo.com', phone: '(11) 91111-1111', company: 'Silva Arq', category: 'Cliente' },
      { name: 'Construtora Alpha', type: 'PJ', email: 'contato@alpha.com', phone: '(11) 92222-2222', company: 'Alpha S.A.', category: 'Cliente' },
      { name: 'Designer Maria Souza', type: 'PF', email: 'maria@exemplo.com', phone: '(11) 93333-3333', company: 'M-Design', category: 'Cliente' },
      { name: 'RenderTech Solutions', type: 'PJ', email: 'hardware@rendertech.com', phone: '(11) 94444-4444', company: 'RenderTech', category: 'Fornecedor' },
      { name: '3D Assets Store', type: 'PJ', email: 'vendas@3dassets.com', phone: '(11) 95555-5555', company: '3D Assets', category: 'Fornecedor' },
      { name: 'Lucas ArchiRender', type: 'PF', email: 'lucas@render.com', phone: '(11) 96666-6666', company: 'Lucas Render', category: 'Prestador' },
      { name: 'Studio Flow Pós', type: 'PJ', email: 'flow@studio.com', phone: '(11) 97777-7777', company: 'Flow Studio', category: 'Prestador' }
    ];

    for (const c of contactsData) {
      await Client.findOrCreate({ where: { email: c.email }, defaults: c });
    }
    console.log('Contacts seeded.');

    // 2. Create Leads (CRM)
    const leadsData = [
      { name: 'Residencial Lagoa', email: 'lagoa@exemplo.com', phone: '(11) 98888-8888', projectType: 'Renderização', estimatedValue: 5000, status: 'novo', software: '3ds Max', renderEngine: 'Corona', description: 'Visualização externa para residência de alto padrão em condomínio fechado.' },
      { name: 'Shopping Central', email: 'shopping@exemplo.com', phone: '(11) 99999-9999', projectType: 'Animação', estimatedValue: 15000, status: 'oportunidade', software: 'Unreal Engine', renderEngine: 'Lumen', description: 'Tour virtual imersivo para apresentação de novo shopping center.' },
      { name: 'Escritório Moderno', email: 'moderno@exemplo.com', phone: '(11) 90000-0000', projectType: 'Modelagem 3D', estimatedValue: 3500, status: 'proposta', software: 'SketchUp', renderEngine: 'V-Ray', description: 'Modelagem detalhada de mobiliário corporativo para catálogo digital.' },
      { name: 'Prédio Comercial', email: 'comercial@exemplo.com', phone: '(11) 91234-5678', projectType: 'Visita Virtual', estimatedValue: 8000, status: 'fechado', software: '3ds Max', renderEngine: 'V-Ray', description: 'Produção de imagens 360 para venda de salas comerciais em pré-lançamento.' },
      { name: 'Casa de Campo', email: 'campo@exemplo.com', phone: '(11) 98765-4321', projectType: 'Renderização', estimatedValue: 4200, status: 'novo', software: 'Blender', renderEngine: 'Cycles', description: 'Renderizações fotorrealistas de casa de campo com foco em integração com a natureza.' }
    ];

    for (const l of leadsData) {
      await Budget.findOrCreate({ where: { email: l.email }, defaults: { ...l, priority: 'media', source: 'seed' } });
    }
    console.log('Leads seeded.');

    // 3. Create Projects (12 projects across 6 columns)
    const projectStatuses = ['pre-producao', 'modelagem', 'iluminacao', 'texturizacao', 'renderizacao', 'pos-producao'];
    for (let i = 1; i <= 12; i++) {
      const status = projectStatuses[Math.floor((i-1)/2)];
      await Project.create({
        title: `Projeto Exemplo ${i}`,
        description: `Briefing detalhado do projeto ArchViz ${i}. Foco em realismo e prazos.`,
        category: i % 2 === 0 ? 'Residencial' : 'Comercial',
        client: i % 3 === 0 ? 'Arquiteto João Silva' : 'Construtora Alpha',
        year: 2026,
        status: status,
        isActive: true,
        isFeatured: i < 4,
        order: i,
        image: `https://picsum.photos/seed/proj${i}/800/600`,
        thumbnail: `https://picsum.photos/seed/proj${i}/400/300`
      });
    }
    console.log('Projects seeded.');

    // 4. Create Finance Transactions (12 transactions)
    const categories = ['Projeto', 'Assinatura Software', 'Hardware', 'Marketing', 'Freelancer'];
    for (let i = 1; i <= 12; i++) {
      const type = i % 3 === 0 ? 'despesa' : 'receita';
      await FinanceTransaction.create({
        type: type,
        description: `${type === 'receita' ? 'Recebimento' : 'Pagamento'} ${i}`,
        amount: Math.floor(Math.random() * 5000) + 500,
        dueDate: new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        category: categories[Math.floor(Math.random() * categories.length)],
        beneficiary: i % 2 === 0 ? 'Zanoello Studio' : 'Fornecedor XYZ',
        status: i % 4 === 0 ? 'pendente' : 'pago',
        paymentMethod: 'Pix',
        bankAccount: 'Nubank'
      });
    }
    console.log('Finance transactions seeded.');

    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
