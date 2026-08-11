const { sequelize, Sequelize } = require('../config/database');
const AuditLog = sequelize.define('audit_log', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  action: Sequelize.STRING,
  path: Sequelize.STRING,
  ip: Sequelize.STRING,
  userAgent: Sequelize.TEXT,
  entity: Sequelize.STRING,
  entityId: Sequelize.UUID,
  before: Sequelize.JSON,
  after: Sequelize.JSON
}, { underscored: true });
module.exports = AuditLog;
