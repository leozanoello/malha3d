const puppeteer = require('puppeteer');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@malha3d.com';
const ADMIN_PASS = 'admin123';

async function testTabs() {
  console.log('🤖 Starting Tab Switching Test...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => {
      console.log(`[Console]: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.log(`[Page Exception]: ${err.toString()}`);
    });

    // Login
    console.log('🔑 Logging in...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASS);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // Go to CRM page
    console.log('📍 Navigating to CRM...');
    await page.goto(`${BASE_URL}/admin/negociacoes`, { waitUntil: 'networkidle2' });

    // Verify initial state
    const initialState = await page.evaluate(() => {
      const kanbanVisible = !document.getElementById('kanban-board-container').classList.contains('hidden');
      const analiseVisible = !document.getElementById('analise-container').classList.contains('hidden');
      return { kanbanVisible, analiseVisible };
    });
    console.log('Initial visibility:', initialState);

    // Click "Análise & Previsão" tab
    console.log('🖱️ Clicking "Análise & Previsão" tab...');
    await page.click('button.crm-page-tab[data-tab="analise"]');
    await page.waitForTimeout(500);

    // Verify tab state after click
    const clickedState = await page.evaluate(() => {
      const kanbanVisible = !document.getElementById('kanban-board-container').classList.contains('hidden');
      const analiseVisible = !document.getElementById('analise-container').classList.contains('hidden');
      // Check if Chart.js instances exist on the canvas elements or in our window objects
      const hasCharts = typeof Chart !== 'undefined';
      return { kanbanVisible, analiseVisible, hasCharts };
    });
    console.log('Visibility after clicking "Análise & Previsão":', clickedState);

    if (!clickedState.kanbanVisible && clickedState.analiseVisible) {
      console.log('✅ Tab switching to "Análise & Previsão" worked perfectly!');
    } else {
      console.log('❌ Tab switching FAILED.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Helper for wait
if (!puppeteer.Page.prototype.waitForTimeout) {
  puppeteer.Page.prototype.waitForTimeout = function (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };
}

testTabs();
