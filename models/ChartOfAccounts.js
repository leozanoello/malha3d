const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChartOfAccounts = sequelize.define('ChartOfAccounts', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true }, // Ex: "1.1", "2.1.3"
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('receita', 'despesa', 'ativo', 'passivo', 'patrimonio'), allowNull: false },
  parentId: { type: DataTypes.UUID, allowNull: true, field: 'parent_id' },
  level: { type: DataTypes.INTEGER, defaultValue: 1 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
  description: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'chart_of_accounts', underscored: true, timestamps: true });

// Self-referencing (hierarquia)
ChartOfAccounts.hasMany(ChartOfAccounts, { as: 'children', foreignKey: 'parentId' });
ChartOfAccounts.belongsTo(ChartOfAccounts, { as: 'parent', foreignKey: 'parentId' });

module.exports = ChartOfAccounts;
