const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  keyPrefix: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'key_prefix'
  },
  keyHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'key_hash'
  },
  keyMasked: {
    type: DataTypes.STRING(40),
    allowNull: false,
    field: 'key_masked'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    references: { model: 'users', key: 'id' }
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_used_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  scopes: {
    type: DataTypes.JSON,
    defaultValue: ['read']
  }
}, {
  tableName: 'api_keys',
  underscored: true
});

module.exports = ApiKey;
