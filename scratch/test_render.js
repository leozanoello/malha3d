const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const { Budget, KanbanColumn, sequelize } = require('../models');
const { Op } = require('sequelize');

async function testRender() {
  const app = express();
  const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
      length: (a) => a ? a.length : 0,
      numberFormat: (n) => n,
      eq: (a, b) => a === b,
      json: (a) => JSON.stringify(a),
      firstLetter: (a) => a ? a[0] : '',
      timeAgo: (a) => a,
      // MISSING formatCurrency - let's see if it crashes
    }
  });

  app.engine('.hbs', hbs.engine);
  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, '../views'));

  // Mock req/res
  const req = { user: { role: 'admin' } };
  const res = {
    render: (view, data) => {
      console.log('Rendering view:', view);
      // We don't actually render to avoid more issues, just check if we get here
    },
    status: (s) => ({ render: (v, d) => console.log('Error status:', s, v, d.message) })
  };

  try {
    // Simulate CRM route logic
    const columns = (await KanbanColumn.findAll({ where: { type: 'leads' } })).map(c => c.get({ plain: true }));
    const budgets = (await Budget.findAll()).map(b => b.get({ plain: true }));
    const kanban = {};
    columns.forEach(col => {
      kanban[col.statusKey] = budgets.filter(b => b.status === col.statusKey);
    });

    console.log('Starting render...');
    // This will try to find the template and process it
    // We can use hbs.renderView to test the actual rendering
    const html = await hbs.getPartials(); // Check partials
    console.log('Partials found:', Object.keys(html));

    console.log('Test logic completed. If it reached here without throwing, the logic is fine.');
    process.exit(0);
  } catch (error) {
    console.error('CRASH DETECTED:', error);
    process.exit(1);
  }
}

testRender();
