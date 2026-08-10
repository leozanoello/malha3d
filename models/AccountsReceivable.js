const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Contas a Receber (Accounts Receivable)
 * Cada registro = 1 contrato/projeto com parcelas
 * Vinculado a Budget (CRM) ou Project
 */
const AccountsReceivable = sequelize.define('AccountsReceivable', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  budgetId: { type: DataTypes.UUID, allowNull: true, field: 'budget_id' },
  projectId: { type: DataTypes.UUID, allowNull: true, field: 'project_id' },
  clientId: { type: DataTypes.UUID, allowNull: true, field: 'client_id' },
  description: { type: DataTypes.STRING, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'total_amount' },
  installmentsCount: { type: DataTypes.INTEGER, defaultValue: 1, field: 'installments_count' },
  paymentMethod: { type: DataTypes.STRING, allowNull: true, field: 'payment_method' },
  status: { type: DataTypes.ENUM('aberto', 'parcial', 'quitado', 'cancelado', 'atrasado'), defaultValue: 'aberto' },
  bankAccountId: { type: DataTypes.UUID, allowNull: true, field: 'bank_account_id' },
  chartAccountId: { type: DataTypes.UUID, allowNull: true, field: 'chart_account_id' },
  costCenterId: { type: DataTypes.UUID, allowNull: true, field: 'cost_center_id' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  originDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'origin_date' }
}, { tableName: 'accounts_receivable', underscored: true, timestamps: true });

module.exports = AccountsReceivable;
