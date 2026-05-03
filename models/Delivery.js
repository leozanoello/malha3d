const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pendente', 'entregue', 'aprovado', 'atrasado'),
    defaultValue: 'pendente'
  },
  confirmation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'deliveries'
});

module.exports = Delivery;
