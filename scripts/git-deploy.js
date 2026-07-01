const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

/**
 * Script de Automação de Deploy via Git
 * Este script realiza o push para o repositório configurado no ambiente.
 */
async function runDeploy(commitMessage = '🚀 Production Deploy') {
  return new Promise((resolve, reject) => {
    console.log('--- Iniciando Pipeline de Deploy ---');

    // Comando robusto: verifica se há mudanças antes de tentar commitar
    const command = `git add . && (git diff-index --quiet HEAD || git commit -m "${commitMessage}") && git push origin main`;

    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro no Git: ${error.message}`);
        return reject({ success: false, message: error.message, details: stderr });
      }

      console.log(`Saída: ${stdout}`);
      resolve({ success: true, message: 'Push realizado com sucesso!', output: stdout });
    });
  });
}

// Se executado diretamente
if (require.main === module) {
  runDeploy(process.argv[2])
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

module.exports = runDeploy;
