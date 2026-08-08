const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Immutable audit trail for a CRM lead/card — entries are only ever created,
// never edited or deleted, so the history stays trustworthy.
const CRMLeadLog = sequelize.define('CRMLeadLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'budget_id'
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
  tableName: 'crm_lead_logs',
  timestamps: true,
  underscored: true
});

module.exports = CRMLeadLog;
