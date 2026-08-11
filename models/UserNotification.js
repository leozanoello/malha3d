const { sequelize, Sequelize } = require('../config/database');
const UserNotification = sequelize.define('user_notification', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  type: Sequelize.STRING,
  title: Sequelize.STRING,
  message: Sequelize.TEXT,
  link: Sequelize.STRING,
  dismissedAt: Sequelize.DATE
}, { underscored: true });
module.exports = UserNotification;
