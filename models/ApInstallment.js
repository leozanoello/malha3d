const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Parcelas de Contas a Pagar
 * Cada linha = 1 parcela de um AccountsPayable
 */
const ApInstallment = sequelize.define('ApInstallment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  payableId: { type: DataTypes.UUID, allowNull: false, field: 'payable_id' },
  installmentNumber: { type: DataTypes.INTEGER, allowNull: false, field: 'installment_number' },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
  paidDate: { type: DataTypes.DATEONLY, allowNull: true, field: 'paid_date' },
  paidAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true, field: 'paid_amount' },
  status: { type: DataTypes.ENUM('pendente', 'pago', 'atrasado', 'cancelado'), defaultValue: 'pendente' },
  bankAccountId: { type: DataTypes.UUID, allowNull: true, field: 'bank_account_id' },
  paymentMethod: { type: DataTypes.STRING, allowNull: true, field: 'payment_method' },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'ap_installments', underscored: true, timestamps: true });

module.exports = ApInstallment;
