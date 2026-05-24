const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Mock all helpers so we can test compilation of Handlebars files
const mockHelpers = [
  'formatDate', 'dateFormat', 'formatDateShort', 'timeAgo', 'isPast', 'date', 'now',
  'firstLetter', 'getFirstLetters', 'truncate', 'substring', 'split', 'json',
  'statusBadge', 'ratingStars', 'formatCurrency', 'formatMoney', 'numberFormat',
  'percent', 'calculatePercentage', 'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'and', 'or',
  'ifCond', 'add', 'subtract', 'multiply', 'divide', 'round', 'array', 'length',
  'list', 'limit', 'times', 'range', 'random', 'select_random', 'buildQueryString',
  'formatPhone', 'formatWhatsappLink'
];

mockHelpers.forEach(helper => {
  Handlebars.registerHelper(helper, () => '');
});

// Also register lookup and custom block helpers
Handlebars.registerHelper('lookup', (obj, key) => obj && obj[key]);

const adminViewsDir = path.join(__dirname, '../views/admin');

console.log('🔍 Starting Handlebars template syntax validation...');
let hasErrors = false;

try {
  const files = fs.readdirSync(adminViewsDir);
  files.forEach(file => {
    if (file.endsWith('.hbs')) {
      const filePath = path.join(adminViewsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        Handlebars.compile(content);
        console.log(`✅ ${file}: Validated successfully.`);
      } catch (err) {
        console.error(`❌ ${file}: Syntax Error found!`);
        console.error(err.message);
        hasErrors = true;
      }
    }
  });
} catch (err) {
  console.error('Error reading views directory:', err);
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n🔴 Validation failed: Some templates have syntax errors.');
  process.exit(1);
} else {
  console.log('\n🟢 All templates compiled successfully with Handlebars!');
  process.exit(0);
}
