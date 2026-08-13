const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PF', 'PJ'),
    defaultValue: 'PF'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Lead'
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'Manual'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: []
  },

  telegram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hasContract: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  jobTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {

    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'clients',
  timestamps: true
});

module.exports = Client;
