const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');

async function ensureServerRunning() {
  try {
    const res = await fetch('http://localhost:3000/api/scenarios');
    if (res.ok) return;
  } catch (e) {}

  console.log('Starting API server on http://localhost:3000...');
  const { spawn } = require('child_process');
  const srv = spawn('npx', ['ts-node', 'src/api/server.ts'], {
    cwd: PROJECT_ROOT,
    shell: true,
    stdio: 'ignore'
  });
  srv.unref();

  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch('http://localhost:3000/api/scenarios');
      if (res.ok) {
        console.log('✅ Server ready on http://localhost:3000');
        return;
      }
    } catch (e) {}
  }
  throw new Error('Failed to start API server on port 3000');
}

async function run() {
  await ensureServerRunning();

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  console.log('📸 Launching high-DPI Playwright browser (2x Retina scale)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2 // High-DPI crisp capture
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Hero Command Center
  console.log('📸 Capturing 01_command_center_hero.png...');
  await page.screenshot({
    path: path.join(ASSETS_DIR, '01_command_center_hero.png'),
    fullPage: false
  });

  // 2. Scenario 1 & Digital Gap Scan
  console.log('📸 Selecting The Hero Demotion & Scanning...');
  await page.click('#scenarios-container button:first-child');
  await page.waitForTimeout(300);
  await page.click('#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)', { timeout: 10000 });
  await page.waitForTimeout(600);

  console.log('📸 Capturing 02_digital_gap_analysis.png...');
  await page.screenshot({
    path: path.join(ASSETS_DIR, '02_digital_gap_analysis.png'),
    fullPage: false
  });

  // 3. Live Telephony Stream & Waveform
  console.log('📸 Authorizing CALL-E dispatch...');
  await page.click('#btn-authorize');
  await page.waitForSelector('#state-call:not(.hidden)', { timeout: 5000 });
  await page.waitForTimeout(2500); // Let dialog stream and waveform animate

  console.log('📸 Capturing 03_live_telephony_stream.png...');
  await page.screenshot({
    path: path.join(ASSETS_DIR, '03_live_telephony_stream.png'),
    fullPage: false
  });

  // 4. Final Brief & Deterministic Demotion
  console.log('📸 Waiting for Final Evidence Brief...');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 20000 });
  await page.waitForTimeout(600);

  console.log('📸 Capturing 04_hero_demotion_verdict.png...');
  await page.screenshot({
    path: path.join(ASSETS_DIR, '04_hero_demotion_verdict.png'),
    fullPage: false
  });

  // 5. Expanded Technical Audit Drawer
  console.log('📸 Expanding Technical Audit Drawer...');
  await page.click('#toggle-audit-btn');
  await page.waitForTimeout(400);

  console.log('📸 Capturing 05_technical_audit_drawer.png...');
  await page.screenshot({
    path: path.join(ASSETS_DIR, '05_technical_audit_drawer.png'),
    fullPage: false
  });

  await browser.close();
  console.log('🎉 All 5 high-DPI README screenshots successfully captured in assets/!');
}

run().catch(err => {
  console.error('Failed to capture assets:', err);
  process.exit(1);
});
