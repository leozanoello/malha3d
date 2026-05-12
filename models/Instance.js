const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Instance = sequelize.define('Instance', {
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
    type: DataTypes.ENUM('docker', 'ia', 'rendernode', 'storage'),
    defaultValue: 'docker'
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'restarting', 'error'),
    defaultValue: 'online'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uptime: {
    type: DataTypes.STRING,
    defaultValue: '0h'
  },
  gpuUsage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cpuUsage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  integrationType: {
    type: DataTypes.STRING,
    defaultValue: 'Render Farm API'
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'instances'
});

module.exports = Instance;
