require('dotenv').config();
const { KanbanColumn, Project, Client } = require('../models');
const fs = require('fs');
const path = require('path');

// Mock req.user
const user = { name: 'Test User' };

async function testRender() {
  try {
    const columns = (await KanbanColumn.findAll({ where: { type: 'project' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const projectsRaw = await Project.findAll({ 
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      include: [{ model: Client, as: 'customer' }]
    });
    const projects = projectsRaw.map(p => p.get({ plain: true }));
    
    const kanbanColumns = columns.map(col => ({
      ...col,
      name: col.title,
      projects: projects.filter(p => p.status === col.statusKey)
    }));

    console.log('✅ Data fetched successfully');
    console.log('Columns:', kanbanColumns.length);
    console.log('Projects:', projects.length);
    
    // Simulate what admin.js does
    const data = { layout: 'admin', title: 'Gestão de Projetos', currentPage: 'projects', user, columns: kanbanColumns };
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Render Test Failed:', err);
    process.exit(1);
  }
}

testRender();
