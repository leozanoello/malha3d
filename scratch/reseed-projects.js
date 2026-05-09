const { 
  sequelize, 
  Project, 
  KanbanColumn 
} = require('../models');

async function reseedProjects() {
  try {
    await sequelize.sync();
    
    // 1. Clear existing columns and projects
    await KanbanColumn.destroy({ where: {} });
    await Project.destroy({ where: {} });

    // 2. Seed requested Project Stages
    const stages = [
      { title: 'Pré-produção', statusKey: 'pre-producao', color: '#64748b', order: 1 },
      { title: 'Modelagem e Organização', statusKey: 'modelagem', color: '#3b82f6', order: 2 },
      { title: 'Câmeras e Iluminação', statusKey: 'iluminacao', color: '#eab308', order: 3 },
      { title: 'Textura e Detalhamento', statusKey: 'texturizacao', color: '#8b5cf6', order: 4 },
      { title: 'Renderização', statusKey: 'renderizacao', color: '#f97316', order: 5 },
      { title: 'Pós-produção e Entrega', statusKey: 'entrega', color: '#10b981', order: 6 }
    ];
    await KanbanColumn.bulkCreate(stages);
    console.log('Project stages seeded.');

    // 3. Seed 12 Projects across stages
    const projectsData = [
      { title: 'Villa Contemporânea', client: 'Alpha Arch', status: 'pre-producao', category: 'arquitetonico', image: 'https://picsum.photos/seed/p1/800/600' },
      { title: 'Apartamento Loft 22', client: 'Privado', status: 'modelagem', category: 'interior', image: 'https://picsum.photos/seed/p2/800/600' },
      { title: 'Shopping Center Sul', client: 'Moderna Eng', status: 'iluminacao', category: 'exterior', image: 'https://picsum.photos/seed/p3/800/600' },
      { title: 'Sofa Design Tech', client: 'Furniture Co', status: 'texturizacao', category: 'produto', image: 'https://picsum.photos/seed/p4/800/600' },
      { title: 'Animação Walkthrough', client: 'Real Estate', status: 'renderizacao', category: 'animacao', image: 'https://picsum.photos/seed/p5/800/600' },
      { title: 'Masterplan Loteamento', client: 'Horizonte', status: 'entrega', category: 'urbanismo', image: 'https://picsum.photos/seed/p6/800/600' },
      { title: 'Cozinha Gourmet', client: 'Ana Costa', status: 'pre-producao', category: 'interior', image: 'https://picsum.photos/seed/p7/800/600' },
      { title: 'Escritório Híbrido', client: 'Tech Inc', status: 'modelagem', category: 'comercial', image: 'https://picsum.photos/seed/p8/800/600' },
      { title: 'Estádio Olímpico (Mock)', client: 'Gov BR', status: 'iluminacao', category: 'arquitetonico', image: 'https://picsum.photos/seed/p9/800/600' },
      { title: 'Tênis Concept', client: 'Nike (Mock)', status: 'texturizacao', category: 'produto', image: 'https://picsum.photos/seed/p10/800/600' },
      { title: 'Living Room VR', client: 'Meta', status: 'renderizacao', category: 'tour-virtual', image: 'https://picsum.photos/seed/p11/800/600' },
      { title: 'Edifício Infinity', client: 'Infinity', status: 'entrega', category: 'exterior', image: 'https://picsum.photos/seed/p12/800/600' }
    ];
    await Project.bulkCreate(projectsData);
    console.log('12 projects seeded.');

    process.exit(0);
  } catch (error) {
    console.error('Reseed error:', error);
    process.exit(1);
  }
}

reseedProjects();
