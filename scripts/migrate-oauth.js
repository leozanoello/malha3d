/**
 * Migration: Add OAuth columns to users table
 * Adds auth_provider and auth_provider_id columns
 * Also makes password nullable for social login users
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados');

    const queryInterface = sequelize.getQueryInterface();

    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.auth_provider) {
      await queryInterface.addColumn('users', 'auth_provider', {
        type: require('sequelize').DataTypes.STRING,
        defaultValue: 'local',
        allowNull: false
      });
      console.log('✅ Coluna auth_provider adicionada');
    } else {
      console.log('⏭️  Coluna auth_provider já existe');
    }

    if (!tableDescription.auth_provider_id) {
      await queryInterface.addColumn('users', 'auth_provider_id', {
        type: require('sequelize').DataTypes.STRING,
        allowNull: true
      });
      console.log('✅ Coluna auth_provider_id adicionada');
    } else {
      console.log('⏭️  Coluna auth_provider_id já existe');
    }

    // Make password nullable (ALTER COLUMN)
    await queryInterface.changeColumn('users', 'password', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true
    });
    console.log('✅ Coluna password agora aceita NULL (para login social)');

    console.log('\n🎉 Migration concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  }
}

migrate();
