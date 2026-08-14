const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadFinanceTransaction = sequelize.define('LeadFinanceTransaction', {
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
  type: {
    type: DataTypes.ENUM('receita', 'despesa', 'transferir'),
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  beneficiary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado'),
    defaultValue: 'pendente'
  },
  dueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'due_date'
  },
  competenceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'competence_date'
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'payment_date'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method'
  },
  bankAccount: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'bank_account'
  },
  recurrence: {
    type: DataTypes.ENUM('unica', 'diaria', 'semanal', 'mensal', 'anual'),
    defaultValue: 'unica'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  accountPlan: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'account_plan'
  },
  costCenter: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cost_center'
  },
  costClassification: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'cost_classification'
  }
}, {
  tableName: 'lead_finance_transactions',
  underscored: true
});

module.exports = LeadFinanceTransaction;
