require('dotenv').config();
const { Budget, sequelize } = require('../models');

const leads = [];
const services = ['Renderização', 'Modelagem 3D', 'Animação', 'Visita Virtual', 'Visualização de Produtos', 'Arquitetônico'];
const softwares = ['3ds Max', 'Blender', 'Unreal Engine', 'Sketchup'];
const engines = ['V-Ray', 'Corona', 'Lumion', 'Enscape'];
const complexities = ['Baixa', 'Média', 'Alta', 'Ultra'];
const statuses = ['novo', 'em_contato', 'proposta', 'negociacao'];

for (let i = 1; i <= 30; i++) {
  leads.push({
    name: `Projeto Cliente ${i}`,
    email: `cliente${i}@exemplo.com`,
    phone: `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`,
    projectType: services[Math.floor(Math.random() * services.length)],
    description: `Briefing detalhado para o projeto de teste número ${i}. Cliente solicita alta qualidade e foco nos materiais.`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    estimatedValue: (Math.random() * 5000 + 1000).toFixed(2),
    probability: Math.floor(Math.random() * 100),
    software: softwares[Math.floor(Math.random() * softwares.length)],
    renderEngine: engines[Math.floor(Math.random() * engines.length)],
    complexity: complexities[Math.floor(Math.random() * complexities.length)],
    expectedRevenueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
    source: 'seed_script'
  });
}

async function seed() {
  try {
    await sequelize.authenticate();
    await Budget.bulkCreate(leads);
    console.log('30 Leads seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Lead seed error:', err);
    process.exit(1);
  }
}

seed();
