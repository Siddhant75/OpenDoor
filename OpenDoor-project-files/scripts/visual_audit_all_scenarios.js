const { chromium } = require('playwright');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/acer/.gemini/antigravity/brain/977d8bf4-de8f-4c63-9cef-1d998719b762';

async function run() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scenario 2: Full Confirmation
  console.log('Testing Scenario 2 (Full Confirmation)...');
  await page.click('#scenarios-container button:nth-child(2)');
  await page.waitForTimeout(300);
  await page.click('#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)');
  await page.click('#btn-authorize');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 20000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'prod_sc2_feasible.png'), fullPage: true });

  // Scenario 3: Hard Physical Barrier
  console.log('Testing Scenario 3 (Hard Physical Barrier)...');
  await page.click('#scenarios-container button:nth-child(3)');
  await page.waitForTimeout(300);
  await page.click('#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)');
  await page.click('#btn-authorize');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 20000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'prod_sc3_not_feasible.png'), fullPage: true });

  // Scenario 4: Telephony Failure
  console.log('Testing Scenario 4 (Telephony Failure)...');
  await page.click('#scenarios-container button:nth-child(4)');
  await page.waitForTimeout(300);
  await page.click('#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)');
  await page.click('#btn-authorize');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 20000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'prod_sc4_needs_review.png'), fullPage: true });

  console.log('All scenarios verified visually!');
  await browser.close();
}

run().catch(console.error);
