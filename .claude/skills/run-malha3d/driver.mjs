#!/usr/bin/env node
/**
 * Malha3D Driver — Start server + test basic endpoints
 * Used by /run-malha3d skill to verify app is running
 */

import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root is 3 levels up from this file
const PROJECT_ROOT = join(__dirname, '../../..');
const PORT = 3001;

console.log('🚀 Malha3D Driver: Starting server...');
console.log(`📁 Project root: ${PROJECT_ROOT}`);

// Start the server process
const server = spawn('node', ['server.js'], {
  cwd: PROJECT_ROOT,
  stdio: 'inherit',
});

// Give server time to start
await sleep(3000);

// Test basic endpoints
const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/admin/health', name: 'Health Check' },
  { path: '/admin/contatos', name: 'Contacts' },
];

console.log('\n🧪 Testing endpoints:');

let allOk = true;
for (const { path, name } of endpoints) {
  const res = await new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', () => resolve({ status: 0, data: '' }));
    setTimeout(() => resolve({ status: 0, data: '' }), 5000);
  });

  const ok = res.status >= 200 && res.status < 400;
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${name}: ${res.status || 'TIMEOUT'}`);
  if (!ok) allOk = false;
}

if (allOk) {
  console.log('\n✅ All endpoints responding. Server is running.');
  console.log(`   → Browse to http://localhost:${PORT}`);
  console.log(`   → Login at http://localhost:${PORT}/admin/login (admin@malha3d.com / admin123)`);
  console.log('   → Press Ctrl+C to stop');
  process.exit(0);
} else {
  console.log('\n❌ Some endpoints failed.');
  process.exit(1);
}
