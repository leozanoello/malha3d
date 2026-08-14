const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadTimeLog = sequelize.define('LeadTimeLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leadId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'lead_id'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'duration_minutes'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'hourly_rate'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'total_cost'
  },
  taskType: {
    type: DataTypes.ENUM('analise', 'design', 'desenvolvimento', 'revisao', 'reuniao', 'outro'),
    defaultValue: 'outro',
    field: 'task_type'
  },
  status: {
    type: DataTypes.ENUM('running', 'completed', 'paused'),
    defaultValue: 'running'
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'task_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  freelancerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'freelancer_id'
  }
}, {
  tableName: 'lead_time_logs',
  underscored: true
});

module.exports = LeadTimeLog;
