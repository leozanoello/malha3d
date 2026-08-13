const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CpqAmbiente = sequelize.define('CpqAmbiente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  faseId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'fase_id'
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  subtotalCached: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'subtotal_cached'
  }
}, {
  tableName: 'cpq_ambientes',
  indexes: [
    { fields: ['fase_id'] },
    { unique: true, fields: ['fase_id', 'ordem'] }
  ]
});

module.exports = CpqAmbiente;
