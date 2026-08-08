const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoryDespesa = sequelize.define('CategoryDespesa', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#ef4444'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories_despesa',
  timestamps: true,
  underscored: true
});

module.exports = CategoryDespesa;
