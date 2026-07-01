const puppeteer = require('puppeteer');

async function run() {
  console.log('🚀 Iniciando teste da página Negociações (CRM)...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[Browser Page Error] ${err.toString()}`);
  });

  try {
    console.log('🔑 Logando no painel...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', 'admin@malha3d.com');
    await page.type('input[name="password"]', 'admin123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    console.log('🔍 Acessando Negociações...');
    await page.goto('http://localhost:3000/admin/negociacoes', { waitUntil: 'networkidle2' });
    const content = await page.content();
    console.log('Page Title:', await page.title());
    if (content.includes('Internal Server Error')) {
      console.log('❌ Failed: Internal Server Error');
    } else {
      console.log('✅ Success loading page');
    }
  } catch (error) {
    console.error('❌ Erro crítico:', error);
  } finally {
    await browser.close();
    process.exit(0);
  }
}

run();
