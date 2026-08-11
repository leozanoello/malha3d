const { sequelize, Sequelize } = require('../config/database');
const MonthlyReport = sequelize.define('monthly_report', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  month: Sequelize.DATE,
  data: Sequelize.JSON,
  userId: Sequelize.UUID
}, { underscored: true });
module.exports = MonthlyReport;
