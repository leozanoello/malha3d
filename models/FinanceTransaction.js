const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinanceTransaction = sequelize.define('FinanceTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('receita', 'despesa', 'transferir'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  beneficiary: {
    type: DataTypes.STRING,
    allowNull: true
  },
  payer: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.beneficiary;
    },
    set(val) {
      this.setDataValue('beneficiary', val);
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('pendente', 'pago', 'recebido', 'atrasado'),
    defaultValue: 'pendente'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  competenceDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankAccount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  recurrence: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'unica'
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  accountPlan: {
    type: DataTypes.STRING,
    allowNull: true
  },
  costCenter: {
    type: DataTypes.STRING,
    allowNull: true
  },
  costClassification: {
    type: DataTypes.STRING,
    allowNull: true // 'fixo' ou 'variavel'
  },
  originAccount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  destinationAccount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachment: {
    type: DataTypes.STRING,
    allowNull: true
  },
  approvalStatus: {
    type: DataTypes.STRING,
    defaultValue: 'aprovado'
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  originalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  editHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'finance_transactions'
});

module.exports = FinanceTransaction;
