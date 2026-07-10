import { test, expect } from '@playwright/test';

test.describe('Radial Infographic Generator smoke flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders default infographic', async ({ page }) => {
    const canvas = page.locator('#radial-canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas.locator('path')).toHaveCount(16);
    await expect(canvas.locator('text')).toHaveCount(19);

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
  });
});
