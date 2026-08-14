const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectType: {
    type: DataTypes.ENUM(
      'Renderização',
      'Modelagem 3D',
      'Animação',
      'Visita Virtual',
      'Visualização de Produtos',
      'Arquitetônico',
      'Interiores',
      'Comercial',
      'Planta Humanizada',
      'Tour Virtual',
      'Outro'
    ),
    allowNull: true,
    defaultValue: 'Outro'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  kanbanType: {
    type: DataTypes.STRING,
    defaultValue: 'vendas',
    field: 'kanban_type'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'novo'
  },
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta'),
    defaultValue: 'media'
  },
  estimatedValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  renderValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'website'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#f97316'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  probability: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: { min: 0, max: 100 }
  },
  contacts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  leadImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  software: {
    type: DataTypes.STRING,
    allowNull: true
  },
  renderEngine: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetSoftware: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // FRENTE 4: Multiselect de Softwares (JSONB array)
  softwareStack: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  complexity: {
    type: DataTypes.ENUM('Baixa', 'Média', 'Alta', 'Ultra'),
    defaultValue: 'Média'
  },
  expectedRevenueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectedCloseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'expected_close_date',
    comment: 'Data estimada de fechamento — usado pela previsão de vendas CRM'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  visualStyle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  inputFormats: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  nextActionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextActionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  imagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  animationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  floorPlansCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  driveLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  staticImagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  panoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  panoramas360: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'panoramas360'
  },
  animationAI: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationAI'
  },
  imagesCountDiurna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'imagesCountDiurna'
  },
  imagesCountNoturna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'imagesCountNoturna'
  },
  imagesCountMisto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'imagesCountMisto'
  },
  animationSecondsDiurna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationSecondsDiurna'
  },
  animationSecondsNoturna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationSecondsNoturna'
  },
  animationSecondsMisto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationSecondsMisto'
  },
  floorPlansCountDiurna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'floorPlansCountDiurna'
  },
  floorPlansCountNoturna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'floorPlansCountNoturna'
  },
  floorPlansCountMisto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'floorPlansCountMisto'
  },
  panoramas360Diurna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'panoramas360Diurna'
  },
  panoramas360Noturna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'panoramas360Noturna'
  },
  panoramas360Misto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'panoramas360Misto'
  },
  animationAIDiurna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationAIDiurna'
  },
  animationAINoturna: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationAINoturna'
  },
  animationAIMisto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'animationAIMisto'
  },
  imagesFachadaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagesInterioresCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagesPlantaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoFachadaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoInterioresCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoPanoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  winStatus: {
    type: DataTypes.ENUM('aberto', 'ganho', 'perdido'),
    defaultValue: 'aberto'
  },
  lossReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  closeDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'close_date'
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // FRENTE 4: Prazo de Produção Desejado (Dias)
  productionDays: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // FRENTE 4: Budget Estimado do Cliente
  clientBudget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // FRENTE 4: Responsável Comercial (FK para User)
  assignedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_user_id'
  },
  linkedBudgetId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'linked_budget_id'
  },
  portfolioImages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  templateTheme: {
    type: DataTypes.STRING,
    defaultValue: 'design_a'
  },
  // FRENTE 2: Status da Proposta Comercial
  proposalStatus: {
    type: DataTypes.STRING,
    defaultValue: 'rascunho'
  },
  trackingCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // PHASE 3 Expansion: ArchViz Data
  profileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  predominantStyle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pendente', 'pago', 'parcial', 'atrasado', 'cancelado'),
    allowNull: true
  },
  installmentsData: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  receivedFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileQuality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specificationsUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  animationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  extraDeliverables: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  environments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  lightingMood: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  desiredAtmosphere: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moodboardUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  humanizationLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialElements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  firstPreviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  finalDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  revisionsIncluded: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hasUrgency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  urgencyFee: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  valorGanho: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  dataGanhoOportunidade: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectativaInicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  origemProjeto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  prazoDias: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  etiquetas: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  rua: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  complemento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modelagemType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modelagemTypeCustom: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectClass: {
    type: DataTypes.STRING,
    allowNull: true
  },
  plannerColumns: {
    type: DataTypes.JSONB,
    defaultValue: ['A Fazer', 'Em Andamento', 'Concluído'],
    field: 'planner_columns',
    comment: 'Colunas do Planejamento Kanban interno do card'
  }
}, {
  tableName: 'budgets',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['project_type']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Budget;
