const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadAccountsReceivable = sequelize.define('LeadAccountsReceivable', {
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'client_id'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_amount'
  },
  installmentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'installments_count'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method'
  },
  status: {
    type: DataTypes.ENUM('aberto', 'parcial', 'quitado', 'cancelado', 'atrasado'),
    defaultValue: 'aberto'
  },
  bankAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'bank_account_id'
  },
  chartAccountId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'chart_account_id'
  },
  costCenterId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'cost_center_id'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  originDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'origin_date'
  }
}, {
  tableName: 'lead_accounts_receivable',
  underscored: true
});

module.exports = LeadAccountsReceivable;
