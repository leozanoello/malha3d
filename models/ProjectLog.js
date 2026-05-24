const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProjectLog = sequelize.define('ProjectLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_name'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'project_logs',
  timestamps: true,
  underscored: true
});

module.exports = ProjectLog;
