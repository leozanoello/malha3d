const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Lead-scoped team chat — an exclusive thread between two teammates about one
// specific lead/card, kept separate from the general "Chat da Equipe".
const CRMLeadMessage = sequelize.define('CRMLeadMessage', {
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
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sender_id'
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'sender_name'
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'recipient_id'
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'recipient_name'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'crm_lead_messages',
  timestamps: true,
  underscored: true
});

module.exports = CRMLeadMessage;
