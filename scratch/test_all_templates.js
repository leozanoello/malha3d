require('dotenv').config();
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
moment.locale('pt-br');

// Mock helpers from server.js
const helpers = {
    dateFormat: (date, format) => {
      if (!date) return '';
      return moment(date).format(typeof format === 'string' ? format : 'DD/MM/YYYY');
    },
    formatDate: (date, format) => {
      if (!date) return '';
      return moment(date).format(typeof format === 'string' ? format : 'DD/MM/YYYY');
    },
    formatDateShort: (date) => {
      if (!date) return '';
      return moment(date).format('DD/MM');
    },
    timeAgo: (date) => {
      if (!date) return '';
      return moment(date).fromNow();
    },
    eq: (a, b) => a === b,
    json: (obj) => JSON.stringify(obj),
    length: (arr) => (arr && arr.length) ? arr.length : 0,
    formatCurrency: (value) => {
      if (value === null || value === undefined) return 'R$ 0,00';
      const num = parseFloat(value);
      if (isNaN(num)) return 'R$ 0,00';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    },
    round: (val) => Math.round(parseFloat(val) || 0),
    formatWhatsappLink: (phone, name, type = 'lead') => {
      if (!phone) return '#';
      const cleanPhone = phone.replace(/\D/g, '');
      const message = type === 'lead' 
        ? `Olá ${name}, recebemos seu interesse na Malha3D!` 
        : `Olá ${name}, como podemos ajudar?`;
      return `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`;
    },
    lookup: (obj, key) => obj && obj[key],
    numberFormat: (n) => n
};

Object.keys(helpers).forEach(h => Handlebars.registerHelper(h, helpers[h]));

// Register partials
const partialsDir = path.join(__dirname, '../views/partials');
if (fs.existsSync(partialsDir)) {
    fs.readdirSync(partialsDir).forEach(p => {
        if (p.endsWith('.hbs')) {
            const name = p.split('.')[0];
            const source = fs.readFileSync(path.join(partialsDir, p), 'utf8');
            Handlebars.registerPartial(name, source);
        }
    });
}

function testTemplate(name, data) {
    try {
        const source = fs.readFileSync(path.join(__dirname, '../views/admin', name + '.hbs'), 'utf8');
        const template = Handlebars.compile(source);
        template(data);
        console.log(`PASS: ${name}`);
    } catch (error) {
        console.error(`FAIL: ${name} - ${error.message}`);
    }
}

const mockData = {
    columns: [{ id: 1, title: 'Test', statusKey: 'test', color: '#ff0000' }],
    kanban: { 'test': [{ id: 1, name: 'Lead 1', estimatedValue: 1000, createdAt: new Date(), client: { name: 'Client 1', phone: '12345' } }] },
    budgets: [],
    stats: { billingWon: 1000, totalInNegotiation: 2000, ticketMedio: 500, conversionRate: 50 },
    charts: { funnel: { labels: [], values: [] } }
};

testTemplate('negociacoes', mockData);
testTemplate('crm', mockData);
testTemplate('budgets', mockData);
