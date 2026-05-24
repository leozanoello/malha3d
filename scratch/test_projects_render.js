require('dotenv').config();
const { 
  Project, Client, User, KanbanColumn,
  sequelize 
} = require('../models');
const moment = require('moment');
moment.locale('pt-br');

const renderContext = {
  layout: false,
  title: 'Projetos',
  currentPage: 'projetos',
  user: { name: 'Admin', role: 'admin' },
  columns: [
    { id: 1, title: 'Backlog', statusKey: 'backlog', color: '#ff0000', projects: [
      { id: 1, title: 'Project 1', complexity: 'Alta', category: 'Imagens 3D' }
    ] }
  ],
  teamMembers: []
};

const app = require('../server'); 
app.render('admin/projects-kanban', renderContext, (err, html) => {
  if (err) {
    console.error('❌ RENDER ERROR IN EXPRESS:', err);
    process.exit(1);
  } else {
    console.log('✅ RENDER SUCCESSFUL, HTML length:', html.length);
    process.exit(0);
  }
});
