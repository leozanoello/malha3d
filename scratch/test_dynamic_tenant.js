const { sequelize, User, Project } = require('../models');
const { DataTypes } = require('sequelize');

async function testDynamic() {
  try {
    console.log('Testing dynamic model attributes with sync...');
    
    // Add userId to Project
    Project.rawAttributes.userId = {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    };
    Project.refreshAttributes();
    
    // Sincronizar o banco de dados
    console.log('Syncing database schema (alter)...');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully!');
    
    // Let's run a SELECT query to see if it executes correctly
    const projects = await Project.findAll({ limit: 1 });
    console.log('Project query succeeded, projects found:', projects.length);
    
    console.log('SUCCESS: Dynamic attributes work perfectly!');
  } catch (error) {
    console.error('ERROR during dynamic attribute test:', error);
  } finally {
    await sequelize.close();
  }
}

testDynamic();
