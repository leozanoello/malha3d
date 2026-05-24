const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

const REPORT_PATH = path.join(__dirname, 'qa_report.json');
const AUDIT_SCRIPT = path.join(__dirname, 'run_e2e_audit.js');

// Verificar se o servidor local está de fato ativo
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/admin/login', (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function runSelfHealingQA() {
  console.log('\n======================================================');
  console.log('🔮  ORQUESTRADOR DE AUTO-CORREÇÃO E AUDITORIA E2E  🔮');
  console.log('======================================================\n');

  console.log('🔌 Verificando se o servidor Malha 3D está online...');
  const isOnline = await checkServer();
  
  if (!isOnline) {
    console.log('⚠️  ATENÇÃO: O servidor de desenvolvimento (http://localhost:3000) parece estar OFFLINE.');
    console.log('👉 Certifique-se de que "npm run dev" esteja rodando em outro terminal.\n');
    console.log('Tentando rodar a auditoria mesmo assim...\n');
  } else {
    console.log('🟢 Servidor detectado online! Iniciando navegação simulada...\n');
  }

  // Executar a auditoria Puppeteer
  const start = Date.now();
  
  exec(`node "${AUDIT_SCRIPT}"`, async (err, stdout, stderr) => {
    // Vamos imprimir a saída em tempo real
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(`⚠️ Erros do console do processo:\n${stderr}`);

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`⏱️ Tempo total da auditoria: ${duration}s\n`);

    try {
      const data = await fs.readFile(REPORT_PATH, 'utf8');
      const report = JSON.parse(data);

      console.log('======================================================');
      console.log(`📊 DIAGNÓSTICO FINAL (Status: ${report.success ? '🟢 SAUDÁVEL' : '🔴 POSSUI ERROS'})`);
      console.log('======================================================');
      console.log(`- Páginas Auditadas: ${report.pagesAudited}`);
      console.log(`- Total de Erros: ${report.errorsFound.length}`);
      console.log(`- Total de Avisos: ${report.warnings.length}`);
      
      if (report.success) {
        console.log('\n🎉 EXCELENTE! Todas as funções do site estão funcionando perfeitamente.');
        console.log('✨ Sem erros de console, sem erros 500 e sem links quebrados.');
        console.log('======================================================\n');
        process.exit(0);
      } else {
        console.log('\n❌ FALHAS DETECTADAS:');
        report.errorsFound.forEach((error, index) => {
          console.log(`\n  [Falha #${index + 1}]`);
          console.log(`  🔹 Tipo: ${error.type}`);
          console.log(`  🔹 Página de Origem: ${error.page || error.pageName || error.url || 'Geral'}`);
          console.log(`  🔹 Detalhe: ${error.message || error.keywordMatched || 'Falha de requisição'}`);
          if (error.stack) {
            console.log(`  🔹 Stack Trace:\n${error.stack.split('\n').slice(0, 3).join('\n')}`);
          }
        });

        console.log('\n🛠️  PROCESSO DE AUTO-CURA (SELF-HEALING) ATIVO');
        console.log('======================================================');
        console.log('1. Os erros acima foram consolidados em "scratch/qa_report.json".');
        console.log('2. O agente de IA lerá este relatório de erros nas próximas interações.');
        console.log('3. Ele localizará as rotas, arquivos .js e templates .hbs correspondentes.');
        console.log('4. As correções no código serão aplicadas automaticamente.');
        console.log('5. A auditoria será executada novamente até que todos os testes fiquem verdes.');
        console.log('======================================================\n');
        
        process.exit(1);
      }

    } catch (readErr) {
      console.error('❌ Não foi possível ler o relatório de auditoria final:', readErr.message);
      process.exit(1);
    }
  });
}

runSelfHealingQA();
