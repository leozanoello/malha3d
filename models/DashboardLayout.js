const { sequelize, Sequelize } = require('../config/database');
const DashboardLayout = sequelize.define('dashboard_layout', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  layout: Sequelize.JSON
}, { underscored: true });
module.exports = DashboardLayout;
