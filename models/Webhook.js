const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Webhook = sequelize.define('Webhook', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false // ex: 'project.created', 'budget.approved'
  },
  secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'webhooks'
});

module.exports = Webhook;
