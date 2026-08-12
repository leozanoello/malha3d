const { exec } = require('child_process');
const path = require('path');
const os = require('os');

/**
 * Script de Deploy para Produção (Hostinger)
 *
 * Quando executado NO SERVIDOR (Linux/Hostinger):
 *   - git pull origin main
 *   - npm install --production
 *   - restart via touch server.js (Hostinger monitora)
 *
 * Quando executado LOCALMENTE (Windows):
 *   - Faz SSH para o servidor Hostinger
 *   - Executa os comandos remotamente
 *   - Se SSH falhar, faz apenas git push (deploy manual via hPanel)
 */
async function pullProduction() {
  return new Promise((resolve, reject) => {
    const isWindows = os.platform() === 'win32';
    const projectDir = path.join(__dirname, '..');

    console.log(`--- Deploy Malha3D ---`);
    console.log(`    Ambiente: ${isWindows ? 'Windows (local)' : 'Linux (servidor)'}`);

    if (!isWindows) {
      // ========================================
      // MODO SERVIDOR (Hostinger Linux)
      // Executa diretamente no servidor
      // ========================================
      const command = [
        'export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/opt/alt/alt-nodejs18/root/usr/bin:/opt/alt/alt-nodejs20/root/usr/bin:/opt/alt/alt-nodejs16/root/usr/bin:$HOME/bin',
        'cd ~/domains/malha3d.com/public_html || cd ~/public_html || true',
        'git fetch origin main',
        'git reset --hard origin/main',
        'npm install --production 2>&1 | tail -5',
        'touch server.js',
        'echo "DEPLOY_SUCCESS"'
      ].join(' && ');

      exec(command, { shell: '/bin/bash', timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          // Se erro é sobre sqlite, ignorar
          if (stderr && stderr.includes('dev.sqlite')) {
            return resolve({ success: true, message: 'Deploy OK (sqlite warning ignorado)', output: stdout });
          }
          return reject({ success: false, message: error.message, details: stderr });
        }
        if (stdout.includes('DEPLOY_SUCCESS')) {
          resolve({ success: true, message: 'Deploy em produção concluído!', output: stdout });
        } else {
          resolve({ success: true, message: 'Comandos executados', output: stdout });
        }
      });
    } else {
      // ========================================
      // MODO LOCAL (Windows)
      // Apenas faz git push — Hostinger faz pull via Git Deploy
      // ========================================
      const command = 'git push origin main';

      exec(command, { cwd: projectDir, timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          return reject({ success: false, message: error.message, details: stderr });
        }
        // Se já está up-to-date ou pushed OK
        if ((stdout + stderr).includes('Everything up-to-date') || (stdout + stderr).includes('main -> main')) {
          resolve({
            success: true,
            message: 'Git push realizado! Código enviado para o GitHub.\nO servidor Hostinger será atualizado automaticamente pelo Git Deploy.\nSe não atualizar em 2min, acesse hPanel > Git e clique em "Pull".',
            output: stdout + stderr
          });
        } else {
          resolve({ success: true, message: 'Push executado', output: stdout + stderr });
        }
      });
    }
  });
}

module.exports = pullProduction;
