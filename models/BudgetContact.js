const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BudgetContact = sequelize.define('BudgetContact', {
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
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'client_id'
  },
  responsibilityLevel: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'responsibility_level'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary'
  }
}, {
  tableName: 'budget_contacts',
  timestamps: true,
  underscored: true
});

module.exports = BudgetContact;
