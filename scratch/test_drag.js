const puppeteer = require('puppeteer');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@malha3d.com';
const ADMIN_PASS = 'admin123';

async function testDragAndDrop() {
  console.log('🤖 Starting Drag-and-Drop Test...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Capture console errors
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

    // Check if Sortable is defined
    const isSortableDefined = await page.evaluate(() => typeof Sortable !== 'undefined');
    console.log(`- Is Sortable defined on page? ${isSortableDefined}`);

    // Get the first card ID and status
    const firstCardInfo = await page.evaluate(() => {
      const card = document.querySelector('#kanban-board .kanban-card');
      if (!card) return null;
      return {
        id: card.getAttribute('data-id'),
        name: card.querySelector('.card-name')?.innerText,
        status: card.closest('.cards-list').getAttribute('data-status')
      };
    });

    if (!firstCardInfo) {
      console.log('❌ No cards found on the board.');
      return;
    }
    console.log(`Found card: "${firstCardInfo.name}" (ID: ${firstCardInfo.id}, Status: ${firstCardInfo.status})`);

    // Let's check the columns and find a destination column
    const destinationStatus = await page.evaluate((currentStatus) => {
      const columns = Array.from(document.querySelectorAll('#kanban-board .cards-list'));
      const dest = columns.find(c => c.getAttribute('data-status') !== currentStatus);
      return dest ? dest.getAttribute('data-status') : null;
    }, firstCardInfo.status);

    console.log(`Destination column status: ${destinationStatus}`);

    if (destinationStatus) {
      console.log('Dragging card to destination via HTML5 event simulation...');
      const cardSelector = `#kanban-board .kanban-card[data-id="${firstCardInfo.id}"]`;
      const destSelector = `#kanban-board .cards-list[data-status="${destinationStatus}"]`;

      await page.evaluate((srcSel, destSel) => {
        const source = document.querySelector(srcSel);
        const target = document.querySelector(destSel);
        if (!source || !target) {
          console.error('Source or target not found in page');
          return;
        }

        const createEvent = (type, data = {}) => {
          const event = new Event(type, { bubbles: true, cancelable: true });
          Object.assign(event, data);
          return event;
        };

        const dataTransfer = {
          data: {},
          setData: function(key, val) { this.data[key] = val; },
          getData: function(key) { return this.data[key]; },
          dropEffect: 'move',
          effectAllowed: 'all',
          types: ['text/plain']
        };

        // Dispatch dragstart
        source.dispatchEvent(createEvent('dragstart', { dataTransfer }));

        // Dispatch dragenter/dragover on target
        target.dispatchEvent(createEvent('dragenter', { dataTransfer }));
        target.dispatchEvent(createEvent('dragover', { dataTransfer }));

        // SortableJS inserts the item into the DOM during dragover. Let's append the source directly to the target list to simulate drop.
        target.appendChild(source);

        // Dispatch drop on target
        target.dispatchEvent(createEvent('drop', { dataTransfer }));

        // Dispatch dragend on source
        source.dispatchEvent(createEvent('dragend', { dataTransfer }));
      }, cardSelector, destSelector);

      console.log('Waiting for drag & drop to sync...');
      await page.waitForTimeout(2000);

      // Verify new status in DOM
      const currentStatus = await page.evaluate((id) => {
        const card = document.querySelector(`.kanban-card[data-id="${id}"]`);
        if (!card) return 'NOT_FOUND';
        return card.closest('.cards-list').getAttribute('data-status');
      }, firstCardInfo.id);

      console.log(`Card status after drag: ${currentStatus}`);
      if (currentStatus === destinationStatus) {
        console.log('✅ Drag-and-drop E2E test PASSED!');
      } else {
        console.log('❌ Drag-and-drop E2E test FAILED.');
      }
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

testDragAndDrop();
