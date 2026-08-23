import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = process.argv[2] ?? 'gauntlet/out/ratios-baseline';
const port = 5201;
const absOut = resolve(root, outDir);
mkdirSync(absOut, { recursive: true });

const RATIOS = [
  { label: '1-1', name: '1:1', width: 1080, height: 1080 },
  { label: '4-5', name: '4:5', width: 1080, height: 1350 },
  { label: '16-9', name: '16:9', width: 1920, height: 1080 },
  { label: '9-16', name: '9:16', width: 1080, height: 1920 },
  { label: '4-3', name: '4:3', width: 1600, height: 1200 },
];

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolveWait, rejectWait) => {
    const tick = async () => {
      try { const r = await fetch(url); if (r.ok) return resolveWait(); } catch {}
      if (Date.now() - start > timeoutMs) return rejectWait(new Error('timeout'));
      setTimeout(tick, 400);
    };
    tick();
  });
}

const server = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });

try {
  await waitForServer(`http://localhost:${port}/`);
  for (const r of RATIOS) {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: Math.max(1800, r.width + 500), height: Math.max(1100, r.height + 300) },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}/`);
    await page.waitForSelector('#radial-canvas');
    await page.evaluate(() => document.fonts.ready);
    // switch ratio via UI
    await page.getByRole('tab', { name: 'Canvas' }).click();
    const combo = page.getByRole('combobox', { name: 'Aspect Ratio' });
    await combo.click();
    await page.getByRole('option', { name: r.name, exact: true }).click();
    await page.waitForTimeout(900);
    await page.evaluate(() => document.fonts.ready);
    const canvas = page.locator('#radial-canvas');
    await canvas.waitFor();
    const bbox = await canvas.boundingBox();
    if (bbox) {
      await page.screenshot({ path: `${absOut}/${r.label}.png`, clip: bbox });
      console.log(`captured ${r.label} ${r.width}x${r.height} bbox=${Math.round(bbox.width)}x${Math.round(bbox.height)}`);
    } else {
      console.log(`no bbox for ${r.label}`);
    }
    await browser.close();
  }
} finally {
  server.kill('SIGTERM');
}
