const path = require('path');
const { Sequelize } = require('sequelize');

// Configurações compartilhadas entre os bancos
const commonOptions = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Importante para conexões com Supabase via SSL
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

const baseDefineOptions = {
  timestamps: true,
  underscored: true,
  freezeTableName: true
};

const localSqliteStoragePath = path.resolve(__dirname, '../data/local-dev.sqlite');
const fallbackSqliteStoragePath = path.resolve(__dirname, '../data/dev.sqlite');
const useLocalSqlite = process.env.DB_CLIENT === 'sqlite' || process.env.LOCAL_DEV === 'true';

// Cria conexão com o banco de dados
let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Ambiente de teste: SQLite em memória
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
    define: baseDefineOptions
  });
} else if (useLocalSqlite) {
  console.warn(`⚠️  Modo local habilitado. Usando SQLite em ${localSqliteStoragePath}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: localSqliteStoragePath,
    logging: false,
    define: baseDefineOptions
  });
} else if (process.env.SUPABASE_DB_URL && process.env.SUPABASE_DB_URL.includes('supabase.com')) {
  // Produção/Dev com Supabase: usar parâmetros explícitos para evitar
  // bug de parsing de URL com caracteres especiais na senha
  sequelize = new Sequelize('postgres', 'postgres.jndjarkqjhsayiuneakk', 'LrZan0235!@#!@#!@#', {
    host: 'aws-0-us-west-2.pooler.supabase.com',
    port: 6543,
    ...commonOptions
  });
} else if (process.env.SUPABASE_DB_URL) {
  // Fallback: usar a URL diretamente
  sequelize = new Sequelize(process.env.SUPABASE_DB_URL, commonOptions);
} else {
  // Sem URL configurada — SQLite local como fallback de desenvolvimento
  console.warn('⚠️  SUPABASE_DB_URL não definida. Usando SQLite local como fallback.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: fallbackSqliteStoragePath,
    logging: false,
    define: baseDefineOptions
  });
}

// Função para testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Não foi possível conectar ao banco de dados:', error.message);
    return false;
  }
};

// Função para sincronizar banco de dados
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Banco de dados sincronizado com sucesso.');
    return true;
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error.message);
    return false;
  }
};

// Função placeholder — PostgreSQL na nuvem já existe
const createDatabaseIfNotExists = async () => {
  console.log('ℹ️  Utilizando Supabase: O banco de dados Postgres já existe na nuvem.');
  return true;
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncDatabase,
  createDatabaseIfNotExists
};
