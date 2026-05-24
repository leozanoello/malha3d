const { exec } = require('child_process');
const path = require('path');

/**
 * Script de Produção: Git Pull
 * Este script é executado NO SERVIDOR para atualizar o código.
 */
async function pullProduction() {
  return new Promise((resolve, reject) => {
    console.log('--- Iniciando Sincronização em Produção ---');
    
    // 1. Atualiza o código descartando alterações locais em produção
    // 2. Instala dependências usando o PATH expandido da Hostinger
    // 3. O Hostinger monitora o server.js para restart automático
    const command = `export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/opt/alt/alt-nodejs18/root/usr/bin:/opt/alt/alt-nodejs20/root/usr/bin:/opt/alt/alt-nodejs16/root/usr/bin:$HOME/bin && git fetch origin main && git reset --hard origin/main && npm install --production`;
    
    exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        return reject({ success: false, message: error.message, details: stderr });
      }
      resolve({ success: true, message: 'Servidor atualizado com sucesso!', output: stdout });
    });
  });
}

module.exports = pullProduction;
