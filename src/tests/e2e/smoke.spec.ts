import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.describe('Radial Infographic Generator smoke flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders default infographic', async ({ page }) => {
    const canvas = page.locator('#radial-canvas');
    await expect(canvas).toBeVisible();
    // One filled wedge path per slice (clipPath and icon internals excluded by direct-child selector).
    await expect(canvas.locator('g > path')).toHaveCount(8);
    await expect(canvas.locator('text').filter({ hasText: /./ }).first()).toBeVisible();

    // Regression guard: text must actually be painted, not just present in the DOM.
    const bbox = await canvas.boundingBox();
    expect(bbox).not.toBeNull();
    if (bbox) {
      const buffer = await page.screenshot({ clip: bbox });
      // A minimal pixel-count check: the canvas contains non-wedge colors (white text).
      const stats = await page.evaluate(async (imageBase64) => {
        const canvasEl = document.createElement('canvas');
        const ctx = canvasEl.getContext('2d');
        if (!ctx) return { white: 0, total: 0 };
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = imageBase64;
        });
        canvasEl.width = img.width;
        canvasEl.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
        let white = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) white++;
        }
        return { white, total: data.length / 4 };
      }, `data:image/png;base64,${buffer.toString('base64')}`);
      expect(stats.white).toBeGreaterThan(50);
    }
  });

  test('switches aspect ratios and keeps center wheel circular', async ({ page }) => {
    await page.getByRole('tab', { name: 'Canvas' }).click();
    await page.getByRole('combobox', { name: 'Aspect Ratio' }).click();
    await page.getByRole('option', { name: '16:9' }).click();

    const canvas = page.locator('#radial-canvas');
    await expect(canvas).toBeVisible();

    const bbox = await canvas.boundingBox();
    expect(bbox).not.toBeNull();
    if (bbox) {
      expect(bbox.width).toBeGreaterThan(bbox.height);
    }

    // Center text should remain visible after layout change.
    await expect(canvas.getByText('EVERY')).toBeVisible();
    await expect(canvas.getByText('MINUTE')).toBeVisible();
  });

  test('undo and redo restore edited typography', async ({ page }) => {
    // Open the Type tab (lazy-loaded panel) and focus the icon-size slider.
    await page.getByRole('tab', { name: 'Type' }).click();
    const slider = page.getByRole('slider', { name: 'Icon Size' });
    await slider.focus();
    const before = Number(await slider.getAttribute('aria-valuenow'));

    // Arrow right bumps the value by the step (4).
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before + 4));

    // Keyboard shortcuts: Ctrl+Z undoes, Ctrl+Shift+Z redoes.
    await page.keyboard.press('Control+z');
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before));
    await page.keyboard.press('Control+Shift+z');
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before + 4));

    // Toolbar buttons too.
    await page.getByLabel('Undo').click();
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before));
    await page.getByLabel('Redo').click();
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before + 4));
  });

  test('exports SVG', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'SVG' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('infographic.svg');
  });

  test('exports PNG', async ({ page }) => {
    await page.getByRole('combobox', { name: 'PNG resolution' }).click();
    await page.getByRole('option', { name: /2x/ }).click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PNG' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('infographic-2x.png');

    // Raster fidelity guard: the 2x export of the default 1080x1080 project
    // must be a 2160x2160 PNG. PNG dimensions live in the IHDR chunk
    // (bytes 16-23, big-endian) — no image library needed.
    const buffer = readFileSync((await download.path()) as string);
    // The PNG magic header (0x89 'PNG' CR LF 0x1A LF) — compare raw bytes
    // because Node's 'ascii' encoding masks 0x89 down to 0x09.
    expect([...buffer.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    expect([width, height]).toEqual([2160, 2160]);

    // Social preset must target 1080px on the short edge regardless of the
    // preview scale in the UI.
    await page.getByRole('combobox', { name: 'PNG resolution' }).click();
    await page.getByRole('option', { name: /Social/ }).click();
    const [socialDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PNG' }).click(),
    ]);
    const socialBuffer = readFileSync((await socialDownload.path()) as string);
    expect([socialBuffer.readUInt32BE(16), socialBuffer.readUInt32BE(20)]).toEqual([1080, 1080]);
  });
});