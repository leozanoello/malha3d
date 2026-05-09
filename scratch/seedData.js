const { Client, Budget, Project, FinanceTransaction, sequelize } = require('../models');

async function seed() {
  try {
    console.log('Iniciando semeadura de dados...');
    
    // Limpar dados existentes (opcional, mas bom para garantir o estado)
    // await sequelize.sync({ force: true }); // CUIDADO: Isso apaga tudo, inclusive usuários. Melhor não.

    // 1. Criar Clientes (Stakeholders)
    const clientsData = [
      { name: 'Studio Alpha Arquitetura', email: 'contato@studioalpha.com.br', phone: '(11) 98888-7777', category: 'Cliente', type: 'PJ', company: 'Studio Alpha' },
      { name: 'Construtora Horizonte', email: 'vendas@horizonte.com.br', phone: '(21) 97777-6666', category: 'Cliente', type: 'PJ', company: 'Horizonte Construções' },
      { name: 'Ricardo Mendes', email: 'ricardo@mendes.design', phone: '(41) 96666-5555', category: 'Cliente', type: 'PF', company: 'Freelance' },
      { name: 'Bella Vista Incorporadora', email: 'projetos@bellavista.com.br', phone: '(31) 95555-4444', category: 'Cliente', type: 'PJ', company: 'Bella Vista' },
      { name: 'Ana Paula Arch', email: 'ana@paula.arch', phone: '(48) 94444-3333', category: 'Parceiro', type: 'PF', company: 'Ana Paula Studio' },
      { name: 'Engenharia Direta', email: 'adm@engdireta.com', phone: '(19) 93333-2222', category: 'Fornecedor', type: 'PJ', company: 'Eng Direta' },
      { name: 'Vila Nova Interiores', email: 'marcia@vilanova.com', phone: '(51) 92222-1111', category: 'Cliente', type: 'PJ', company: 'Vila Nova' },
      { name: 'Pedro Santos', email: 'pedro@santos.pro', phone: '(62) 91111-0000', category: 'Prestador', type: 'PF', company: 'Santos 3D' },
      { name: 'Metrópole Urbanismo', email: 'contato@metropole.com.br', phone: '(11) 90000-9999', category: 'Cliente', type: 'PJ', company: 'Metrópole' },
      { name: 'Design & Co', email: 'hello@designco.com', phone: '(11) 99999-8888', category: 'Cliente', type: 'PJ', company: 'Design Co' }
    ];

    const createdClients = await Client.bulkCreate(clientsData);
    console.log(`${createdClients.length} clientes criados.`);

    // 2. Criar Orçamentos (Leads/Oportunidades) no CRM
    const budgetsData = [
      { name: 'Masterplan Residencial', email: 'contato@studioalpha.com.br', phone: '(11) 98888-7777', estimatedValue: 15000.00, probability: 80, status: 'em_negociacao', projectType: 'Renderização', description: 'Visualização completa de condomínio residencial.', clientId: createdClients[0].id, expectedRevenueDate: new Date(2024, 5, 15) },
      { name: 'Render Interior Apto', email: 'ricardo@mendes.design', phone: '(41) 96666-5555', estimatedValue: 3500.00, probability: 50, status: 'novo_lead', projectType: 'Renderização', description: 'Sala de estar e suíte master.', clientId: createdClients[2].id, expectedRevenueDate: new Date(2024, 5, 20) },
      { name: 'Vídeo Promocional Edifício', email: 'vendas@horizonte.com.br', phone: '(21) 97777-6666', estimatedValue: 25000.00, probability: 30, status: 'novo_lead', projectType: 'Animação', description: 'Vídeo de 60 segundos para marketing.', clientId: createdClients[1].id, expectedRevenueDate: new Date(2024, 6, 10) },
      { name: 'Fachada Comercial', email: 'projetos@bellavista.com.br', phone: '(31) 95555-4444', estimatedValue: 8000.00, probability: 90, status: 'fechado', projectType: 'Renderização', description: 'Estudo de materiais para fachada.', clientId: createdClients[3].id, expectedRevenueDate: new Date(2024, 4, 25) },
      { name: 'Tour Virtual 360', email: 'hello@designco.com', phone: '(11) 99999-8888', estimatedValue: 12000.00, probability: 60, status: 'aguardando_resposta', projectType: 'Visita Virtual', description: 'Tour interativo para showroom.', clientId: createdClients[9].id, expectedRevenueDate: new Date(2024, 5, 30) },
      { name: 'Hospital das Clínicas - Ala Norte', email: 'adm@engdireta.com', phone: '(19) 93333-2222', estimatedValue: 45000.00, probability: 40, status: 'em_negociacao', projectType: 'Arquitetônico', description: 'Modelagem técnica e render hospitalar.', clientId: createdClients[5].id, expectedRevenueDate: new Date(2024, 7, 5) }
    ];

    const createdBudgets = await Budget.bulkCreate(budgetsData);
    console.log(`${createdBudgets.length} orçamentos criados.`);

    // 3. Criar Projetos
    const projectsData = [
      { title: 'Residencial Aurora', category: 'exterior', image: '/images/portfolio/project1.jpg', client: 'Bella Vista Incorporadora', year: 2024, isActive: true },
      { title: 'Mall Central', category: 'arquitetonico', image: '/images/portfolio/project2.jpg', client: 'Construtora Horizonte', year: 2024, isActive: true },
      { title: 'Apto Loft 42', category: 'interior', image: '/images/portfolio/project3.jpg', client: 'Ricardo Mendes', year: 2023, isActive: true },
      { title: 'Escritório Hub Tech', category: 'interior', image: '/images/portfolio/project4.jpg', client: 'Studio Alpha Arquitetura', year: 2024, isActive: true },
      { title: 'Arena Poliesportiva', category: 'outro', image: '/images/portfolio/project5.jpg', client: 'Engenharia Direta', year: 2024, isActive: true },
      { title: 'Cozinha Gourmet Vila', category: 'interior', image: '/images/portfolio/project6.jpg', client: 'Vila Nova Interiores', year: 2024, isActive: true }
    ];

    const createdProjects = await Project.bulkCreate(projectsData);
    console.log(`${createdProjects.length} projetos criados.`);

    // 4. Criar Transações Financeiras
    const transactionsData = [
      { type: 'receita', amount: 5000.00, status: 'recebido', category: 'Projeto', description: 'Entrada Residencial Aurora', dueDate: new Date(), bankAccount: 'Bradesco' },
      { type: 'receita', amount: 3500.00, status: 'recebido', category: 'Consultoria', description: 'Consultoria Design Co', dueDate: new Date(), bankAccount: 'NuBank' },
      { type: 'despesa', amount: 1200.00, status: 'pago', category: 'Software', description: 'Assinatura Adobe Creative Cloud', dueDate: new Date(), bankAccount: 'Cartão PJ' },
      { type: 'despesa', amount: 2500.00, status: 'pendente', category: 'Serviços', description: 'Pagamento Freelance Render', dueDate: new Date(Date.now() + 86400000 * 5), bankAccount: 'Bradesco' },
      { type: 'receita', amount: 15000.00, status: 'pendente', category: 'Projeto', description: 'Parcela Final Hub Tech', dueDate: new Date(Date.now() + 86400000 * 10), bankAccount: 'NuBank' },
      { type: 'receita', amount: 8000.00, status: 'recebido', category: 'Projeto', description: 'Pagamento Integral Fachada Comercial', dueDate: new Date(Date.now() - 86400000 * 2), bankAccount: 'Bradesco' },
      { type: 'despesa', amount: 450.00, status: 'pago', category: 'Infraestrutura', description: 'Servidor Render Farm', dueDate: new Date(), bankAccount: 'NuBank' }
    ];

    const createdTransactions = await FinanceTransaction.bulkCreate(transactionsData);
    console.log(`${createdTransactions.length} transações financeiras criadas.`);

    console.log('Semeadura concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro na semeadura:', error);
    process.exit(1);
  }
}

seed();
