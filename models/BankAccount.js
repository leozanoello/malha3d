const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BankAccount = sequelize.define('BankAccount', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Ex: "NuBank PJ", "Itaú Corporate"
  bank: { type: DataTypes.STRING, allowNull: true },
  agency: { type: DataTypes.STRING, allowNull: true },
  accountNumber: { type: DataTypes.STRING, allowNull: true, field: 'account_number' },
  balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0, field: 'balance' },
  type: { type: DataTypes.STRING, defaultValue: 'corrente' }, // corrente, poupanca, caixa, carteira_digital
  currency: { type: DataTypes.STRING, defaultValue: 'BRL' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  color: { type: DataTypes.STRING, defaultValue: '#f97316' },
  notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'bank_accounts', underscored: true, timestamps: true });

module.exports = BankAccount;
