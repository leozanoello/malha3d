const { sequelize, Sequelize } = require('../config/database');
const Payment = sequelize.define('payment', {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  txId: Sequelize.STRING,
  amount: Sequelize.FLOAT,
  description: Sequelize.STRING,
  customerId: Sequelize.UUID,
  status: { type: Sequelize.STRING, defaultValue: 'pending' },
  pixPayload: Sequelize.TEXT,
  qrCodeUrl: Sequelize.STRING,
  expiresAt: Sequelize.DATE,
  paidAt: Sequelize.DATE
}, { underscored: true });
module.exports = Payment;
