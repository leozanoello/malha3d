const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CRMTask = sequelize.define('CRMTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta'),
    defaultValue: 'media'
  },
  status: {
    type: DataTypes.ENUM('ativa', 'concluida'),
    defaultValue: 'ativa'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'geral'
  },
  taskType: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'task_type'
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'A Fazer',
    comment: 'Coluna do Planejamento kanban onde este card está'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'order'
  }
}, {
  tableName: 'crm_tasks',
  timestamps: true
});

module.exports = CRMTask;
