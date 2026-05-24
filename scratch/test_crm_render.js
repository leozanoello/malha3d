const puppeteer = require('puppeteer');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@malha3d.com';
const ADMIN_PASS = 'admin123';

async function diagnoseCRM() {
  console.log('🤖 Starting CRM Diagnostics...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 [Console Error]: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => {
      console.log(`🔴 [Page Exception]: ${err.toString()}`);
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

    // Get count of elements in Kanban, List, and Spreadsheet views
    const kanbanCardsCount = await page.evaluate(() => {
      return document.querySelectorAll('#kanban-board .kanban-card').length;
    });
    console.log(`- Kanban Cards Count: ${kanbanCardsCount}`);

    const listRowsCount = await page.evaluate(() => {
      return document.querySelectorAll('#view-list .crm-item-row').length;
    });
    console.log(`- List Rows Count: ${listRowsCount}`);

    const spreadsheetRowsCount = await page.evaluate(() => {
      return document.querySelectorAll('#view-spreadsheet tbody tr').length;
    });
    console.log(`- Spreadsheet Rows Count: ${spreadsheetRowsCount}`);

    // Let's check if the list view has height or is hidden by css
    const listStyle = await page.evaluate(() => {
      const el = document.getElementById('view-list');
      if (!el) return 'Element not found';
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        height: style.height,
        opacity: style.opacity
      };
    });
    console.log('List View Computed Style:', listStyle);

    // Let's click "Lista" view toggle and check computed styles again
    console.log('🖱️ Clicking "Lista" view toggle...');
    await page.click('#btn-view-list');
    
    const listStyleAfterClick = await page.evaluate(() => {
      const el = document.getElementById('view-list');
      if (!el) return 'Element not found';
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        height: style.height,
        opacity: style.opacity
      };
    });
    console.log('List View Computed Style After Click:', listStyleAfterClick);

    // Get any Javascript variables from window or see if there is any script crash
    const crmMode = await page.evaluate(() => localStorage.getItem('crm_view_mode'));
    console.log(`- LocalStorage crm_view_mode: ${crmMode}`);

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await browser.close();
  }
}

diagnoseCRM();
