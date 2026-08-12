const { exec } = require('child_process');
const path = require('path');
const os = require('os');

/**
 * Script de Produção: Git Pull + Deploy
 * Detecta automaticamente se está em Windows (local) ou Linux (Hostinger/produção)
 * e executa o comando correto para cada ambiente.
 */
async function pullProduction() {
  return new Promise((resolve, reject) => {
    console.log('--- Iniciando Sincronização ---');
    console.log(`    OS: ${os.platform()} | CWD: ${path.join(__dirname, '..')}`);

    const isWindows = os.platform() === 'win32';
    let command;

    if (isWindows) {
      // Windows (desenvolvimento local): apenas git pull + npm install
      command = [
        'git fetch origin main',
        'git reset --hard origin/main',
        'npm install --production'
      ].join(' && ');
    } else {
      // Linux (Hostinger/produção): PATH expandido + kill node process
      command = [
        'export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/opt/alt/alt-nodejs18/root/usr/bin:/opt/alt/alt-nodejs20/root/usr/bin:/opt/alt/alt-nodejs16/root/usr/bin:$HOME/bin',
        'git fetch origin main',
        'git reset --hard origin/main',
        'npm install --production',
        'touch server.js',
        'pkill -u $(whoami) node || true'
      ].join(' && ');
    }

    const shell = isWindows ? 'cmd.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['/c'] : ['-c'];

    console.log(`    Shell: ${shell}`);
    console.log(`    Command: ${command.substring(0, 100)}...`);

    exec(command, {
      cwd: path.join(__dirname, '..'),
      shell: isWindows ? true : '/bin/bash',
      timeout: 120000
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('Deploy Error:', error.message);
        console.error('Stderr:', stderr);
        return reject({ success: false, message: error.message, details: stderr || stdout });
      }
      console.log('Deploy Output:', stdout);
      resolve({ success: true, message: 'Servidor atualizado com sucesso!', output: stdout });
    });
  });
}

module.exports = pullProduction;
