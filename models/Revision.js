const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Revision = sequelize.define('Revision', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  financialImpact: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deadlineImpact: {
    type: DataTypes.INTEGER, // days
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('solicitada', 'em_analise', 'aprovada', 'rejeitada', 'concluida'),
    defaultValue: 'solicitada'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'revisions'
});

module.exports = Revision;
