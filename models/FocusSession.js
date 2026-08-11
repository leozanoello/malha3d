const { sequelize, Sequelize } = require('../config/database');
const FocusSession = sequelize.define('focus_session', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  projectId: Sequelize.UUID,
  startTime: Sequelize.DATE,
  endTime: Sequelize.DATE,
  plannedDuration: Sequelize.INTEGER,
  actualDuration: Sequelize.INTEGER
}, { underscored: true });
module.exports = FocusSession;
