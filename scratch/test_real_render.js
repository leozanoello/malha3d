require('dotenv').config();
const { 
  Budget, Client, User, KanbanColumn,
  sequelize 
} = require('../models');
const moment = require('moment');
moment.locale('pt-br');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Import real helpers from server.js
const server = require('../server'); 
// Wait, importing server might start it. Let's define the helpers manually or get them from the express-handlebars instance
const exphbs = require('express-handlebars');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    // Run real route queries
    const columns = (await KanbanColumn.findAll({ where: { type: 'vendas' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const dealsRaw = await Budget.findAll({ 
      where: { winStatus: 'aberto' },
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'phone', 'email', 'company'] },
        { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
      ],
      order: [['order', 'ASC'], ['createdAt', 'DESC']] 
    });
    const deals = dealsRaw.map(d => {
      const data = d.get({ plain: true });
      data.visualStyle = data.visualStyle || "";
      data.inputFormats = data.inputFormats || [];
      data.imagesCount = data.imagesCount || 0;
      data.animationSeconds = data.animationSeconds || 0;
      data.panoramasCount = data.panoramasCount || 0;
      data.winStatus = data.winStatus || "aberto";
      data.installments = data.installments || 1;
      data.softwareStack = data.softwareStack || [];
      data.productionDays = data.productionDays || null;
      return data;
    });
    
    const teamMembers = (await User.findAll({ 
      attributes: ['id', 'name', 'role'],
      order: [['name', 'ASC']] 
    })).map(u => u.get({ plain: true }));

    const kanban = {};
    const pipelineTotals = {};
    columns.forEach(col => {
      const colDeals = deals.filter(d => d.status === col.statusKey);
      kanban[col.statusKey] = colDeals;
      pipelineTotals[col.statusKey] = colDeals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    });
    const totalNegotiationValue = deals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);

    const selectedMonth = moment().format('YYYY-MM');
    const startOfMonth = moment(selectedMonth, 'YYYY-MM').startOf('month');
    const endOfMonth = moment(selectedMonth, 'YYYY-MM').endOf('month');
    const selectedMonthFormatted = moment(selectedMonth, 'YYYY-MM').format('MMMM [de] YYYY').replace(/^\w/, c => c.toUpperCase());

    const allDealsForStats = await Budget.findAll();
    const allPlain = allDealsForStats.map(d => d.get({ plain: true }));
    const filteredPlain = allPlain.filter(d => {
      if (!d.expectedRevenueDate) return false;
      const mDate = moment(d.expectedRevenueDate);
      return mDate.isSameOrAfter(startOfMonth) && mDate.isSameOrBefore(endOfMonth);
    });
    
    const stats = {
      billingWon: filteredPlain.filter(d => d.winStatus === 'ganho').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      totalInNegotiation: filteredPlain.filter(d => d.winStatus === 'aberto').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      ticketMedio: 0,
      conversionRate: 0
    };

    const wonDeals = filteredPlain.filter(d => d.winStatus === 'ganho');
    stats.ticketMedio = wonDeals.length > 0 ? stats.billingWon / wonDeals.length : 0;

    const lostDealsCount = filteredPlain.filter(d => d.winStatus === 'perdido').length;
    stats.conversionRate = (wonDeals.length + lostDealsCount) > 0 
      ? (wonDeals.length / (wonDeals.length + lostDealsCount)) * 100 
      : 0;

    const charts = {
      funnel: {
        labels: columns.map(c => c.title),
        data: columns.map(c => {
          const colDeals = filteredPlain.filter(d => d.status === c.statusKey && d.winStatus === 'aberto');
          return colDeals.reduce((sum, d) => sum + ((parseFloat(d.estimatedValue) || 0) * ((parseFloat(d.probability) || 0) / 100)), 0);
        })
      },
      winRate: {
        labels: ['Ganhos', 'Perdidos'],
        data: [wonDeals.length, lostDealsCount]
      },
      lossReasons: {
        labels: [...new Set(filteredPlain.filter(d => d.lossReason).map(d => d.lossReason))],
        data: []
      }
    };
    charts.lossReasons.data = charts.lossReasons.labels.map(reason => 
      filteredPlain.filter(d => d.lossReason === reason).length
    );

    // Context for rendering
    const renderContext = {
      layout: false,
      title: 'CRM - Inteligência Comercial',
      currentPage: 'negociacoes',
      user: { name: 'Admin', role: 'admin' },
      columns,
      kanban,
      pipelineTotals,
      totalNegotiationValue,
      teamMembers,
      stats,
      charts,
      selectedMonth,
      selectedMonthFormatted
    };

    // Load templates and compile using standard server config
    // We can instantiate standard handlebars config from server.js if exported, or recreate helpers
    // Let's create standard hbs with all helpers
    const app = require('../server'); 
    // In Express, app.engines['.hbs'] or we can render via server.render
    // Let's let Express compile it!
    app.render('admin/negociacoes', renderContext, (err, html) => {
      if (err) {
        console.error('❌ RENDER ERROR IN EXPRESS:', err);
      } else {
        console.log('✅ RENDER SUCCESSFUL, HTML length:', html.length);
        
        // Let's inspect the view-list div content in the rendered HTML
        const listMatch = html.match(/<div id="view-list"[\s\S]*?<\/div>/);
        if (listMatch) {
          console.log('\n--- VIEW-LIST SNIPPET ---');
          console.log(listMatch[0].substring(0, 1000));
          console.log('-------------------------\n');
        } else {
          console.log('❌ view-list NOT found in HTML!');
        }

        // Let's count crm-item-row occurrences
        const rowsCount = (html.match(/crm-item-row/g) || []).length;
        console.log('Count of crm-item-row in rendered HTML:', rowsCount);
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ SCRIPT ERROR:', error);
    process.exit(1);
  }
}

test();
