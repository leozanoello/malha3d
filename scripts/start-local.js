const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const envLocalPath = path.join(projectRoot, '.env.local');

dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath, override: true });

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.DB_CLIENT = 'sqlite';
process.env.LOCAL_DEV = 'true';
process.env.SUPABASE_DB_URL = '';

const { startServer } = require('../server');

startServer();
