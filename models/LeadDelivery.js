const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadDelivery = sequelize.define('LeadDelivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leadId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'lead_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'scheduled_date'
  },
  status: {
    type: DataTypes.ENUM('pendente', 'entregue', 'aprovado', 'atrasado'),
    defaultValue: 'pendente'
  },
  confirmation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  downloadUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'download_url'
  }
}, {
  tableName: 'lead_deliveries'
});

module.exports = LeadDelivery;
