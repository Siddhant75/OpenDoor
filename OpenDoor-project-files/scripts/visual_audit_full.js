const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/acer/.gemini/antigravity/brain/977d8bf4-de8f-4c63-9cef-1d998719b762';

async function run() {
  console.log('🚀 Starting Full Command Center Visual Verification...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER CONSOLE ERROR]', msg.text());
  });

  console.log('Connecting to http://localhost:3000...');
  let retries = 10;
  while (retries > 0) {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 5000 });
      break;
    } catch (e) {
      console.log(`Waiting for server... retries left: ${retries}`);
      await new Promise(r => setTimeout(r, 1500));
      retries--;
    }
  }

  // --- 1. Initial Command Center View ---
  console.log('📸 1. Capturing Initial Command Center State...');
  const shot1 = path.join(ARTIFACTS_DIR, 'prod_1_command_center.png');
  await page.screenshot({ path: shot1, fullPage: true });

  // --- 2. Live Venue Search & Autocomplete ---
  console.log('🔍 2. Testing Live Venue Search...');
  await page.fill('#venue-input', 'Symphony Hall');
  await page.waitForTimeout(600); // Wait for debounce
  const shotSearch = path.join(ARTIFACTS_DIR, 'prod_2_venue_search.png');
  await page.screenshot({ path: shotSearch, fullPage: true });

  // --- 3. Scenario 1 (Hero Demotion) Run ---
  console.log('🎭 3. Running Scenario 1 (Hero Demotion)...');
  await page.click('#scenarios-container button:first-child');
  await page.waitForTimeout(400);

  console.log('Scanning Digital Reality...');
  await page.click('#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)', { timeout: 10000 });

  const shotGap1 = path.join(ARTIFACTS_DIR, 'prod_3_gap_analysis.png');
  await page.screenshot({ path: shotGap1, fullPage: true });

  console.log('Authorizing CALL-E Dispatch...');
  await page.click('#btn-authorize');
  await page.waitForSelector('#state-call:not(.hidden)', { timeout: 5000 });
  await page.waitForTimeout(3000); // Let some transcript stream and audio wave animate

  const shotCall1 = path.join(ARTIFACTS_DIR, 'prod_4_live_waveform_call.png');
  await page.screenshot({ path: shotCall1, fullPage: true });

  console.log('Waiting for Final Evidence Brief...');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 20000 });

  const shotBrief1 = path.join(ARTIFACTS_DIR, 'prod_5_brief_hero_demotion.png');
  await page.screenshot({ path: shotBrief1, fullPage: true });

  // --- 4. Open and Capture Technical Audit Drawer ---
  console.log('📊 4. Inspecting Proof Chain in Audit Drawer...');
  await page.click('#toggle-audit-btn');
  await page.waitForTimeout(400);

  const shotAudit = path.join(ARTIFACTS_DIR, 'prod_6_technical_audit_drawer.png');
  await page.screenshot({ path: shotAudit, fullPage: true });

  console.log('✅ Full Visual Verification Completed Successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
