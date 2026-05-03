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
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
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
    allowNull: false,
    validate: {
      len: [10, 2000]
    }
  },
  status: {
    type: DataTypes.ENUM('novo', 'em_andamento', 'respondido', 'fechado', 'perdido'),
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
