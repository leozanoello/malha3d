const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskDependency = sequelize.define('TaskDependency', {
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
  dependsOnTaskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'depends_on_task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
  }
}, {
  tableName: 'task_dependencies',
  timestamps: true,
  underscored: true
});

module.exports = TaskDependency;
