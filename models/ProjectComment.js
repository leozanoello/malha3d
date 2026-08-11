const { sequelize, Sequelize } = require('../config/database');
const ProjectComment = sequelize.define('project_comment', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  projectId: Sequelize.UUID,
  userId: Sequelize.UUID,
  message: Sequelize.TEXT
}, { underscored: true });
module.exports = ProjectComment;
