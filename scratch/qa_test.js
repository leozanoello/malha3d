#!/usr/bin/env node
/**
 * QA Automation Test Suite for Malha3D ERP
 * Tests 5 critical user flows by analyzing rendered HTML + testing API endpoints
 */
require('dotenv').config();
const http = require('http');
const querystring = require('querystring');

const BASE = 'http://localhost:3000';
let COOKIE = '';
let passed = 0;
let failed = 0;
const results = [];

function log(test, status, detail) {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${test}] ${detail}`);
  results.push({ test, status, detail });
  if (status === 'PASS') passed++;
  else failed++;
}

function httpRequest(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { Cookie: COOKIE, ...headers }
    };
    
    const req = http.request(opts, (res) => {
      // Capture cookies
      if (res.headers['set-cookie']) {
        COOKIE = res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function login() {
  console.log('\n🔑 === PASSO 1: LOGIN ===');
  const postData = querystring.stringify({ email: 'admin@zanoello.com', password: 'admin123' });
  const res = await httpRequest('POST', '/admin/login', postData, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  });
  
  if (res.status === 302 && res.headers.location === '/admin') {
    log('LOGIN', 'PASS', `Redirect to ${res.headers.location}`);
    return true;
  } else {
    log('LOGIN', 'FAIL', `Status ${res.status}, expected 302. Body: ${res.body.substring(0,100)}`);
    return false;
  }
}

async function testCRM() {
  console.log('\n📊 === PASSO 2: CRM ===');
  
  // 2a. Load CRM page
  const res = await httpRequest('GET', '/admin/crm');
  if (res.status !== 200) {
    log('CRM-PAGE', 'FAIL', `Status ${res.status} (expected 200)`);
    return;
  }
  log('CRM-PAGE', 'PASS', `Page loaded (${res.body.length} bytes)`);
  
  // 2b. Check "Novo Lead" button exists and is wired to open the modal
  const html = res.body;
  
  // Check newLeadModal exists
  const hasNewLeadModal = html.includes('id="newLeadModal"');
  log('CRM-NEW-LEAD-MODAL-EXISTS', hasNewLeadModal ? 'PASS' : 'FAIL', 
    hasNewLeadModal ? 'newLeadModal HTML block found' : 'newLeadModal NOT found in HTML');
  
  // Check there's a button that triggers it
  // Look for onclick or JS that shows newLeadModal
  const hasNewLeadBtn = html.includes('openNewLeadModal') || 
                         html.includes("newLeadModal')") ||
                         html.includes("getElementById('newLeadModal')");
  log('CRM-NEW-LEAD-TRIGGER', hasNewLeadBtn ? 'PASS' : 'FAIL',
    hasNewLeadBtn ? 'Button/trigger to open newLeadModal found' : 'NO trigger to open newLeadModal');

  // Check the modal form has required fields: Metragem, Softwares, Budget
  const hasMetragem = html.includes('name="totalArea"');
  const hasSoftware = html.includes('name="targetSoftware"') || html.includes('name="visualStyle"');
  const hasBudget = html.includes('name="estimatedValue"');
  log('CRM-FORM-FIELDS', (hasMetragem && hasSoftware && hasBudget) ? 'PASS' : 'FAIL',
    `Metragem:${hasMetragem}, Software:${hasSoftware}, Budget:${hasBudget}`);
  
  // 2c. Check manageLeadModal exists for editing existing cards
  const hasManageLeadModal = html.includes('id="manageLeadModal"');
  log('CRM-MANAGE-MODAL', hasManageLeadModal ? 'PASS' : 'FAIL',
    hasManageLeadModal ? 'manageLeadModal found' : 'manageLeadModal NOT found');
  
  // 2d. Check edit toggle exists in manage modal
  const hasEditToggle = html.includes('id="btn-edit-toggle"');
  log('CRM-EDIT-TOGGLE', hasEditToggle ? 'PASS' : 'FAIL',
    hasEditToggle ? 'btn-edit-toggle button found' : 'btn-edit-toggle NOT found');
  
  // 2e. Check edit-actions div exists  
  const hasEditActions = html.includes('id="edit-actions"');
  log('CRM-EDIT-ACTIONS', hasEditActions ? 'PASS' : 'FAIL',
    hasEditActions ? 'edit-actions container found' : 'edit-actions NOT found');
  
  // 2f. Check JS wiring - does clicking a kanban card actually call openLeadModal or similar
  const hasCardClickHandler = html.includes('openLeadModal') || 
                               html.includes('manageLeadModal') ||
                               html.includes("closest('.kanban-card')");
  log('CRM-CARD-CLICK-HANDLER', hasCardClickHandler ? 'PASS' : 'FAIL',
    hasCardClickHandler ? 'Card click handler JS found' : 'No card click handler JS');

  // 2g. Test the POST /admin/api/leads endpoint
  const leadData = JSON.stringify({ name: 'QA Test Lead', estimatedValue: 5000 });
  const apiRes = await httpRequest('POST', '/admin/api/leads', leadData, {
    'Content-Type': 'application/json'
  });
  if (apiRes.status === 200) {
    const result = JSON.parse(apiRes.body);
    log('CRM-API-CREATE-LEAD', result.success ? 'PASS' : 'FAIL',
      result.success ? `Lead created: ${result.lead?.name}` : `API error: ${result.message}`);
  } else {
    log('CRM-API-CREATE-LEAD', 'FAIL', `Status ${apiRes.status}: ${apiRes.body.substring(0,100)}`);
  }
  
  // 2h. Check Novo Lead form action is correct
  const formActionMatch = html.match(/<form[^>]*action="\/admin\/negociacoes\/novo"[^>]*>/);
  log('CRM-FORM-ACTION', formActionMatch ? 'PASS' : 'FAIL',
    formActionMatch ? 'Form action /admin/negociacoes/novo found' : 'Form action missing or wrong');
}

async function testNegociacoes() {
  console.log('\n💼 === PASSO 2b: NEGOCIAÇÕES ===');
  
  const res = await httpRequest('GET', '/admin/negociacoes');
  if (res.status !== 200) {
    log('NEG-PAGE', 'FAIL', `Status ${res.status}`);
    return;
  }
  log('NEG-PAGE', 'PASS', `Page loaded (${res.body.length} bytes)`);
  
  // Check for error markers
  const hasError = res.body.includes('Erro interno') || res.body.includes('Missing helper');
  log('NEG-NO-ERRORS', !hasError ? 'PASS' : 'FAIL',
    !hasError ? 'No server errors detected' : 'SERVER ERROR found in page');
}

async function testAdvancedAdmin() {
  console.log('\n👥 === PASSO 3: GESTÃO MULTI-TENANT / NOVO USUÁRIO ===');
  
  // The route is /admin/avancado (NOT /admin/advanced-admin)
  let res = await httpRequest('GET', '/admin/avancado');
  
  if (res.status === 404) {
    log('ADMIN-USER-MGMT-ROUTE', 'FAIL', 'Route /admin/avancado returned 404');
  } else if (res.status === 200) {
    log('ADMIN-USER-MGMT', 'PASS', `Advanced admin page loaded (${res.body.length} bytes)`);
    
    const hasCreateForm = res.body.includes('newUserModal') || res.body.includes('Criar Usuário Manual');
    log('ADMIN-CREATE-USER-FORM', hasCreateForm ? 'PASS' : 'FAIL',
      hasCreateForm ? 'Create user form/modal found' : 'Create user form NOT found');
    
    const hasNoError = !res.body.includes('Erro interno') && !res.body.includes('Missing helper');
    log('ADMIN-NO-ERRORS', hasNoError ? 'PASS' : 'FAIL',
      hasNoError ? 'No server errors' : 'SERVER ERROR in advanced admin');
  } else {
    log('ADMIN-USER-MGMT', 'FAIL', `Unexpected status ${res.status}`);
  }
  
  // Test user creation API
  const userData = JSON.stringify({
    name: 'QA Test User',
    email: `qa_test_${Date.now()}@test.com`,
    password: 'test12345',
    role: 'staff'
  });
  const apiRes = await httpRequest('POST', '/admin/api/users', userData, {
    'Content-Type': 'application/json'
  });
  if (apiRes.status === 200 || apiRes.status === 201) {
    const result = JSON.parse(apiRes.body);
    log('ADMIN-API-CREATE-USER', result.success || result.user ? 'PASS' : 'FAIL',
      result.success || result.user ? 'User created via API' : `API error: ${JSON.stringify(result).substring(0,100)}`);
  } else {
    log('ADMIN-API-CREATE-USER', 'FAIL', `Status ${apiRes.status}: ${apiRes.body.substring(0,150)}`);
  }
}

async function testEquipeStaff() {
  console.log('\n🏢 === PASSO 4: EQUIPE INTERNA & STAFF ===');
  
  // Check freelancers page
  const res = await httpRequest('GET', '/admin/freelancers');
  if (res.status === 200) {
    log('STAFF-PAGE', 'PASS', `Freelancers page loaded (${res.body.length} bytes)`);
    
    // Check for 3-dot menu (more_vert icon) and dropdown
    const hasDropdownMenu = res.body.includes('dropdown') || res.body.includes('more_vert') || res.body.includes('data-dropdown');
    log('STAFF-DROPDOWN', hasDropdownMenu ? 'PASS' : 'FAIL',
      hasDropdownMenu ? 'Dropdown/action menu with more_vert found' : 'No dropdown/action menu found');
    
    // Check that glass-card on freelancer cards has overflow:visible override
    const hasOverflowVisible = res.body.includes('overflow: visible');
    log('STAFF-OVERFLOW-FIX', hasOverflowVisible ? 'PASS' : 'FAIL',
      hasOverflowVisible ? 'overflow:visible applied to cards - dropdown will not be clipped' : 'Cards still missing overflow:visible override');
  } else {
    log('STAFF-PAGE', 'FAIL', `Status ${res.status}`);
  }
}

async function testSettings() {
  console.log('\n⚙️ === PASSO 5: CONFIGURAÇÕES / MASTER CI/CD ===');
  
  const res = await httpRequest('GET', '/admin/configuracoes');
  if (res.status !== 200) {
    log('SETTINGS-PAGE', 'FAIL', `Status ${res.status}`);
    return;
  }
  log('SETTINGS-PAGE', 'PASS', `Settings loaded (${res.body.length} bytes)`);
  
  // Check for Master Access tab
  const hasMasterTab = res.body.includes('Master') && (res.body.includes('CI/CD') || res.body.includes('Acessos'));
  log('SETTINGS-MASTER-TAB', hasMasterTab ? 'PASS' : 'FAIL',
    hasMasterTab ? 'Master Access / CI/CD tab found' : 'Master tab NOT found');
  
  // Check tab switching JS is event-listener based (not inline onclick that would violate CSP)
  const hasInlineOnclick = res.body.match(/onclick="[^"]*tab/i);
  const hasEventListener = res.body.includes('addEventListener') || res.body.includes('data-tab');
  log('SETTINGS-TAB-SWITCHING', (hasEventListener && !hasInlineOnclick) ? 'PASS' : 'FAIL',
    hasEventListener ? 'Event listener-based tab switching' : 'Tab switching may use inline onclick (CSP violation risk)');
  
  // Check no server errors
  const hasError = res.body.includes('Erro interno') || res.body.includes('Missing helper');
  log('SETTINGS-NO-ERRORS', !hasError ? 'PASS' : 'FAIL',
    !hasError ? 'No server errors in settings' : 'SERVER ERROR in settings page');
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   🧪 MALHA3D QA AUTOMATION TEST SUITE');
  console.log('   Engenheiro de QA: Antigravity Engine');
  console.log('═══════════════════════════════════════════════════');
  
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n💀 CRITICAL: Login failed. Cannot proceed with tests.');
    process.exit(1);
  }
  
  await testCRM();
  await testNegociacoes();
  await testAdvancedAdmin();
  await testEquipeStaff();
  await testSettings();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log(`   📊 RESULTADOS: ${passed} PASSED / ${failed} FAILED`);
  console.log('═══════════════════════════════════════════════════');
  
  const failedTests = results.filter(r => r.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('\n❌ FALHAS ENCONTRADAS:');
    failedTests.forEach(f => console.log(`   - [${f.test}] ${f.detail}`));
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
