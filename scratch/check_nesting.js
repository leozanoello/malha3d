const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const hbsSource = fs.readFileSync(path.join(__dirname, '../views/admin/negociacoes.hbs'), 'utf8');

const HandlebarsInstance = Handlebars.create();
HandlebarsInstance.registerHelper('formatCurrency', (v) => v);
HandlebarsInstance.registerHelper('firstLetter', (v) => v);
HandlebarsInstance.registerHelper('length', (v) => v ? v.length : 0);
HandlebarsInstance.registerHelper('lookup', (obj, key) => obj ? obj[key] : []);
HandlebarsInstance.registerHelper('formatDateShort', (v) => v);
HandlebarsInstance.registerHelper('formatDate', (v) => v);
HandlebarsInstance.registerHelper('eq', (v1, v2) => v1 === v2);
HandlebarsInstance.registerHelper('json', (v) => JSON.stringify(v));
HandlebarsInstance.registerHelper('round', (v) => v);
HandlebarsInstance.registerHelper('formatWhatsappLink', (v) => v);
HandlebarsInstance.registerHelper('array', (...args) => args.slice(0, -1));

const template = HandlebarsInstance.compile(hbsSource);

// Let's render with ONE deal
const mockDeal = {
  id: 'deal-123',
  name: 'Projeto Mock',
  estimatedValue: 15000,
  probability: 80,
  status: 'novo',
  projectType: 'Imagens 3D',
  priority: 'alta',
  client: { name: 'Cliente Teste', company: 'Empresa Teste', phone: '11999999999' }
};

const html = template({
  columns: [{ title: 'Teste', statusKey: 'novo', color: '#ff0000' }],
  kanban: { 'novo': [mockDeal] },
  pipelineTotals: { 'novo': 15000 },
  stats: { billingWon: 0, totalInNegotiation: 15000, ticketMedio: 0, conversionRate: 0 },
  charts: {}
});

const boardIndex = html.indexOf('id="kanban-board"');
const listIndex = html.indexOf('id="view-list"');

let slice = html.substring(boardIndex, listIndex);

// Count opening divs and closing divs
let openDivs = (slice.match(/<div/g) || []).length;
let closeDivs = (slice.match(/<\/div>/g) || []).length;

console.log('With 1 deal in Kanban:');
console.log('Opening <div tags:', openDivs);
console.log('Closing </div> tags:', closeDivs);
console.log('Net open divs:', openDivs - closeDivs);

// Let's write the rendered html to a file to manually inspect if needed
fs.writeFileSync(path.join(__dirname, 'rendered_negociacoes.html'), html);
console.log('Saved rendered HTML to scratch/rendered_negociacoes.html');
