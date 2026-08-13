const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CpqFase = sequelize.define('CpqFase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orcamentoId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'orcamento_id'
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
  tableName: 'cpq_fases',
  indexes: [
    { fields: ['orcamento_id'] },
    { unique: true, fields: ['orcamento_id', 'ordem'] }
  ]
});

module.exports = CpqFase;
