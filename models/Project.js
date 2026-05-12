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
  },
  totalArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  softwareStack: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  productionDays: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visualStyle: {
    type: DataTypes.STRING,
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
  ],
  hooks: {
    afterUpdate: async (project, options) => {
      if (project.changed('status') || project.changed('price')) {
        const SystemLog = sequelize.models.SystemLog;
        if (SystemLog) {
          const user = options.user || {};
          const ip = options.ipAddress || 'system';
          let details = `Projeto '${project.title}' (${project.id}) atualizado. `;
          if (project.changed('status')) details += `Status alterado de '${project.previous('status')}' para '${project.status}'. `;
          if (project.changed('price')) details += `Valor alterado de '${project.previous('price')}' para '${project.price}'.`;
          
          await SystemLog.create({
            userId: user.id || null,
            userName: user.name || 'Sistema',
            action: 'PROJECT_UPDATE',
            module: 'projects',
            ipAddress: ip,
            details: details.trim(),
            level: 'info'
          }, { transaction: options.transaction });
        }
      }
    }
  }
});

module.exports = Project;
