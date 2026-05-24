/**
 * MALHA 3D - Architecture Project Seeder
 * Populates existing projects with rich mock data and architecture images
 */
const path = require('path');

// Set up the database connection
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const { sequelize } = require('../config/database');

async function seedProjects() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const Project = require('../models/Project');
    
    // Force sync only the Project table to add new columns
    await Project.sync({ force: true });
    console.log('✅ Project table recreated with all new columns');
    
    const sampleProjects = [
      {
        title: 'Residência Alphaville Premium',
        description: 'Projeto residencial de alto padrão no Alphaville. Casa contemporânea com 450m² de área construída, fachada em concreto aparente e vidro temperado, piscina infinity edge com borda infinita e deck de madeira cumaru. Paisagismo tropical com iluminação cênica integrada.',
        image: '/uploads/archviz_modern_house.png',
        category: 'exterior',
        client: 'Construtora Horizonte',
        status: 'concluido',
        year: 2026,
        software: 'D5 Render',
        renderEngine: 'D5 Render',
        complexity: 'Alta',
        priority: 'alta',
        price: 18500.00,
        totalArea: 450.00,
        productionDays: 12,
        origin: 'Instagram',
        visualStyle: 'Contemporâneo',
        city: 'Barueri',
        state: 'SP',
        isFeatured: true,
        isActive: true,
        startDate: new Date('2026-03-01'),
        deadline: new Date('2026-03-15'),
        tags: 'residencial,alphaville,premium,fachada',
        projectType: 'Arquitetônico',
        imagesCount: 8,
        staticImagesCount: 6,
        imagesFachadaCount: 4,
        imagesInterioresCount: 2,
        panoramasCount: 2,
        imageFormat: '4K TIFF',
        imageResolution: ['3840x2160', '7680x4320'],
        environments: ['Fachada Principal', 'Fachada Lateral', 'Piscina', 'Jardim', 'Sala de Estar', 'Cozinha Gourmet'],
        lightingMood: ['Golden Hour', 'Blue Hour', 'Diurno'],
        softwareStack: ['SketchUp', 'D5 Render', 'Photoshop'],
        portfolioImages: ['/uploads/archviz_modern_house.png'],
        revisionsIncluded: '3 revisões',
        humanizationLevel: 'Alto'
      },
      {
        title: 'Penthouse Itaim Bibi',
        description: 'Visualização 3D de cobertura duplex de 320m² no Itaim Bibi. Design interior minimalista com acabamentos em mármore Calacatta, mobiliário italiano de design autoral e vista panorâmica 270° para a skyline paulistana. Iluminação indireta Tromilux integrada.',
        image: '/uploads/archviz_penthouse_interior.png',
        category: 'interior',
        client: 'Studio Mira Arquitetura',
        status: 'concluido',
        year: 2026,
        software: '3ds Max',
        renderEngine: 'Corona Renderer',
        complexity: 'Ultra',
        priority: 'alta',
        price: 24800.00,
        totalArea: 320.00,
        productionDays: 18,
        origin: 'Indicação',
        visualStyle: 'Minimalista Luxo',
        city: 'São Paulo',
        state: 'SP',
        isFeatured: true,
        isActive: true,
        startDate: new Date('2026-02-10'),
        deadline: new Date('2026-03-05'),
        tags: 'interior,penthouse,luxo,itaim,cobertura',
        projectType: 'Interiores',
        imagesCount: 12,
        staticImagesCount: 10,
        imagesInterioresCount: 10,
        imagesFachadaCount: 2,
        panoramasCount: 4,
        imageFormat: '8K TIFF',
        imageResolution: ['7680x4320'],
        environments: ['Living Room', 'Master Suite', 'Cozinha Gourmet', 'Home Office', 'Varanda Gourmet', 'Lavabo', 'Spa', 'Terraço'],
        lightingMood: ['Noturno Aconchegante', 'Diurno Natural', 'Entardecer Dourado'],
        softwareStack: ['3ds Max', 'Corona Renderer', 'Photoshop', 'After Effects'],
        portfolioImages: ['/uploads/archviz_penthouse_interior.png'],
        revisionsIncluded: '5 revisões',
        humanizationLevel: 'Premium',
        desiredAtmosphere: 'Sofisticado e aconchegante'
      },
      {
        title: 'Torre Corporativa Faria Lima',
        description: 'Renderização completa de edifício corporativo Triple A na Av. Faria Lima. 28 pavimentos, fachada pele de vidro com sistema ACP em alumínio escovado, praça de convivência com espelho d\'água, certificação LEED Platinum. Entrega de animação flythrough 4K de 45 segundos.',
        image: '/uploads/archviz_commercial_tower.png',
        category: 'arquitetonico',
        client: 'BR Properties S.A.',
        status: 'concluido',
        year: 2026,
        software: '3ds Max',
        renderEngine: 'V-Ray',
        complexity: 'Ultra',
        priority: 'alta',
        price: 45000.00,
        totalArea: 12000.00,
        productionDays: 30,
        origin: 'LinkedIn',
        visualStyle: 'Corporativo Premium',
        city: 'São Paulo',
        state: 'SP',
        isFeatured: true,
        isActive: true,
        startDate: new Date('2026-01-15'),
        deadline: new Date('2026-02-28'),
        tags: 'comercial,torre,corporativo,faria-lima,leed',
        projectType: 'Comercial',
        imagesCount: 15,
        staticImagesCount: 12,
        imagesFachadaCount: 8,
        imagesInterioresCount: 4,
        panoramasCount: 3,
        animationSeconds: 45,
        videoFachadaCount: 1,
        imageFormat: '8K TIFF',
        videoFormat: 'MP4 H.265',
        imageResolution: ['7680x4320'],
        videoResolution: ['3840x2160'],
        environments: ['Fachada Diurna', 'Fachada Noturna', 'Praça Central', 'Lobby', 'Escritório Tipo', 'Terraço Rooftop', 'Heliponto'],
        lightingMood: ['Twilight Dramático', 'Diurno Corporativo', 'Noturno Iluminado'],
        softwareStack: ['3ds Max', 'V-Ray', 'Photoshop', 'After Effects', 'Premiere Pro'],
        portfolioImages: ['/uploads/archviz_commercial_tower.png'],
        revisionsIncluded: '4 revisões',
        humanizationLevel: 'Alto',
        desiredAtmosphere: 'Imponente e tecnológico'
      },
      {
        title: 'Villa Paradiso Trancoso',
        description: 'Projeto de casa de praia de luxo em Trancoso, Bahia. Arquitetura bioclimática com materiais naturais (madeira de demolição, pedra local, telhado verde). 380m² com integração total interior-exterior, deck panorâmico sobre o oceano e piscina naturalística.',
        image: '/uploads/archviz_beach_villa.png',
        category: 'exterior',
        client: 'Arq. Rafael Mendonça',
        status: 'concluido',
        year: 2026,
        software: 'SketchUp',
        renderEngine: 'D5 Render',
        complexity: 'Alta',
        priority: 'media',
        price: 15200.00,
        totalArea: 380.00,
        productionDays: 10,
        origin: 'website',
        visualStyle: 'Tropical Contemporâneo',
        city: 'Porto Seguro',
        state: 'BA',
        isFeatured: true,
        isActive: true,
        startDate: new Date('2026-04-01'),
        deadline: new Date('2026-04-15'),
        tags: 'praia,villa,trancoso,bahia,tropical,sustentavel',
        projectType: 'Arquitetônico',
        imagesCount: 10,
        staticImagesCount: 8,
        imagesFachadaCount: 5,
        imagesInterioresCount: 3,
        panoramasCount: 2,
        imageFormat: '4K PNG',
        imageResolution: ['3840x2160', '5120x2880'],
        environments: ['Fachada Principal', 'Deck Piscina', 'Vista Oceano', 'Sala Integrada', 'Suite Master', 'Terraço Sunset'],
        lightingMood: ['Golden Hour Tropical', 'Meio-Dia Ensolarado', 'Entardecer Rosa'],
        softwareStack: ['SketchUp', 'D5 Render', 'Lightroom'],
        portfolioImages: ['/uploads/archviz_beach_villa.png'],
        revisionsIncluded: '3 revisões',
        humanizationLevel: 'Médio',
        desiredAtmosphere: 'Relaxante e tropical'
      }
    ];

    // Create all projects (table was force-synced)
    for (const data of sampleProjects) {
      await Project.create(data);
      console.log(`✅ Created project: ${data.title}`);
    }

    const finalProjects = await Project.findAll();
    console.log(`\n🎉 Done! ${finalProjects.length} projects now in database:`);
    finalProjects.forEach(p => {
      console.log(`   • ${p.title} [${p.status}] - R$ ${p.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
}

seedProjects();
