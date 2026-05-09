require('dotenv').config();
const { 
  sequelize, 
  Client, 
  Budget, 
  FinanceTransaction, 
  Project, 
  KanbanColumn 
} = require('../models');

async function seed() {
  try {
    await sequelize.sync();
    console.log('Database synced.');

    // 1. Seed Kanban Columns if empty
    const colCount = await KanbanColumn.count();
    if (colCount === 0) {
      await KanbanColumn.bulkCreate([
        { title: 'Novas Oportunidades', statusKey: 'novo', color: '#f97316', order: 1 },
        { title: 'Qualificação', statusKey: 'qualificacao', color: '#3b82f6', order: 2 },
        { title: 'Proposta Enviada', statusKey: 'proposta', color: '#8b5cf6', order: 3 },
        { title: 'Negociação', statusKey: 'negociacao', color: '#ec4899', order: 4 },
        { title: 'Contrato Assinado', statusKey: 'fechado', color: '#10b981', order: 5 }
      ]);
      console.log('Kanban columns seeded.');
    }

    // 2. Seed Clients
    const clients = await Client.bulkCreate([
      { name: 'Studio Alpha Arquitetura', email: 'contato@studioalpha.com', company: 'Alpha Arch', category: 'Cliente', type: 'PJ', phone: '(11) 98888-7777' },
      { name: 'Engenharia Moderna Ltda', email: 'financeiro@engmoderna.com', company: 'Moderna Eng', category: 'Cliente', type: 'PJ', phone: '(11) 97777-6666' },
      { name: 'Ricardo Santos', email: 'ricardo@gmail.com', company: 'Autônomo', category: 'Lead', type: 'PF', phone: '(21) 96666-5555' },
      { name: 'Mariana Costa Design', email: 'mariana@design.com', company: 'MC Design', category: 'Parceiro', type: 'PF', phone: '(31) 95555-4444' },
      { name: 'Construtora Horizonte', email: 'obras@horizonte.com.br', company: 'Horizonte', category: 'Cliente', type: 'PJ', phone: '(41) 94444-3333' },
      { name: 'Gisele Bündchen (Mock)', email: 'gisele@fashion.com', company: 'Fashion Inc', category: 'Lead', type: 'PF' },
      { name: 'Apple Inc (Brazil)', email: 'hq@apple.com.br', company: 'Apple', category: 'Lead', type: 'PJ' },
      { name: 'Google Cloud Team', email: 'cloud@google.com', company: 'Google', category: 'Parceiro', type: 'PJ' },
      { name: 'Felipe Massa', email: 'felipe@racing.com', company: 'Massa Racing', category: 'Lead', type: 'PF' },
      { name: 'Anitta (Mock)', email: 'anitta@music.com', company: 'Checkmate', category: 'Cliente', type: 'PF' }
    ]);
    console.log('Clients seeded.');

    // 3. Seed Budgets (Leads)
    await Budget.bulkCreate([
      { name: 'Residência G+L', email: 'contato@gl.com', phone: '(11) 99999-0001', description: 'Modelagem e renderização de residência de alto padrão.', projectType: 'Residencial', estimatedValue: 4500, status: 'novo', software: '3ds Max', renderEngine: 'Corona', probability: 30 },
      { name: 'Interior Apt 402', email: 'joao@apt.com', phone: '(11) 99999-0002', description: 'Design de interiores para apartamento compacto.', projectType: 'Interior', estimatedValue: 2800, status: 'qualificacao', software: 'Sketchup', renderEngine: 'V-Ray', probability: 50 },
      { name: 'Fachada Comercial', email: 'pedro@loja.com', phone: '(11) 99999-0003', description: 'Revitalização de fachada para loja de departamentos.', projectType: 'Exterior', estimatedValue: 6200, status: 'proposta', software: 'Blender', renderEngine: 'Cycles', probability: 75 },
      { name: 'Masterplan Urbano', email: 'urban@city.com', phone: '(11) 99999-0004', description: 'Desenvolvimento de masterplan para novo loteamento.', projectType: 'Urbanismo', estimatedValue: 12000, status: 'negociacao', software: '3ds Max', renderEngine: 'V-Ray', probability: 90 },
      { name: 'Animação Produto', email: 'tech@product.com', phone: '(11) 99999-0005', description: 'Animação técnica de produto para lançamento.', projectType: 'Produto', estimatedValue: 3500, status: 'fechado', software: 'Unreal Engine 5', renderEngine: 'Lumen', probability: 100 },
      { name: 'Reforma Cozinha', email: 'ana@home.com', phone: '(11) 99999-0006', description: 'Reforma completa de cozinha gourmet.', projectType: 'Interior', estimatedValue: 1500, status: 'novo', software: 'Sketchup', renderEngine: 'Enscape', probability: 20 },
      { name: 'Villa Santorini', email: 'lux@villas.com', phone: '(11) 99999-0007', description: 'Imagens fotorrealistas para empreendimento de luxo.', projectType: 'Exterior', estimatedValue: 8900, status: 'proposta', software: '3ds Max', renderEngine: 'Corona', probability: 60 },
      { name: 'Shopping Mall 3D', email: 'mall@retail.com', phone: '(11) 99999-0008', description: 'Visualização 3D de complexo comercial.', projectType: 'Comercial', estimatedValue: 25000, status: 'negociacao', software: '3ds Max', renderEngine: 'V-Ray', probability: 85 },
      { name: 'Living Room VR', email: 'vr@meta.com', phone: '(11) 99999-0009', description: 'Experiência em realidade virtual para sala de estar.', projectType: 'Tour Virtual', estimatedValue: 4000, status: 'qualificacao', software: 'Unreal Engine 5', renderEngine: 'Path Tracing', probability: 40 },
      { name: 'Edifício Infinity', email: 'infra@infinity.com', phone: '(11) 99999-0010', description: 'Animação e renders de edifício corporativo.', projectType: 'Exterior', estimatedValue: 15000, status: 'fechado', software: '3ds Max', renderEngine: 'Corona', probability: 100 }
    ]);
    console.log('Budgets seeded.');

    // 4. Seed Finance Transactions
    await FinanceTransaction.bulkCreate([
      { type: 'receita', description: 'Entrada Projeto Residência G+L', amount: 2250, status: 'pago', category: 'Projetos', paymentMethod: 'PIX' },
      { type: 'receita', description: 'Parcela Final Apt 402', amount: 2800, status: 'pago', category: 'Projetos', paymentMethod: 'Transferência' },
      { type: 'receita', description: 'Assinatura Malha3D Mensal', amount: 299, status: 'pago', category: 'Assinatura', paymentMethod: 'Cartão' },
      { type: 'despesa', description: 'Aluguel Studio Coworking', amount: 1500, status: 'pago', category: 'Operacional', paymentMethod: 'Boleto' },
      { type: 'despesa', description: 'Licença Adobe CC', amount: 240, status: 'pago', category: 'Operacional', paymentMethod: 'Cartão' },
      { type: 'despesa', description: 'Upgrade Placa de Vídeo RTX 4090', amount: 12000, status: 'pago', category: 'Hardware', paymentMethod: 'Transferência' },
      { type: 'receita', description: 'Consultoria Técnica VR', amount: 1200, status: 'pago', category: 'Serviços', paymentMethod: 'PIX' },
      { type: 'despesa', description: 'Google Ads - Campanha Março', amount: 500, status: 'pago', category: 'Marketing', paymentMethod: 'Cartão' },
      { type: 'receita', description: 'Venda de Modelos 3D Marketplace', amount: 450, status: 'pago', category: 'Vendas', paymentMethod: 'PayPal' },
      { type: 'despesa', description: 'Freelancer Modelagem - Edifício Infinity', amount: 3000, status: 'pago', category: 'Freelancers', paymentMethod: 'PIX' },
      { type: 'receita', description: 'Adiantamento Masterplan', amount: 6000, status: 'pago', category: 'Projetos', paymentMethod: 'Transferência' },
      { type: 'despesa', description: 'Internet Fibra 1GB', amount: 150, status: 'pago', category: 'Operacional', paymentMethod: 'Boleto' }
    ]);
    console.log('Finance transactions seeded.');

    // 5. Seed Projects
    await Project.bulkCreate([
      { title: 'Museu do Futuro', client: 'Governo Federal', category: 'arquitetonico', image: 'https://picsum.photos/seed/museu/800/600', isFeatured: true },
      { title: 'Penthouse New York', client: 'Skyline Inc', category: 'interior', image: 'https://picsum.photos/seed/penthouse/800/600' },
      { title: 'Resort Maldivas', client: 'Oceanic Hotels', category: 'exterior', image: 'https://picsum.photos/seed/resort/800/600', isFeatured: true },
      { title: 'Sneaker Tech 3D', client: 'Nike (Mock)', category: 'produto', image: 'https://picsum.photos/seed/sneaker/800/600' },
      { title: 'Centro Comercial Alpha', client: 'Alpha Group', category: 'exterior', image: 'https://picsum.photos/seed/alpha/800/600' },
      { title: 'Cozinha Minimalista', client: 'Privado', category: 'interior', image: 'https://picsum.photos/seed/kitchen/800/600' },
      { title: 'Animação Drone View', client: 'Real Estate XP', category: 'animacao', image: 'https://picsum.photos/seed/drone/800/600' }
    ]);
    console.log('Projects seeded.');

    console.log('Full Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
