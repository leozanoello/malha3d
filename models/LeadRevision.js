const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadRevision = sequelize.define('LeadRevision', {
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
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  financialImpact: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deadlineImpact: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('solicitada', 'em_analise', 'aprovada', 'rejeitada', 'concluida'),
    defaultValue: 'solicitada'
  }
}, {
  tableName: 'lead_revisions'
});

module.exports = LeadRevision;
