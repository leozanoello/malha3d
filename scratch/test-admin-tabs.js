const puppeteer = require('puppeteer');

async function run() {
  console.log('🚀 Iniciando teste completo do menu Admin via Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[Browser Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.log(`[Browser Page Error] ${err.toString()}`);
  });

  try {
    console.log('🔑 Acessando tela de login...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    console.log('✍️ Inserindo credenciais...');
    await page.type('input[name="email"]', 'admin@malha3d.com');
    await page.type('input[name="password"]', 'admin123');
    
    console.log('submit do login...');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    const url = page.url();
    console.log(`🌍 URL pós-login: ${url}`);
    if (url.includes('/admin/login')) {
      throw new Error('Falha no login.');
    }

    const adminPages = [
      { name: 'Dashboard', url: 'http://localhost:3000/admin' },
      { name: 'Orçamentos', url: 'http://localhost:3000/admin/orcamentos' },
      { name: 'Projetos', url: 'http://localhost:3000/admin/projetos' },
      { name: 'Agenda', url: 'http://localhost:3000/admin/agenda' },
      { name: 'Blocos 3D', url: 'http://localhost:3000/admin/blocos-3d' },
      { name: 'Financeiro', url: 'http://localhost:3000/admin/financeiro' },
      { name: 'Configurações', url: 'http://localhost:3000/admin/configuracoes' },
      { name: 'Painel Avançado', url: 'http://localhost:3000/admin/avancado' }
    ];

    const results = [];

    for (const p of adminPages) {
      console.log(`🔍 Acessando página: ${p.name}...`);
      try {
        await page.goto(p.url, { waitUntil: 'networkidle2' });
        const title = await page.title();
        const content = await page.content();
        
        let matchReason = null;
        if (content.includes('Internal Server Error')) matchReason = 'Internal Server Error';
        else if (content.includes('Cannot GET')) matchReason = 'Cannot GET';

        if (matchReason) {
          results.push({ name: p.name, status: `FALHA (${matchReason})`, title });
        } else {
          results.push({ name: p.name, status: 'OK', title });
        }
      } catch (err) {
        results.push({ name: p.name, status: `FALHA: ${err.message}` });
      }
    }

    // Testar Abas do Painel Avançado
    console.log('⚙️ Acessando painel avançado para testar as abas...');
    await page.goto('http://localhost:3000/admin/avancado', { waitUntil: 'networkidle2' });
    
    const tabs = [
      { id: 'usuarios', name: 'Gestão de Usuários' },
      { id: 'instancias', name: 'Instâncias' },
      { id: 'planos', name: 'Planos de Assinatura' },
      { id: 'bancario', name: 'Dados Bancários' },
      { id: 'seguranca', name: 'Segurança & Firewall' },
      { id: 'integracoes', name: 'Integrações' },
      { id: 'notificacoes', name: 'Notificações' },
      { id: 'backup', name: 'Backups do Sistema' },
      { id: 'logs', name: 'Logs de Auditoria' }
    ];

    const tabResults = [];
    for (const tab of tabs) {
      console.log(`👉 Clicando na aba: ${tab.name}...`);
      try {
        const tabSelector = `.advanced-tab-btn[data-tab="${tab.id}"]`;
        await page.waitForSelector(tabSelector, { timeout: 3000 });
        await page.click(tabSelector);
        
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 300)));
        
        const isVisible = await page.evaluate((id) => {
          const pane = document.getElementById(`pane-${id}`);
          return pane && !pane.classList.contains('hidden');
        }, tab.id);

        tabResults.push({ name: tab.name, status: isVisible ? 'OK' : 'FALHA (Não visível)' });
      } catch (err) {
        tabResults.push({ name: tab.name, status: `FALHA: ${err.message}` });
      }
    }

    console.log('\n======================================');
    console.log('       RELATÓRIO DE DIAGNÓSTICO       ');
    console.log('======================================');
    
    console.log('\nPÁGINAS DO MENU ADMIN:');
    results.forEach(r => {
      console.log(`- ${r.name}: [${r.status}] (${r.title})`);
    });

    console.log('\nABAS DO PAINEL AVANÇADO (DEV/ADMIN):');
    tabResults.forEach(r => {
      console.log(`- ${r.name}: [${r.status}]`);
    });

    console.log('\nCONSOLE ERRORS DETECTADOS:');
    const filteredErrors = consoleErrors.filter(err => !err.includes('favicon.ico') && !err.includes('spline'));
    if (filteredErrors.length === 0) {
      console.log('✅ Nenhum erro de Javascript ou rede detectado no console!');
    } else {
      filteredErrors.forEach(err => console.log(`❌ ${err}`));
    }

  } catch (error) {
    console.error('❌ Erro crítico:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Fim dos testes.');
    process.exit(0);
  }
}

run();
