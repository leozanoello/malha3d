const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KanbanColumn = sequelize.define('KanbanColumn', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#f97316'
  },
  statusKey: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('crm', 'project', 'leads', 'vendas', 'modelagem'),
    defaultValue: 'leads'
  }
}, {
  tableName: 'KanbanColumn',
  underscored: true
});

module.exports = KanbanColumn;
