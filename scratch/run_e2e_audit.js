const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@malha3d.com';
const ADMIN_PASS = 'admin123';
const REPORT_PATH = path.join(__dirname, 'qa_report.json');

async function runAudit() {
  console.log('🤖 Inicializando Auditoria E2E do ERP Malha 3D...');
  
  const report = {
    timestamp: new Date().toISOString(),
    success: true,
    pagesAudited: 0,
    errorsFound: [],
    warnings: [],
    details: {}
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // Configurar viewport padrão
    await page.setViewport({ width: 1280, height: 800 });

    // Capturar logs do console do navegador
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`🔴 [Console Error]: ${text}`);
        report.errorsFound.push({
          type: 'browser_console_error',
          message: text,
          page: page.url()
        });
      } else if (type === 'warning') {
        report.warnings.push({
          type: 'browser_console_warning',
          message: text,
          page: page.url()
        });
      }
    });

    // Capturar exceções não tratadas do JavaScript
    page.on('pageerror', err => {
      console.log(`🔴 [Page Exception]: ${err.toString()}`);
      report.errorsFound.push({
        type: 'uncaught_javascript_exception',
        message: err.toString(),
        stack: err.stack,
        page: page.url()
      });
    });

    // Capturar falhas de rede / requisições fracassadas
    page.on('requestfailed', request => {
      const failure = request.failure();
      console.log(`🔴 [Network Failed]: ${request.url()} - ${failure.errorText}`);
      report.errorsFound.push({
        type: 'network_request_failed',
        url: request.url(),
        error: failure.errorText,
        page: page.url()
      });
    });

    // 1. EFETUAR LOGIN
    console.log(`\n🔑 Acessando página de login: ${BASE_URL}/admin/login`);
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });

    // Preencher formulário de login
    console.log('📝 Inserindo credenciais administrativas...');
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASS);
    
    // Clicar e aguardar navegação
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    const currentUrl = page.url();
    console.log(`📍 URL atual após login: ${currentUrl}`);
    if (currentUrl.includes('/login')) {
      throw new Error('Falha no login com as credenciais padrões.');
    }
    console.log('✅ Login efetuado com sucesso!');

    // 2. LISTA DE PÁGINAS PARA AUDITORIA
    const pagesToAudit = [
      { name: 'Dashboard', path: '/admin' },
      { name: 'CRM (Pipeline)', path: '/admin/negociacoes' },
      { name: 'Projetos (Kanban)', path: '/admin/projetos/kanban' },
      { name: 'Orçamentos', path: '/admin/orcamentos' },
      { name: 'Financeiro', path: '/admin/financeiro' },
      { name: 'Contatos', path: '/admin/contatos' },
      { name: 'Portal do Cliente', path: '/admin/portal-cliente' },
      { name: 'Configurações Avançadas', path: '/admin/avancado' }
    ];

    for (const p of pagesToAudit) {
      console.log(`\n🌐 Auditando Página: ${p.name} (${BASE_URL}${p.path})`);
      report.pagesAudited++;

      // Visitar a página
      const response = await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle2' });
      const status = response.status();
      
      report.details[p.name] = {
        url: page.url(),
        httpStatus: status,
        success: true
      };

      console.log(`📊 Status HTTP: ${status}`);
      if (status >= 400) {
        console.log(`🔴 Erro HTTP detectado na página ${p.name}: ${status}`);
        report.errorsFound.push({
          type: 'http_response_error',
          pageName: p.name,
          url: page.url(),
          status: status
        });
        report.details[p.name].success = false;
        continue;
      }

      // Validar conteúdo HTML da página em busca de falhas de renderização
      const pageContent = await page.content();
      const errorKeywords = [
        'Internal Server Error',
        'Desculpe, algo deu errado do nosso lado',
        'Erro Interno do Servidor',
        '500 - ',
        'Cannot GET',
        'Failed to compile'
      ];

      for (const keyword of errorKeywords) {
        if (pageContent.includes(keyword)) {
          console.log(`🔴 Erro de renderização/conteúdo encontrado pela palavra-chave: "${keyword}"`);
          report.errorsFound.push({
            type: 'render_content_error',
            pageName: p.name,
            url: page.url(),
            keywordMatched: keyword
          });
          report.details[p.name].success = false;
        }
      }

      // Testar interações se for o CRM para garantir que o botão "Novo Lead" abre o modal sem travar
      if (p.path === '/admin/negociacoes') {
        try {
          console.log('🖱️ Simulando clique em "Novo Lead"...');
          const btnSelector = 'button[data-bs-target="#newDealModal"]';
          const hasBtn = await page.$(btnSelector);
          if (hasBtn) {
            await page.click(btnSelector);
            await page.waitForTimeout(500); // Aguardar renderização/transição
            console.log('   Modal de Novo Lead aberto.');
          } else {
            console.log('   Botão "Novo Lead" não encontrado pelo seletor padrão.');
          }
        } catch (modalErr) {
          console.log(`🔴 Falha ao testar modal no CRM: ${modalErr.message}`);
          report.errorsFound.push({
            type: 'ui_interaction_failed',
            pageName: p.name,
            message: modalErr.message
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Ocorreu um erro crítico durante a auditoria:', error);
    report.success = false;
    report.errorsFound.push({
      type: 'critical_audit_exception',
      message: error.message,
      stack: error.stack
    });
  } finally {
    if (browser) {
      await browser.close();
    }

    report.success = report.errorsFound.length === 0;
    
    // Gravar relatório em JSON
    await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n💾 Relatório de Auditoria gravado com sucesso em: ${REPORT_PATH}`);
    
    console.log('\n📊 RESUMO DA AUDITORIA:');
    console.log(`   - Páginas Auditadas: ${report.pagesAudited}`);
    console.log(`   - Erros Encontrados: ${report.errorsFound.length}`);
    console.log(`   - Avisos Encontrados: ${report.warnings.length}`);
    console.log(`   - Status Geral: ${report.success ? '🟢 SAUDÁVEL' : '🔴 POSSUI ERROS'}\n`);
    
    process.exit(report.success ? 0 : 1);
  }
}

// Suporte para waitForTimeout em versões novas do Puppeteer
if (!puppeteer.Page.prototype.waitForTimeout) {
  puppeteer.Page.prototype.waitForTimeout = function (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };
}

runAudit();
