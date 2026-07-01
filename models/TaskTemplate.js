const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskTemplate = sequelize.define('TaskTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  content: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'task_templates',
  timestamps: true,
  underscored: true
});

module.exports = TaskTemplate;
