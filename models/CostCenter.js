const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CostCenter = sequelize.define('CostCenter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Ex: "Produção ArchViz", "Comercial", "Administrativo"
  code: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  color: { type: DataTypes.STRING, defaultValue: '#8b5cf6' }
}, { tableName: 'cost_centers', underscored: true, timestamps: true });

module.exports = CostCenter;
