import { test } from '@playwright/test';

test('visual 1:1 rotate ON', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Type' }).click();
  await page.getByLabel('Rotate Text Radially').click();
  await page.waitForTimeout(600);
  const canvas = page.locator('#radial-canvas');
  const bbox = await canvas.boundingBox();
  if (!bbox) throw new Error('Canvas bbox not found');
  await page.screenshot({ path: '/tmp/opencode/visual-1to1.png', clip: bbox });
});

test('visual 16:9 rotate ON', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Type' }).click();
  await page.getByLabel('Rotate Text Radially').click();
  await page.getByRole('tab', { name: 'Canvas' }).click();
  await page.getByRole('combobox', { name: 'Aspect Ratio' }).click();
  await page.getByRole('option', { name: '16:9' }).click();
  await page.waitForTimeout(600);
  const canvas = page.locator('#radial-canvas');
  const bbox = await canvas.boundingBox();
  if (!bbox) throw new Error('Canvas bbox not found');
  await page.screenshot({ path: '/tmp/opencode/visual-169.png', clip: bbox });
});
