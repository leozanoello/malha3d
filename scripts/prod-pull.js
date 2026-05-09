const { exec } = require('child_process');
const path = require('path');

/**
 * Script de Produção: Git Pull
 * Este script é executado NO SERVIDOR para atualizar o código.
 */
async function pullProduction() {
  return new Promise((resolve, reject) => {
    console.log('--- Iniciando Sincronização em Produção ---');
    
    // 1. Puxa o código
    // 2. Instala novas dependências (se houver)
    // 3. O Hostinger reinicia o Node automaticamente ao detectar mudança no server.js
    const command = `git pull origin main && npm install --production`;
    
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        return reject({ success: false, message: error.message, details: stderr });
      }
      resolve({ success: true, message: 'Servidor atualizado com sucesso!', output: stdout });
    });
  });
}

module.exports = pullProduction;
