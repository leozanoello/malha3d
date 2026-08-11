const { sequelize, Sequelize } = require('../config/database');
const NFe = sequelize.define('nfe', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  arId: Sequelize.UUID,
  customerId: Sequelize.UUID,
  number: Sequelize.INTEGER,
  series: Sequelize.STRING,
  amount: Sequelize.FLOAT,
  status: { type: Sequelize.STRING, defaultValue: 'authorized' },
  apiResponse: Sequelize.JSON,
  xmlUrl: Sequelize.STRING,
  pdfUrl: Sequelize.STRING
}, { underscored: true });
module.exports = NFe;
