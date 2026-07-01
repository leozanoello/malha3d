const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeLog = sequelize.define('TimeLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  taskType: {
    type: DataTypes.ENUM('modeling', 'rendering', 'animation', 'post_production', 'meeting', 'other'),
    defaultValue: 'other'
  },
  status: {
    type: DataTypes.ENUM('running', 'completed', 'paused'),
    defaultValue: 'running'
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  freelancerId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'time_logs',
  timestamps: true,
  underscored: true
});

module.exports = TimeLog;
