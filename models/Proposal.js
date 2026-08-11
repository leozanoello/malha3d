const { sequelize, Sequelize } = require('../config/database');
const Proposal = sequelize.define('proposal', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  userId: Sequelize.UUID,
  clientId: Sequelize.UUID,
  projectName: Sequelize.STRING,
  serviceType: Sequelize.STRING,
  scope: Sequelize.TEXT,
  area: Sequelize.FLOAT,
  imagesCount: Sequelize.INTEGER,
  deadline: Sequelize.INTEGER,
  totalValue: Sequelize.FLOAT,
  paymentTerms: Sequelize.STRING,
  validity: Sequelize.INTEGER,
  notes: Sequelize.TEXT,
  pdfUrl: Sequelize.STRING,
  status: { type: Sequelize.STRING, defaultValue: 'draft' }
}, { underscored: true });
module.exports = Proposal;
