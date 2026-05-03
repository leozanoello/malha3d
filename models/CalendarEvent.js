const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
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
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'project_id'
  },
  contactId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'contact_id'
  }
}, {
  tableName: 'calendar_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CalendarEvent;
