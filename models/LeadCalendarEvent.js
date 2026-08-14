const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadCalendarEvent = sequelize.define('LeadCalendarEvent', {
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
  title: {
    type: DataTypes.STRING,
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
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'lead_calendar_events',
  underscored: true
});

module.exports = LeadCalendarEvent;
