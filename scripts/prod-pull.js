const { exec } = require('child_process');
const path = require('path');
const os = require('os');

/**
 * Script de Produção: Git Pull + Deploy
 * Detecta automaticamente se está em Windows (local) ou Linux (Hostinger/produção)
 */
async function pullProduction() {
  return new Promise((resolve, reject) => {
    console.log('--- Iniciando Sincronização ---');
    console.log(`    OS: ${os.platform()} | CWD: ${path.join(__dirname, '..')}`);

    const isWindows = os.platform() === 'win32';
    let command;

    if (isWindows) {
      // Windows (desenvolvimento local): git pull com checkout limpo
      command = [
        'git fetch origin main',
        'git checkout -- . 2>nul',
        'git pull origin main --force',
        'npm install --production'
      ].join(' & ');
    } else {
      // Linux (Hostinger/produção): PATH expandido + restart
      command = [
        'export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/opt/alt/alt-nodejs18/root/usr/bin:/opt/alt/alt-nodejs20/root/usr/bin:/opt/alt/alt-nodejs16/root/usr/bin:$HOME/bin',
        'git fetch origin main',
        'git reset --hard origin/main 2>/dev/null || git checkout -f origin/main',
        'npm install --production',
        'touch server.js',
        'pkill -u $(whoami) node || true'
      ].join(' && ');
    }

    console.log(`    Shell: ${isWindows ? 'cmd.exe' : '/bin/bash'}`);

    exec(command, {
      cwd: path.join(__dirname, '..'),
      shell: isWindows ? 'cmd.exe' : '/bin/bash',
      timeout: 120000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
    }, (error, stdout, stderr) => {
      if (error) {
        // Se o único erro é sobre unlink de sqlite, considerar sucesso
        if (stderr && stderr.includes('dev.sqlite') && !stderr.includes('fatal')) {
          console.log('Warning: SQLite file locked (ignorado — produção usa PostgreSQL)');
          return resolve({ success: true, message: 'Atualizado (SQLite local ignorado)', output: stdout });
        }
        console.error('Deploy Error:', error.message);
        return reject({ success: false, message: error.message, details: stderr || stdout });
      }
      resolve({ success: true, message: 'Servidor atualizado com sucesso!', output: stdout });
    });
  });
}

module.exports = pullProduction;
