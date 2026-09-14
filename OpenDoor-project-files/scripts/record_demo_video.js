const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const RECORDINGS_DIR = path.join(PROJECT_ROOT, 'recordings');

let scriptStartTime = 0;

async function sleepUntil(targetSec) {
  const elapsed = (Date.now() - scriptStartTime) / 1000;
  const remaining = targetSec - elapsed;
  if (remaining > 0) {
    await new Promise(r => setTimeout(r, remaining * 1000));
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

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

// Injects virtual glowing cursor and ripple animation into DOM
async function injectVirtualCursor(page) {
  await page.addStyleTag({
    content: `
      #virtual-cursor {
        position: fixed;
        top: 0;
        left: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.9);
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 16px rgba(59, 130, 246, 0.95), 0 2px 8px rgba(0,0,0,0.6);
        pointer-events: none;
        z-index: 999999;
        transition: transform 0.08s ease-out;
        transform: translate(-100px, -100px);
      }
      .cursor-click-ripple {
        position: fixed;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid #60a5fa;
        background: rgba(96, 165, 250, 0.35);
        pointer-events: none;
        z-index: 999998;
        animation: rippleAnimation 0.5s ease-out forwards;
      }
      @keyframes rippleAnimation {
        0% { transform: scale(0.2); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    `
  });

  await page.evaluate(() => {
    if (!document.getElementById('virtual-cursor')) {
      const cur = document.createElement('div');
      cur.id = 'virtual-cursor';
      document.body.appendChild(cur);
      window.__moveCursor = (x, y) => {
        cur.style.transform = `translate(${x - 11}px, ${y - 11}px)`;
      };
      window.__clickRipple = (x, y) => {
        const rip = document.createElement('div');
        rip.className = 'cursor-click-ripple';
        rip.style.left = `${x - 22}px`;
        rip.style.top = `${y - 22}px`;
        document.body.appendChild(rip);
        setTimeout(() => rip.remove(), 550);
      };
    }
  });
}

async function smoothMoveTo(page, x, y, steps = 15) {
  const curPos = await page.evaluate(() => {
    const cur = document.getElementById('virtual-cursor');
    if (!cur) return { x: 500, y: 300 };
    const matrix = window.getComputedStyle(cur).transform;
    if (matrix && matrix !== 'none') {
      const values = matrix.split('(')[1].split(')')[0].split(',');
      return { x: parseFloat(values[4]) + 11, y: parseFloat(values[5]) + 11 };
    }
    return { x: 500, y: 300 };
  });

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const nx = curPos.x + (x - curPos.x) * ease;
    const ny = curPos.y + (y - curPos.y) * ease;

    await page.evaluate(({ cx, cy }) => {
      window.__moveCursor(cx, cy);
    }, { cx: nx, cy: ny });

    await page.mouse.move(nx, ny);
    await new Promise(r => setTimeout(r, 14));
  }
}

async function moveToElement(page, selector) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (box) {
    await smoothMoveTo(page, box.x + box.width / 2, box.y + box.height / 2);
  }
}

async function clickElement(page, selector) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMoveTo(page, targetX, targetY);
    await page.evaluate(({ cx, cy }) => {
      window.__clickRipple(cx, cy);
    }, { cx: targetX, cy: targetY });
    await sleep(120);
    await page.click(selector);
  }
}

async function humanType(page, selector, text) {
  await clickElement(page, selector);
  await page.fill(selector, '');
  for (const char of text) {
    await page.type(selector, char, { delay: Math.floor(Math.random() * 40 + 35) });
  }
}

// ----------------------------------------------------
// FRAME-ACCURATE CHOREOGRAPHED ACTS (120s Master Sync)
// ----------------------------------------------------

async function recordAct1Hook(page) {
  console.log('🎬 Act 1: The Hook & Command Center (0.0s - 15.0s)');
  await smoothMoveTo(page, 720, 250);
  await sleepUntil(4.0);

  // Glide across top navbar to highlight system status
  await smoothMoveTo(page, 1200, 30);
  await sleepUntil(8.0);

  // Move to Curated Scenarios
  await moveToElement(page, '#scenarios-container');
  await sleepUntil(12.0);

  // Hover over Scenario 1: The Hero Demotion
  await moveToElement(page, '#scenarios-container button:first-child');
  await sleepUntil(14.2);
  await clickElement(page, '#scenarios-container button:first-child');
  await sleepUntil(15.0);
}

async function recordAct2DigitalScan(page) {
  console.log('🎬 Act 2: Dynamic Discovery & The Digital Gap (15.0s - 24.5s)');
  // Click Scan at 15.5s
  await sleepUntil(15.5);
  await clickElement(page, '#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)', { timeout: 10000 });
  await sleepUntil(18.5);

  // Highlight Parking (Green)
  await smoothMoveTo(page, 800, 220);
  await sleepUntil(21.0);

  // Highlight Step-Free Entrance (Green)
  await smoothMoveTo(page, 800, 320);
  await sleepUntil(24.5);
}

async function recordAct3GapIdentifiedAndConsent(page) {
  console.log('🎬 Act 3: Physical Gap & Human Consent (24.5s - 42.0s)');
  // Highlight Main Elevator Operating Today (Yellow Critical Gap)
  await smoothMoveTo(page, 800, 440);
  await sleepUntil(32.0);

  // Smoothly scroll down to the Human Consent Gate
  await moveToElement(page, '#btn-authorize');
  await sleepUntil(36.0);

  // Narrator says "We click Authorize and Dispatch CALL-E" -> Click at 36.5s
  await clickElement(page, '#btn-authorize');
  await page.waitForSelector('#state-call:not(.hidden)', { timeout: 8000 });
  await sleepUntil(39.0);

  // Move to audio waveform canvas
  await smoothMoveTo(page, 750, 380);
  await sleepUntil(42.0);
}

async function recordAct4CallDialog(page) {
  console.log('🎬 Act 4: Live Call Audio & Waveform (42.0s - 57.0s)');
  // 42.0s - 50.5s: Agent speaks question
  // 50.5s - 57.0s: Venue answers "I think it should be working..."
  for (let i = 0; i < 5; i++) {
    await smoothMoveTo(page, 740 + (i % 2 === 0 ? 25 : -25), 380 + (i * 12));
    await sleep(2500);
  }
  await sleepUntil(57.0);
}

async function recordAct5VerdictAndFirewall(page) {
  console.log('🎬 Act 5: Deterministic Firewall & Verdict (57.0s - 81.5s)');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 15000 });
  
  // Focus on amber NOT FULLY VERIFIED banner
  await smoothMoveTo(page, 650, 200);
  await sleepUntil(68.5);

  // Move down to the Main Elevator card with safety demotion badge
  await smoothMoveTo(page, 650, 480);
  await sleepUntil(74.0);

  // Hover over the Deterministic Firewall callout box
  await smoothMoveTo(page, 650, 560);
  await sleepUntil(81.5);
}

async function recordAct6TechnicalDrawer(page) {
  console.log('🎬 Act 6: Technical Proof Drawer (81.5s - 92.0s)');
  // Click Inspect Proof Chain Drawer at 82.0s
  await clickElement(page, '#toggle-audit-btn');
  await sleepUntil(84.0);

  // Click Timeline
  await clickElement(page, 'button[data-tab="timeline"]');
  await sleepUntil(87.0);

  // Click CALL-E Schema
  await clickElement(page, 'button[data-tab="schema"]');
  await sleepUntil(89.5);

  // Click Raw JSON
  await clickElement(page, 'button[data-tab="raw"]');
  await sleepUntil(92.0);
}

async function recordAct7Scenario2AndOutro(page) {
  console.log('🎬 Act 7: Scenario 2 (100% Feasible) & Live Search (92.0s - 120.0s)');
  // Close drawer
  await clickElement(page, '#toggle-audit-btn');
  await sleepUntil(93.5);

  // Select Scenario 2 (Metropolitan Symphony Hall)
  await clickElement(page, '#scenarios-container button:nth-child(2)');
  await sleepUntil(95.0);
  await clickElement(page, '#btn-scan');
  await page.waitForSelector('#state-gap:not(.hidden)', { timeout: 8000 });
  await sleepUntil(97.0);
  await clickElement(page, '#btn-authorize');
  await page.waitForSelector('#state-brief:not(.hidden)', { timeout: 15000 });
  await sleepUntil(105.5); // Shows green FEASIBLE (100% VERIFIED)

  // Type custom place in search box to showcase live global search
  await humanType(page, '#venue-input', 'Royal Albert Hall');
  await sleepUntil(114.0);

  // Center cursor for final hold
  await smoothMoveTo(page, 720, 450);
  await sleepUntil(120.0);
}

// ----------------------------------------------------
// MAIN RECORDER ENTRYPOINT
// ----------------------------------------------------

async function run() {
  await ensureServerRunning();

  if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  }

  console.log('🎬 Launching 1080p Playwright Video Recording Session (120s Master Sync)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await injectVirtualCursor(page);

  scriptStartTime = Date.now();

  try {
    await recordAct1Hook(page);
    await recordAct2DigitalScan(page);
    await recordAct3GapIdentifiedAndConsent(page);
    await recordAct4CallDialog(page);
    await recordAct5VerdictAndFirewall(page);
    await recordAct6TechnicalDrawer(page);
    await recordAct7Scenario2AndOutro(page);
  } catch (err) {
    console.error('Recording error:', err);
  }

  const durationSec = ((Date.now() - scriptStartTime) / 1000).toFixed(1);
  console.log(`⏱️ Total Recorded Time: ${durationSec}s`);

  // Close page and context to flush video to disk
  await page.close();
  await context.close();
  await browser.close();

  // Find the newly recorded video file in RECORDINGS_DIR
  const files = fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.webm') && f !== 'opendoor_demo_1080p.webm');
  if (files.length === 0) {
    throw new Error('No new video file was written by Playwright');
  }

  files.sort((a, b) => {
    return fs.statSync(path.join(RECORDINGS_DIR, b)).mtimeMs - fs.statSync(path.join(RECORDINGS_DIR, a)).mtimeMs;
  });

  const latestVideo = path.join(RECORDINGS_DIR, files[0]);
  const finalVideo = path.join(RECORDINGS_DIR, 'opendoor_demo_1080p.webm');

  if (fs.existsSync(finalVideo)) fs.unlinkSync(finalVideo);
  fs.renameSync(latestVideo, finalVideo);

  const stat = fs.statSync(finalVideo);
  console.log(`🎉 1080p Demo Video successfully re-recorded with 120s master sync!`);
  console.log(`📁 File: ${finalVideo}`);
  console.log(`📦 Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`⏳ Duration: ${durationSec}s`);
}

run().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
