const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Contas a Pagar (Accounts Payable)
 * Cada registro = 1 obrigação de pagamento (freelancer, fornecedor, despesa fixa)
 */
const AccountsPayable = sequelize.define('AccountsPayable', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  freelancerId: { type: DataTypes.UUID, allowNull: true, field: 'freelancer_id' },
  supplierId: { type: DataTypes.UUID, allowNull: true, field: 'supplier_id' },
  projectId: { type: DataTypes.UUID, allowNull: true, field: 'project_id' },
  description: { type: DataTypes.STRING, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'total_amount' },
  installmentsCount: { type: DataTypes.INTEGER, defaultValue: 1, field: 'installments_count' },
  status: { type: DataTypes.ENUM('aberto', 'parcial', 'quitado', 'cancelado', 'atrasado'), defaultValue: 'aberto' },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'due_date' },
  bankAccountId: { type: DataTypes.UUID, allowNull: true, field: 'bank_account_id' },
  chartAccountId: { type: DataTypes.UUID, allowNull: true, field: 'chart_account_id' },
  costCenterId: { type: DataTypes.UUID, allowNull: true, field: 'cost_center_id' },
  costClassification: { type: DataTypes.ENUM('fixo', 'variavel'), defaultValue: 'variavel', field: 'cost_classification' },
  notes: { type: DataTypes.TEXT, allowNull: true },
  approvalStatus: { type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'), defaultValue: 'pendente', field: 'approval_status' }
}, { tableName: 'accounts_payable', underscored: true, timestamps: true });

module.exports = AccountsPayable;
