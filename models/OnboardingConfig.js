const { sequelize, Sequelize } = require('../config/database');
const OnboardingConfig = sequelize.define('onboarding_config', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  data: Sequelize.JSON,
  completedAt: Sequelize.DATE
}, { underscored: true });
module.exports = OnboardingConfig;
