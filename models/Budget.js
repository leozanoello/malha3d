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
    allowNull: false,
    validate: {
      len: [3, 100]
    }
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
      'Outro'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
    defaultValue: '#f97316' // Laranja padrão
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
  complexity: {
    type: DataTypes.ENUM('Baixa', 'Média', 'Alta', 'Ultra'),
    defaultValue: 'Média'
  },
  expectedRevenueDate: {
    type: DataTypes.DATE,
    allowNull: true
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
    defaultValue: ""
  },
  imagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  staticImagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  animationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  panoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  winStatus: {
    type: DataTypes.ENUM('aberto', 'ganho', 'perdido'),
    defaultValue: 'aberto'
  },
  lossReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ""
  },
  closeDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'close_date'
  },
  totalArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_area'
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  linkedBudgetId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'linked_budget_id'
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
