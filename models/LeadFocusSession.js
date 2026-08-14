const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadFocusSession = sequelize.define('LeadFocusSession', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
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
  plannedDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'planned_duration'
  },
  actualDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'actual_duration'
  }
}, {
  tableName: 'lead_focus_session',
  underscored: true
});

module.exports = LeadFocusSession;
