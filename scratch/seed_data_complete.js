const { Budget, Project, FinanceTransaction, Client, User, KanbanColumn, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    console.log('--- Iniciando Semeadura de Dados (Ambiente Operacional) ---');

    // Sincronizar banco de dados para garantir que as tabelas tenham as colunas novas
    console.log('Sincronizando Banco de Dados...');
    await sequelize.sync({ alter: true });

    const admin = await User.findOne({ where: { email: 'admin@malha3d.com' } });
    if (!admin) throw new Error('Admin user not found. Run create_admin.js first.');

    // 1. Garantir Colunas do Kanban
    console.log('Verificando Colunas do Kanban...');
    const defaultCols = [
      { title: 'Novos Leads', statusKey: 'leads', type: 'vendas', order: 1, color: '#f97316' },
      { title: 'Em Contato', statusKey: 'contato', type: 'vendas', order: 2, color: '#3b82f6' },
      { title: 'Negociando', statusKey: 'negociacao', type: 'vendas', order: 3, color: '#a855f7' },
      { title: 'Modelagem', statusKey: 'modelagem', type: 'producao', order: 1, color: '#ec4899' },
      { title: 'Iluminação', statusKey: 'iluminacao', type: 'producao', order: 2, color: '#eab308' },
      { title: 'Renderização', statusKey: 'renderizacao', type: 'producao', order: 3, color: '#22c55e' },
      { title: 'Pós-Produção', statusKey: 'pos_producao', type: 'producao', order: 4, color: '#06b6d4' }
    ];

    for (const col of defaultCols) {
      await KanbanColumn.findOrCreate({
        where: { statusKey: col.statusKey, type: col.type },
        defaults: col
      });
    }

    // 2. Clientes
    console.log('Criando Clientes...');
    const [client1] = await Client.findOrCreate({ where: { email: 'ricardo@lages.com' }, defaults: { name: 'Ricardo Lages', phone: '48999999999', company: 'Lages Arquitetura' } });
    const [client2] = await Client.findOrCreate({ where: { email: 'juliana@sj.com' }, defaults: { name: 'Juliana São José', phone: '48888888888', company: 'Home Care' } });
    const [client3] = await Client.findOrCreate({ where: { email: 'contato@construtorax.com' }, defaults: { name: 'Construtora X', phone: '48777777777', company: 'Construtora X' } });

    // 3. Financeiro
    console.log('Criando Transações Financeiras...');
    await FinanceTransaction.bulkCreate([
      { description: 'Parcela 1/2 Projeto "Residência Minimalista Lages"', amount: 5500.00, type: 'receita', status: 'pago', category: 'Projeto', dueDate: new Date(), paymentDate: new Date() },
      { description: 'Assinatura Anual D5 Render Pro e Revit', amount: 2400.00, type: 'despesa', status: 'pago', category: 'Softwares', dueDate: new Date(), paymentDate: new Date() },
      { description: 'Pagamento à vista "Gatificação Apartamento São José"', amount: 3200.00, type: 'receita', status: 'pago', category: 'Consultoria', dueDate: new Date(), paymentDate: new Date() },
      { description: 'Freelancer de Modelagem (Projeto Comercial)', amount: 1500.00, type: 'despesa', status: 'pendente', category: 'Freelancer', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { description: 'Internet Starlink Escritório', amount: 250.00, type: 'despesa', status: 'pago', category: 'Infraestrutura', dueDate: new Date(), paymentDate: new Date() },
      { description: 'Consultoria Técnica ArchViz', amount: 1200.00, type: 'receita', status: 'pago', category: 'Serviço', dueDate: new Date(), paymentDate: new Date() }
    ]);

    // 4. CRM
    console.log('Criando Leads CRM...');
    const leads = [
      { name: 'Deck de Madeira - Casa Lago', status: 'leads', estimatedValue: 2500, origin: 'Instagram', probability: 20, projectType: 'Arquitetônico' },
      { name: 'Loft Industrial - Centro', status: 'leads', estimatedValue: 4500, origin: 'Indicação', probability: 30, projectType: 'Interiores' },
      { name: 'Fachada Construtora X', status: 'contato', estimatedValue: 12000, origin: 'Site/Google', probability: 50, clientId: client3.id, projectType: 'Arquitetônico' },
      { name: 'Área Gourmet - Residencial Floripa', status: 'contato', estimatedValue: 3500, origin: 'Instagram', probability: 60, projectType: 'Interiores' },
      { name: 'Reforma Clínica Odonto', status: 'negociacao', estimatedValue: 8000, origin: 'Prospecção Ativa', probability: 80, projectType: 'Interiores' },
      { name: 'Stand de Vendas - Empreendimento Mar', status: 'negociacao', estimatedValue: 15000, origin: 'Indicação', probability: 90, projectType: 'Comercial' }
    ];

    for (const l of leads) {
      await Budget.create({
        ...l,
        trackingCode: `TZ-${uuidv4().substring(0, 8).toUpperCase()}`,
        assignedUserId: admin.id,
        winStatus: 'aberto'
      });
    }

    // 5. Projetos
    console.log('Criando Projetos Ativos...');
    const projects = [
      { title: 'Residência Minimalista Lages', status: 'modelagem', totalArea: 150, softwareStack: ['Revit', '3ds Max'], visualStyle: 'Minimalista', category: 'Residencial', image: '/images/projects/p1.jpg' },
      { title: 'Gatificação Apartamento São José', status: 'iluminacao', totalArea: 80, softwareStack: ['SketchUp', 'D5 Render'], visualStyle: 'Moderno', category: 'Interiores', image: '/images/projects/p2.jpg' },
      { title: 'Escritório Advocacia - Corporate', status: 'renderizacao', totalArea: 120, softwareStack: ['3ds Max', 'Corona'], visualStyle: 'Clássico', category: 'Comercial', image: '/images/projects/p3.jpg' },
      { title: 'Hall de Entrada Edifício Aurora', status: 'pos_producao', totalArea: 45, softwareStack: ['3ds Max', 'Photoshop'], visualStyle: 'Luxo', category: 'Comercial', image: '/images/projects/p4.jpg' },
      { title: 'Piscina & Deck - Casa Vale', status: 'modelagem', totalArea: 60, softwareStack: ['SketchUp', 'Lumion'], visualStyle: 'Tropical', category: 'Lazer', image: '/images/projects/p5.jpg' },
      { title: 'Cozinha Planejada - Apê 302', status: 'iluminacao', totalArea: 15, softwareStack: ['Revit', 'D5 Render'], visualStyle: 'Escandinavo', category: 'Interiores', image: '/images/projects/p6.jpg' }
    ];

    for (const p of projects) {
      await Project.create({
        ...p,
        clientId: client1.id,
        productionDays: 15,
        isActive: true,
        order: 0
      });
    }

    // 6. Propostas
    console.log('Criando Propostas...');
    const propostas = [
      { name: 'Proposta: Revitalização Praça', status: 'leads', estimatedValue: 5000, projectType: 'Arquitetônico' },
      { name: 'Proposta: Interiores Duplex 22', status: 'leads', estimatedValue: 7500, projectType: 'Interiores' },
      { name: 'Proposta: Fachada Comercial Norte', status: 'contato', estimatedValue: 11000, projectType: 'Arquitetônico' },
      { name: 'Proposta: Loft Estudante', status: 'contato', estimatedValue: 3200, projectType: 'Interiores' },
      { name: 'Proposta: Mansão Jurerê', status: 'negociacao', estimatedValue: 45000, projectType: 'Arquitetônico' },
      { name: 'Proposta: Quiosque Praia Brava', status: 'negociacao', estimatedValue: 6800, projectType: 'Comercial' }
    ];

    for (const prop of propostas) {
      await Budget.create({
        ...prop,
        trackingCode: `TZ-PROP-${uuidv4().substring(0, 8).toUpperCase()}`,
        assignedUserId: admin.id,
        winStatus: 'aberto'
      });
    }

    console.log('--- Semeadura concluída com sucesso! ---');
    process.exit(0);
  } catch (error) {
    console.error('Erro na semeadura:', error);
    process.exit(1);
  }
}

seed();
