/**
 * Zanoello 3D - Setup Script
 * Initializes the project with necessary directories and demo data
 */

const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const GALLERY_DIR = path.join(UPLOADS_DIR, 'gallery');

async function createDirectories() {
  console.log('📁 Creating necessary directories...');

  const directories = [
    DATA_DIR,
    UPLOADS_DIR,
    GALLERY_DIR,
    path.join(__dirname, '..', 'public', 'images', 'gallery'),
    path.join(__dirname, '..', 'public', 'images', 'uploads')
  ];

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.log(`ℹ️  Directory already exists or error: ${dir}`);
    }
  }
}

async function createDefaultData() {
  console.log('📝 Creating default data files...');

  // Default gallery data
  const defaultGallery = [
    {
      id: 1,
      title: 'Residência Moderna - Vista Externa',
      description: 'Renderização 3D de residência moderna com 300m², destaque para a fachada contemporânea',
      category: 'residential',
      project: 'Casa das Acácias',
      featured: true,
      url: '/images/gallery/residencia-moderna-1.jpg',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Escritório Corporativo - Lobby',
      description: 'Visualização do lobby principal de escritório corporativo de alto padrão',
      category: 'commercial',
      project: 'Torre Business Center',
      featured: true,
      url: '/images/gallery/escritorio-lobby-1.jpg',
      created_at: '2024-01-10T14:20:00Z',
      updated_at: '2024-01-10T14:20:00Z'
    },
    {
      id: 3,
      title: 'Indústria - Fábrica Moderna',
      description: 'Renderização de complexo industrial moderno com foco em sustentabilidade',
      category: 'industrial',
      project: 'Polo Industrial Verde',
      featured: false,
      url: '/images/gallery/industria-fabrica-1.jpg',
      created_at: '2024-01-08T09:15:00Z',
      updated_at: '2024-01-08T09:15:00Z'
    },
    {
      id: 4,
      title: 'Residência Luxo - Interiores',
      description: 'Visualização de interiores luxuosos com iluminação natural e materiais premium',
      category: 'residential',
      project: 'Residência Alphaville',
      featured: true,
      url: '/images/gallery/residencia-luxo-interior.jpg',
      created_at: '2024-01-05T16:45:00Z',
      updated_at: '2024-01-05T16:45:00Z'
    }
  ];

  // Default calculator configuration
  const defaultCalculatorConfig = {
    step1_a_label: 'Residencial Simples',
    step1_a_multiplier: 1.0,
    step1_a_base_price: 50.00,
    step1_b_label: 'Residencial Médio',
    step1_b_multiplier: 1.5,
    step1_b_base_price: 75.00,
    step1_c_label: 'Residencial Alto Padrão',
    step1_c_multiplier: 2.0,
    step1_c_base_price: 100.00,

    step2_a_label: 'Baixa Complexidade',
    step2_a_multiplier: 1.0,
    step2_b_label: 'Média Complexidade',
    step2_b_multiplier: 1.3,
    step2_c_label: 'Alta Complexidade',
    step2_c_multiplier: 1.6,

    step3_a_label: 'Prazo Normal (30 dias)',
    step3_a_multiplier: 1.0,
    step3_b_label: 'Prazo Rápido (15 dias)',
    step3_b_multiplier: 1.2,
    step3_c_label: 'Prazo Urgente (7 dias)',
    step3_c_multiplier: 1.5,

    base_price_per_sqm: 25.00,
    currency: 'BRL',
    min_area: 50,
    max_area: 1000
  };

  // Default calculations history
  const defaultCalculations = [
    {
      id: 1,
      date: '2024-01-15T14:30:00Z',
      client: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      area: 250,
      step1: 'Residencial Médio',
      step2: 'Média Complexidade',
      step3: 'Prazo Normal (30 dias)',
      totalValue: 12187.50,
      details: 'Residência com 250m², projeto completo com visualizações internas e externas',
      status: 'pending'
    },
    {
      id: 2,
      date: '2024-01-14T16:45:00Z',
      client: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(21) 98888-8888',
      area: 180,
      step1: 'Comercial',
      step2: 'Alta Complexidade',
      step3: 'Prazo Rápido (15 dias)',
      totalValue: 11232.00,
      details: 'Escritório corporativo com área de 180m², necessita de visualizações detalhadas',
      status: 'approved'
    }
  ];

  // Default site configuration
  const defaultConfig = {
    site: {
      title: 'Zanoello 3D - Renderizações Arquitetônicas',
      description: 'Especialista em renderizações 3D para arquitetura com mais de 10 anos de experiência',
      keywords: 'renderização 3D, arquitetura, visualização, design, portfolio 3D',
      author: 'Zanoello 3D',
      contact: {
        email: 'contato@zanoello3d.com.br',
        phone: '(11) 99999-9999',
        address: 'São Paulo, SP'
      },
      social: {
        instagram: '@zanoello3d',
        linkedin: 'zanoello3d',
        whatsapp: '(11) 99999-9999'
      }
    },
    calculator: defaultCalculatorConfig
  };

  // Default admin user
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      email: 'admin@zanoello3d.com.br',
      role: 'admin',
      name: 'Administrador',
      created_at: new Date().toISOString(),
      last_login: null
    }
  ];

  // Write data files
  const files = [
    { path: path.join(DATA_DIR, 'gallery.json'), data: defaultGallery },
    { path: path.join(DATA_DIR, 'calculations.json'), data: defaultCalculations },
    { path: path.join(DATA_DIR, 'config.json'), data: defaultConfig },
    { path: path.join(DATA_DIR, 'users.json'), data: defaultUsers }
  ];

  for (const file of files) {
    try {
      await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
      console.log(`✅ Created file: ${file.path}`);
    } catch (error) {
      console.error(`❌ Error creating file: ${file.path}`, error);
    }
  }
}

async function createDemoImages() {
  console.log('🖼️  Creating demo images...');

  const demoImages = [
    {
      filename: 'residencia-moderna-1.jpg',
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
    },
    {
      filename: 'escritorio-lobby-1.jpg',
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
    },
    {
      filename: 'industria-fabrica-1.jpg',
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
    },
    {
      filename: 'residencia-luxo-interior.jpg',
      content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
    }
  ];

  for (const image of demoImages) {
    try {
      const imagePath = path.join(__dirname, '..', 'public', 'images', 'gallery', image.filename);

      // Convert base64 to buffer and save
      const base64Data = image.content.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      await fs.writeFile(imagePath, buffer);
      console.log(`✅ Created demo image: ${image.filename}`);
    } catch (error) {
      console.error(`❌ Error creating demo image: ${image.filename}`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting Zanoello 3D Setup...\n');

  try {
    await createDirectories();
    await createDefaultData();
    await createDemoImages();

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm start');
    console.log('3. Visit: http://localhost:3000');
    console.log('4. Admin panel: http://localhost:3000/admin');
    console.log('5. Default admin credentials: admin / admin123');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { createDirectories, createDefaultData, createDemoImages };
