const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  milestoneId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'milestone_id',
    references: {
      model: 'milestones',
      key: 'id'
    }
  },
  parentTaskId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_task_id',
    references: {
      model: 'tasks',
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
  status: {
    type: DataTypes.STRING,
    defaultValue: 'a_fazer' // a_fazer, em_modelagem, renderizando, revisao_cliente, concluido
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'media'
  },
  startDate: {
    type: DataTypes.DATE,
    field: 'start_date',
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    field: 'due_date',
    allowNull: true
  },
  assigneeId: {
    type: DataTypes.UUID,
    field: 'assignee_id',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  estimatedMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'estimated_minutes'
  },
  spentMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'spent_minutes'
  },
  revisionRound: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'revision_round'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true
});

module.exports = Task;
