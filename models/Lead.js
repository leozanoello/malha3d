const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // ===== CAMPOS PRINCIPAIS (espelhando Project) =====
  title: {
    type: DataTypes.STRING,
    allowNull: true, // nullable para suportar Feature Toggles
    validate: { len: [3, 100] }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('interior', 'exterior', 'produto', 'arquitetonico', 'animacao', 'outro', '3d', 'ArchViz', 'Modelagem', 'Renderização'),
    allowNull: true,
    defaultValue: 'outro'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'novo'
  },
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta'),
    defaultValue: 'media'
  },
  // ===== TAGS / METADADOS =====
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // ===== CONTATOS / CLIENTE =====
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  // ===== FINANCEIRO =====
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  installmentsData: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pendente', 'pago', 'parcial', 'atrasado', 'cancelado'),
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  renderValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  // ===== DATAS =====
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectedRevenueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectedCloseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'expected_close_date'
  },
  nextActionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  closeDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'close_date'
  },
  // ===== DESIGN / ESTILOS =====
  complexity: {
    type: DataTypes.ENUM('Baixa', 'Média', 'Alta', 'Ultra'),
    defaultValue: 'Média'
  },
  visualStyle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#f97316'
  },
  // ===== SOFTWARES / PIPELINE =====
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
  softwareStack: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // ===== PROJETO / PRODUÇÃO =====
  projectType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileType: {
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
  totalArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  productionDays: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // ===== ARQUIVOS / LINKS =====
  driveLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  leadImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moodboardUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specificationsUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // ===== CONTADORES =====
  imagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  animationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  staticImagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  panoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  floorPlansCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  animationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // ===== REVISÕES / URGÊNCIA =====
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
  // ===== HUMANIZAÇÃO / ATMOSFERA =====
  desiredAtmosphere: {
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
  lightingMood: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  environments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  inputFormats: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  extraDeliverables: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // ===== RASTREAMENTO / ADMIN =====
  source: {
    type: DataTypes.STRING,
    defaultValue: 'website'
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  origemProjeto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  externalToken: {
    type: DataTypes.UUID,
    unique: true,
    defaultValue: () => require('uuid').v4()
  },
  // ===== CRM / VENDAS =====
  probability: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: { min: 0, max: 100 }
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
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nextActionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  // ===== PLANEJAMENTO =====
  plannerColumns: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // ===== ADMIN / UI =====
  assignedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_user_id'
  },
  assignedFreelancerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  templateTheme: {
    type: DataTypes.STRING,
    defaultValue: 'design_a'
  },
  portfolioImages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  videoResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  imageResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'leads_extended',
  indexes: [
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Lead;
