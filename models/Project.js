const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'interior',
      'exterior',
      'produto',
      'arquitetonico',
      'animacao',
      'outro'
    ),
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  client: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'briefing'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  clientId: {
    type: DataTypes.UUID,
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
  complexity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
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
  }
}, {
  tableName: 'projects',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order']
    }
  ]
});

module.exports = Project;
