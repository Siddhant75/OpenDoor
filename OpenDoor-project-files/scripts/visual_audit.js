const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:/Users/acer/.gemini/antigravity/brain/977d8bf4-de8f-4c63-9cef-1d998719b762';

async function run() {
  console.log('Launching browser (Edge)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err));

  console.log('Navigating to http://localhost:3000...');
  
  // Retry loop in case server is still booting
  let retries = 10;
  while (retries > 0) {
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 5000 });
      break;
    } catch (e) {
      console.log(`Waiting for server... retries left: ${retries}`);
      await new Promise(r => setTimeout(r, 2000));
      retries--;
    }
  }

  console.log('Page loaded! Title:', await page.title());

  // 1. Initial State
  const shot1 = path.join(ARTIFACTS_DIR, 'step1_initial_view.png');
  await page.screenshot({ path: shot1, fullPage: true });
  console.log('Saved Screenshot 1:', shot1);

  // Check what input value is
  const venueVal = await page.$eval('#venue-name', el => el.value);
  console.log('Current venue input value:', venueVal);

  // 2. Click Scan Digital Reality
  console.log('Clicking #btn-scan...');
  await page.click('#btn-scan');
  await page.waitForTimeout(500);

  // Take screenshot of scanning state
  const shotScanning = path.join(ARTIFACTS_DIR, 'step2_scanning.png');
  await page.screenshot({ path: shotScanning, fullPage: true });
  console.log('Saved Screenshot 2 (Scanning):', shotScanning);

  // Wait for scanning to resolve to gap state
  console.log('Waiting for gap state (#gap-state to be visible)...');
  await page.waitForSelector('#gap-state:not(.hidden)', { timeout: 10000 });

  const shotGap = path.join(ARTIFACTS_DIR, 'step3_gap_detected.png');
  await page.screenshot({ path: shotGap, fullPage: true });
  console.log('Saved Screenshot 3 (Gap State):', shotGap);

  // Check digital results content
  const digitalResults = await page.$eval('#digital-results', el => el.innerText);
  console.log('Digital results displayed:', JSON.stringify(digitalResults));

  // 3. Click Authorize CALL-E Dispatch
  console.log('Clicking #btn-authorize...');
  await page.click('#btn-authorize');

  // Wait for call state
  await page.waitForSelector('#call-state:not(.hidden)', { timeout: 5000 });
  console.log('Call state active. Waiting 4 seconds to capture transcript streaming...');
  await page.waitForTimeout(4000);

  const shotCall = path.join(ARTIFACTS_DIR, 'step4_live_call.png');
  await page.screenshot({ path: shotCall, fullPage: true });
  console.log('Saved Screenshot 4 (Live Call):', shotCall);

  // Wait for completion and brief state
  console.log('Waiting for final brief (#brief-state:not(.hidden))...');
  await page.waitForSelector('#brief-state:not(.hidden)', { timeout: 15000 });

  const shotBrief = path.join(ARTIFACTS_DIR, 'step5_final_brief.png');
  await page.screenshot({ path: shotBrief, fullPage: true });
  console.log('Saved Screenshot 5 (Final Brief):', shotBrief);

  const briefBadge = await page.$eval('#brief-badge', el => el.innerText);
  console.log('Final Brief Status Badge:', briefBadge);

  const assessments = await page.$eval('#assessments-list', el => el.innerText);
  console.log('Assessments displayed:', JSON.stringify(assessments));

  await browser.close();
  console.log('Visual audit finished successfully!');
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
