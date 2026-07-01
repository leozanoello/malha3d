const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskHistoryComment = sequelize.define('TaskHistoryComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('system', 'team_comment', 'client_feedback'),
    defaultValue: 'team_comment'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'task_history_comments',
  timestamps: true,
  underscored: true
});

module.exports = TaskHistoryComment;
