const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectTemplate = sequelize.define('ProjectTemplate', {
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
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'project_templates'
});

module.exports = ProjectTemplate;
