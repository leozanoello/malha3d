const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false // ex: 'Projeto Pronto', 'Vencimento Fatura'
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  triggerEvent: {
    type: DataTypes.STRING,
    allowNull: true // ex: 'project_completed'
  },
  type: {
    type: DataTypes.ENUM('email', 'push', 'sms'),
    defaultValue: 'email'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'notification_templates'
});

module.exports = NotificationTemplate;
