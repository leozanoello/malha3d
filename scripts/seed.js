const { sequelize } = require('../config/database');
const { User, Client, Budget, CalendarEvent, Project } = require('../models');

async function runSeed() {
  try {
    console.log('Syncing database (alter: true)...');
    await sequelize.sync({ force: true });
    
    // Get the first user (usually the admin)

    let user = await User.findOne();
    if (!user) {
      console.log('No user found. Creating admin user...');
      user = await User.create({
        name: 'Admin Zanoello',
        firstName: 'Admin',
        lastName: 'Zanoello',
        email: 'admin@zanoello.com',
        password: 'password123', // In real app it should be hashed
        role: 'admin',
        isActive: true,
        permissions: {}
      });
    }

    const userId = user.id;

    console.log(`Seeding data for user ${userId}...`);

    // 1. Create a few Clients (Stakeholders)
    const clientA = await Client.create({
      name: 'João Arquiteto Silva',
      type: 'PF',
      category: 'Parceiro',
      email: 'joao.arq@example.com',
      phone: '11999990001',
      telegram: '@joaoarq',
      address: 'Av Paulista, 1000, Bela Vista, SP',
      city: 'São Paulo',
      state: 'SP',
      document: '123.456.789-00',
      paymentMethods: ['Dinheiro', 'TED'],
      hasContract: true,
      userId
    });

    const clientB = await Client.create({
      name: 'Construtora Horizonte LTDA',
      type: 'PJ',
      category: 'Cliente',
      email: 'contato@horizonte.com',
      phone: '1133330000',
      company: 'Construtora Horizonte',
      telegram: '@construtorahorizonte',
      address: 'Rua Faria Lima, 200, SP',
      city: 'São Paulo',
      state: 'SP',
      document: '11.222.333/0001-44',
      paymentMethods: ['Pagamento Online'],
      hasContract: true,
      userId
    });

    // 2. Create a Lead (Budget / Negociação)
    await Budget.create({
      name: 'Residencial Aurora',
      clientName: 'Construtora Horizonte LTDA',
      projectType: 'Residencial',
      status: 'proposta', // Leads are tracked in budgets table, status maps to column
      profileType: 'Construtora',
      projectCategory: 'Loteamento',
      predominantStyle: 'Moderno',
      city: 'Curitiba',
      state: 'PR',
      totalArea: 1500,
      estimatedValue: 15000,
      clientId: clientB.id,
      userId
    });

    // 3. Create a Project
    await Project.create({
      title: 'Render Residencial Aurora',
      name: 'Render Residencial Aurora',
      image: '/assets/images/placeholder.jpg',
      category: 'Residencial',
      description: 'Projeto de renders completos para o empreendimento',
      status: 'active',
      kanbanStatus: 'producao',
      clientId: clientB.id,
      userId
    });

    // 4. Create an Event in Calendar
    await CalendarEvent.create({
      title: 'Reunião Kick-off Horizonte',
      type: 'reuniao',
      start: new Date(new Date().setHours(10,0,0,0)),
      end: new Date(new Date().setHours(11,0,0,0)),
      linkedEntity: `CRM: Residencial Aurora`,
      description: 'Definir escopo dos renders do decorado',
      notifyEmail: true,
      notifySystem: true,
      userId
    });

    console.log('Mock data seeded successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

runSeed();
