/**
 * Seed: 15 cards ricos para teste de carga do Kanban CRM
 * Executar: node scripts/seed-crm-cards.js
 */
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'dev.sqlite'),
  logging: false
});

const COLUMNS = ['novo_lead', 'em_contato', 'em_negociacao', 'orcamento_enviado', 'aguardando_fechamento'];
const TYPES = ['Renderização', 'Modelagem 3D', 'Animação', 'Visita Virtual', 'Interiores', 'Arquitetônico'];
const PRIORITIES = ['baixa', 'media', 'alta'];
const ORIGINS = ['Instagram', 'LinkedIn', 'Indicação', 'E-mail', 'Facebook'];
const CITIES = ['São Paulo', 'Curitiba', 'Florianópolis', 'Porto Alegre', 'Rio de Janeiro', 'Belo Horizonte'];
const STATES = ['SP', 'PR', 'SC', 'RS', 'RJ', 'MG'];
const CLIENTS = ['Construtora Horizonte', 'Incorporadora Solaris', 'Arq. Studio Premium', 'MRV Engenharia', 'Cyrela', 'Tegra Inc.', 'Patriani', 'Even Construtora', 'Plaenge', 'Vanguard'];
const NAMES = [
  'Residencial Aurora Premium',
  'Edifício Horizonte Tower',
  'Casa Moderna Jardins',
  'Condomínio Verde Park',
  'Torre Comercial Centro',
  'Mansão Lago Sul',
  'Loft Industrial Batel',
  'Penthouse Ecoville',
  'Villa Toscana Residence',
  'Shopping Center Plaza',
  'Hotel Boutique Marina',
  'Galpão Logístico Ind.',
  'Escola Infantil Montessori',
  'Clínica Premium Saúde',
  'Escritório Corp. Tower'
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
function futureDate(daysMin, daysMax) {
  const d = new Date();
  d.setDate(d.getDate() + rand(daysMin, daysMax));
  return d.toISOString().split('T')[0];
}

async function seed() {
  const cards = [];
  for (let i = 0; i < 15; i++) {
    const status = COLUMNS[i % COLUMNS.length]; // distribute evenly (3 per column)
    const prob = { 'novo_lead': 10, 'em_contato': 25, 'em_negociacao': 50, 'orcamento_enviado': 70, 'aguardando_fechamento': 90 }[status];
    const value = rand(5000, 80000);
    const cityIdx = rand(0, CITIES.length - 1);

    cards.push({
      id: uuid(),
      name: NAMES[i],
      client_name: pick(CLIENTS),
      email: `contato${i + 1}@${pick(['gmail.com', 'outlook.com', 'empresa.com.br'])}`,
      phone: `(${rand(11, 99)}) 9${rand(1000, 9999)}-${rand(1000, 9999)}`,
      project_type: pick(TYPES),
      status,
      priority: pick(PRIORITIES),
      probability: prob + rand(-5, 10),
      estimated_value: value,
      total_area: rand(50, 500),
      production_days: rand(7, 45),
      deadline: futureDate(15, 90),
      expected_close_date: futureDate(5, 60),
      expected_revenue_date: futureDate(30, 120),
      city: CITIES[cityIdx],
      state: STATES[cityIdx],
      origem_projeto: pick(ORIGINS),
      observacao: `Card de teste #${i + 1} — gerado automaticamente para validação de performance e relatórios.`,
      color: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][rand(0, 4)],
      win_status: 'aberto',
      source: 'seed',
      images_count: rand(3, 20),
      animation_seconds: rand(0, 120),
      floor_plans_count: rand(0, 5),
      revisions_included: String(rand(1, 4)),
      target_software: pick(['D5 Render', 'V-Ray', 'Corona', 'Blender', 'Unreal Engine 5']),
      visual_style: pick(['JPG', 'PNG', 'TIFF', 'MP4']),
      installments: rand(1, 6),
      complexity: pick(['Baixa', 'Média', 'Alta', 'Ultra']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Insert
  const cols = Object.keys(cards[0]).join(', ');
  for (const card of cards) {
    const vals = Object.values(card).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
    await sequelize.query(`INSERT INTO budgets (${cols}) VALUES (${vals})`);
  }

  console.log(`✅ 15 cards de teste inseridos no CRM (tipo: vendas)`);
  console.log(`   Distribuição: 3 por coluna (${COLUMNS.join(', ')})`);
  console.log(`   Valores: R$ 5.000 a R$ 80.000`);
  console.log(`   Probabilidades: 5% a 100%`);
  console.log(`   Datas de fechamento: próximos 5-60 dias`);
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
