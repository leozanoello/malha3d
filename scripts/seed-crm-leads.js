require('dotenv').config();
const { Budget } = require('../models');

const colors = [
  '#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', 
  '#ec4899', '#f59e0b', '#06b6d4', '#84cc16', '#64748b'
];

const leads = [
  {
    name: 'Roberto Alencar',
    email: 'roberto@arquitetura.com',
    phone: '11999999999',
    projectType: 'Renderização',
    description: 'Renderização de alta qualidade para fachada de edifício residencial de luxo.',
    status: 'novo',
    estimatedValue: 4500.00,
    color: colors[0],
    tags: ['Fachada', 'Luxo', 'Urgente'],
    probability: 80,
    software: '3ds Max',
    renderEngine: 'Corona',
    complexity: 'Alta',
    expectedRevenueDate: new Date(2026, 4, 15),
    leadImage: 'https://i.pravatar.cc/150?img=11'
  },
  {
    name: 'Juliana Silva',
    email: 'juliana@interiores.com',
    phone: '11888888888',
    projectType: 'Renderização',
    description: 'Apartamento completo, 5 ambientes internos.',
    status: 'novo',
    estimatedValue: 3200.00,
    color: colors[1],
    tags: ['Interiores', 'Apartamento'],
    probability: 60,
    software: 'SketchUp',
    renderEngine: 'V-Ray',
    complexity: 'Média',
    expectedRevenueDate: new Date(2026, 4, 20),
    leadImage: 'https://i.pravatar.cc/150?img=45'
  },
  {
    name: 'Construtora Noble',
    email: 'contato@noble.com',
    phone: '11777777777',
    projectType: 'Animação',
    description: 'Animação de 60 segundos para lançamento imobiliário.',
    status: 'em_andamento',
    estimatedValue: 12000.00,
    color: colors[2],
    tags: ['Animação', 'Corporativo'],
    probability: 40,
    software: '3ds Max',
    renderEngine: 'Vantage',
    complexity: 'Ultra',
    expectedRevenueDate: new Date(2026, 5, 10),
    leadImage: 'https://i.pravatar.cc/150?img=68'
  },
  {
    name: 'Studio Alpha',
    email: 'alpha@design.com',
    phone: '11666666666',
    projectType: 'Modelagem 3D',
    description: 'Modelagem de mobiliário para catálogo digital.',
    status: 'em_andamento',
    estimatedValue: 1500.00,
    color: colors[3],
    tags: ['Mobiliário', 'Catálogo'],
    probability: 90,
    software: 'Blender',
    renderEngine: 'Cycles',
    complexity: 'Baixa',
    expectedRevenueDate: new Date(2026, 4, 12),
    leadImage: 'https://i.pravatar.cc/150?img=32'
  },
  {
    name: 'Marcos Pontes',
    email: 'marcos@pontes.com',
    phone: '11555555555',
    projectType: 'Visita Virtual',
    description: 'Tour 360 interativo para showroom.',
    status: 'respondido',
    estimatedValue: 5500.00,
    color: colors[4],
    tags: ['360', 'Showroom'],
    probability: 30,
    software: 'Unreal Engine',
    renderEngine: 'Lumen',
    complexity: 'Alta',
    expectedRevenueDate: new Date(2026, 5, 5),
    leadImage: 'https://i.pravatar.cc/150?img=12'
  },
  {
    name: 'Ana Costa',
    email: 'ana@costa.com',
    phone: '11444444444',
    projectType: 'Arquitetônico',
    description: 'Projeto básico para aprovação em condomínio.',
    status: 'respondido',
    estimatedValue: 2800.00,
    color: colors[5],
    tags: ['Projeto', 'Aprovação'],
    probability: 70,
    software: 'Revit',
    renderEngine: 'Enscape',
    complexity: 'Média',
    expectedRevenueDate: new Date(2026, 4, 25),
    leadImage: 'https://i.pravatar.cc/150?img=5'
  },
  {
    name: 'Lucas Brandão',
    email: 'lucas@brandao.com',
    phone: '11333333333',
    projectType: 'Visualização de Produtos',
    description: 'Packshots de embalagens de cosméticos.',
    status: 'fechado',
    estimatedValue: 800.00,
    color: colors[6],
    tags: ['Produto', 'Packshot'],
    probability: 100,
    software: 'Cinema 4D',
    renderEngine: 'Octane',
    complexity: 'Baixa',
    expectedRevenueDate: new Date(2026, 4, 5),
    leadImage: 'https://i.pravatar.cc/150?img=15'
  }
];

async function seedLeads() {
  try {
    await Budget.destroy({ where: {} }); // Clear current
    await Budget.bulkCreate(leads);
    console.log('7 Leads de teste criados com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar leads:', err);
    process.exit(1);
  }
}

seedLeads();
