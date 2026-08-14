const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadAccountsPayable = sequelize.define('LeadAccountsPayable', {
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
  freelancerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'freelancer_id'
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
  status: {
    type: DataTypes.ENUM('aberto', 'parcial', 'quitado', 'cancelado', 'atrasado'),
    defaultValue: 'aberto'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
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
  costClassification: {
    type: DataTypes.ENUM('fixo', 'variavel'),
    defaultValue: 'variavel',
    field: 'cost_classification'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvalStatus: {
    type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
    defaultValue: 'pendente',
    field: 'approval_status'
  }
}, {
  tableName: 'lead_accounts_payable',
  underscored: true
});

module.exports = LeadAccountsPayable;
