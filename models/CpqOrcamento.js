const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CpqOrcamento = sequelize.define('CpqOrcamento', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'budget_id'
  },
  totalCached: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'total_cached'
  },
  finalizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  geradoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'gerado_em'
  }
}, {
  tableName: 'cpq_orcamentos',
  indexes: [
    { unique: true, fields: ['budget_id'] }
  ]
});

module.exports = CpqOrcamento;
