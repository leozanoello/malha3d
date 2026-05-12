const hbs = require('express-handlebars').create({
  helpers: {
    formatCurrency: (v) => v,
    firstLetter: (v) => v,
    length: (v) => 0,
    lookup: (obj, key) => obj ? obj[key] : undefined,
    formatDateShort: (v) => v,
    formatDate: (v) => v,
    eq: (v1, v2) => v1 === v2,
    json: (v) => JSON.stringify(v),
    round: (v) => v,
    formatWhatsappLink: (v) => v
  },
  partialsDir: 'views/partials'
});

const fs = require('fs');
const path = require('path');

async function testRender() {
  try {
    const templatePath = path.join(__dirname, '../views/admin/negociacoes.hbs');
    const source = fs.readFileSync(templatePath, 'utf8');
    
    // Mock data
    const data = {
      layout: false,
      columns: [{ title: 'Teste', statusKey: 'novo', color: '#ff0000' }],
      kanban: { 'novo': [] },
      pipelineTotals: { 'novo': 0 },
      totalNegotiationValue: 0,
      stats: { billingWon: 0, totalInNegotiation: 0, ticketMedio: 0, conversionRate: 0 },
      charts: {},
      user: { name: 'Admin' }
    };

    // We need to use hbs.renderView or similar
    // Actually, it's easier to use a simple handlebars instance
    const Handlebars = require('handlebars');
    
    // Register helpers
    Object.keys(hbs.helpers).forEach(key => Handlebars.registerHelper(key, hbs.helpers[key]));
    
    // Register partials
    const partials = fs.readdirSync(path.join(__dirname, '../views/partials'));
    partials.forEach(p => {
      const pSource = fs.readFileSync(path.join(__dirname, '../views/partials', p), 'utf8');
      Handlebars.registerPartial(p.split('.')[0], pSource);
    });

    const template = Handlebars.compile(source);
    const result = template(data);
    console.log('Render Successful! Result length:', result.length);

  } catch (error) {
    console.error('Render Failed:', error);
  }
}

testRender();
