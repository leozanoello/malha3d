require('dotenv').config();
const { Budget, Client, User, KanbanColumn, FinanceTransaction, Project } = require('../models');

async function seed() {
  try {
    console.log('--- Operação Sistema Vivo: Seeding Data ---');

    // 1. Get or create a default user and client
    const user = await User.findOne() || await User.create({ name: 'Admin Zanoello', email: 'admin@malha3d.com', password: 'admin', role: 'admin' });
    // 1b. Kanban Columns (Integrity Check)
    const crmColumns = [
      { title: 'Novo Lead', statusKey: 'novo_lead', color: '#f97316', type: 'crm', order: 1 },
      { title: 'Em Contato', statusKey: 'contato', color: '#3b82f6', type: 'crm', order: 2 },
      { title: 'Negociando', statusKey: 'negociacao', color: '#8b5cf6', type: 'crm', order: 3 },
      { title: 'Orçamento Enviado', statusKey: 'orcamento', color: '#fbbf24', type: 'crm', order: 4 },
      { title: 'Fechado', statusKey: 'fechado', color: '#10b981', type: 'crm', order: 5 }
    ];

    const salesColumns = [
      { title: 'Entrada', statusKey: 'novo', color: '#f97316', type: 'vendas', order: 1 },
      { title: 'Qualificação', statusKey: 'qualificacao', color: '#3b82f6', type: 'vendas', order: 2 },
      { title: 'Proposta', statusKey: 'proposta', color: '#8b5cf6', type: 'vendas', order: 3 },
      { title: 'Ajustes', statusKey: 'ajustes', color: '#fbbf24', type: 'vendas', order: 4 },
      { title: 'Fechamento', statusKey: 'fechamento', color: '#10b981', type: 'vendas', order: 5 }
    ];

    const projectColumns = [
      { title: 'Modelagem', statusKey: 'modeling', color: '#f97316', type: 'project', order: 1 },
      { title: 'Shading/Texturização', statusKey: 'shading', color: '#3b82f6', type: 'project', order: 2 },
      { title: 'Iluminação', statusKey: 'lighting', color: '#8b5cf6', type: 'project', order: 3 },
      { title: 'Renderização', statusKey: 'rendering', color: '#fbbf24', type: 'project', order: 4 },
      { title: 'Pós-Produção', statusKey: 'post', color: '#10b981', type: 'project', order: 5 },
      { title: 'Entregue', statusKey: 'delivered', color: '#6366f1', type: 'project', order: 6 }
    ];

    for (const col of [...crmColumns, ...salesColumns, ...projectColumns]) {
      await KanbanColumn.findOrCreate({ where: { statusKey: col.statusKey, type: col.type }, defaults: col });
    }
    console.log('Synchronized Kanban Columns.');
    
    const client = await Client.findOne() || await Client.create({ name: 'Cliente Padrão', email: 'contato@cliente.com', phone: '48999999999' });

    // 2. Financeiro (6 Lançamentos)
    const financeData = [
      { description: 'Parcela 1/2 Projeto Residência Minimalista Lages', type: 'receita', category: 'Project', amount: 5500, status: 'recebido', date: new Date() },
      { description: 'Assinatura Anual D5 Render Pro e Revit', type: 'despesa', category: 'Software', amount: 2400, status: 'pago', date: new Date() },
      { description: 'Pagamento à vista Gatificação Apartamento São José', type: 'receita', category: 'Project', amount: 8000, status: 'recebido', date: new Date() },
      { description: 'Freelancer de Modelagem (Projeto Comercial)', type: 'despesa', category: 'Freelancer', amount: 1500, status: 'pendente', date: new Date() },
      { description: 'Internet Starlink Escritório', type: 'despesa', category: 'Fixed', amount: 230, status: 'pago', date: new Date() },
      { description: 'Consultoria Técnica ArchViz', type: 'receita', category: 'Consulting', amount: 1200, status: 'recebido', date: new Date() }
    ];
    for (const data of financeData) {
      await FinanceTransaction.create({ ...data, userId: user.id });
    }
    console.log('Added 6 Finance Transactions.');

    // 3. CRM (6 Leads)
    const leadsData = [
      { name: 'Deck de Madeira - Residência Park', status: 'novo_lead', estimatedValue: 4500, probability: 20, projectType: 'Renderização' },
      { name: 'Loft Industrial - Centro', status: 'negociacao', estimatedValue: 12000, probability: 60, projectType: 'Modelagem 3D' },
      { name: 'Fachada Construtora X', status: 'novo_lead', estimatedValue: 25000, probability: 10, projectType: 'Comercial' },
      { name: 'Área Gourmet - Casa Lago', status: 'negociacao', estimatedValue: 6500, probability: 75, projectType: 'Interiores' },
      { name: 'Projeto Luminotécnico - Galeria', status: 'orcamento', estimatedValue: 3200, probability: 30, projectType: 'Animação' },
      { name: 'Renderização 3D - Prédio Comercial', status: 'contato', estimatedValue: 15000, probability: 50, projectType: 'Arquitetônico' }
    ];
    for (const data of leadsData) {
      await Budget.create({ 
        ...data, 
        clientId: client.id, 
        assignedUserId: user.id, 
        isLead: true, 
        winStatus: 'aberto' 
      });
    }
    console.log('Added 6 CRM Leads.');

    // 4. Projetos (6 Ativos)
    const projectsData = [
      { name: 'Residência Vale Verde', status: 'modeling', progress: 25, projectType: 'Arquitetônico', category: 'arquitetonico' },
      { name: 'Apartamento SkyLine', status: 'shading', progress: 50, projectType: 'Interiores', category: 'interior' },
      { name: 'Escritório Moderno', status: 'rendering', progress: 75, projectType: 'Comercial', category: 'outro' },
      { name: 'Casa de Campo Itaimbé', status: 'lighting', progress: 10, projectType: 'Arquitetônico', category: 'arquitetonico' },
      { name: 'Restaurante Fusion', status: 'post', progress: 40, projectType: 'Comercial', category: 'outro' },
      { name: 'Shopping Jardins', status: 'delivered', progress: 90, projectType: 'Comercial', category: 'outro' }
    ];
    for (const data of projectsData) {
      const b = await Budget.create({ 
        name: data.name, 
        clientId: client.id, 
        assignedUserId: user.id, 
        isLead: false, 
        winStatus: 'ganho', 
        estimatedValue: 10000,
        projectType: data.projectType 
      });
      await Project.create({ 
        title: data.name, 
        image: 'https://via.placeholder.com/800x600', 
        category: data.category, 
        status: data.status, 
        progress: data.progress, 
        budgetId: b.id, 
        clientId: client.id 
      });
    }
    console.log('Added 6 Projects.');
    console.log('Added 6 Projects.');

    console.log('--- Seeding Complete ---');
  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    process.exit();
  }
}

seed();
