const { sequelize, Sequelize } = require('../config/database');
const CollectionRule = sequelize.define('collection_rule', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  name: Sequelize.STRING,
  daysBeforeDue: { type: Sequelize.INTEGER, defaultValue: 3 },
  daysAfterDue: { type: Sequelize.INTEGER, defaultValue: 7 },
  template: Sequelize.TEXT,
  channel: { type: Sequelize.STRING, defaultValue: 'email' },
  active: { type: Sequelize.BOOLEAN, defaultValue: true }
}, { underscored: true });
module.exports = CollectionRule;
