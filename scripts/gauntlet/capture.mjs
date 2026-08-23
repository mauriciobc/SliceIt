import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = process.argv[2] ?? 'gauntlet/out';
const port = 5199;
const absOut = resolve(root, outDir);
mkdirSync(absOut, { recursive: true });

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolveWait, rejectWait) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolveWait();
      } catch {}
      if (Date.now() - start > timeoutMs) return rejectWait(new Error('dev server timeout'));
      setTimeout(tick, 300);
    };
    tick();
  });
}

const server = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
  detached: false,
});

try {
  await waitForServer(`http://localhost:${port}/`);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1680, height: 1050 },
    deviceScaleFactor: 2,
  });
  await page.goto(`http://localhost:${port}/`);
  await page.waitForSelector('#radial-canvas');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const canvas = page.locator('#radial-canvas');
  const bbox = await canvas.boundingBox();
  await page.screenshot({ path: `${absOut}/render.png`, clip: bbox });

  const svgMarkup = await page.evaluate(() => {
    const svg = document.getElementById('radial-canvas');
    return svg ? svg.outerHTML : '';
  });
  writeFileSync(`${absOut}/render.svg`, svgMarkup);

  // Full app shell for UX-context judging (optional, cheap).
  await page.screenshot({ path: `${absOut}/app-shell.png` });

  await browser.close();
  console.log(`captured -> ${absOut}`);
} finally {
  server.kill('SIGTERM');
}
