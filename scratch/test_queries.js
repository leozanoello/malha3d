const { sequelize, Project } = require('../models');
const { runWithTenant, getTenantId } = require('../utils/tenantContext');

async function testQuery() {
  try {
    console.log('Project.$isIsolated:', Project.$isIsolated);
    console.log('Project hooks registered on beforeFind:', !!Project.runHooks);
    
    // Enable logging to see the exact SQL query
    sequelize.options.logging = console.log;
    
    const tenantId = '00000000-0000-0000-0000-000000000001';
    console.log(`\nTesting Project.findAll() inside tenant context: ${tenantId}...`);
    
    await runWithTenant(tenantId, async () => {
      console.log('getTenantId() inside context:', getTenantId());
      const projectsInside = await Project.findAll({ limit: 1 });
    });
    
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    sequelize.options.logging = false;
    await sequelize.close();
  }
}

testQuery();
