require('dotenv').config();
const { sequelize } = require('../models');

console.log('Dialect:', sequelize.getDialect());
console.log('Database:', sequelize.config.database);
console.log('Host:', sequelize.config.host);
process.exit(0);
