import { test, expect } from '@playwright/test';

test.describe('data workflows', () => {
  test('imports slices from a CSV file', async ({ page }) => {
    await page.goto('/');
    const csv = 'metric,label,color\n42,CSV ROW ONE,#ff0000\n7,CSV ROW TWO,#00ff00\n';
    await page.setInputFiles('#import-file', {
      name: 'slices.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });

    await expect(page.getByText('2 slices')).toBeVisible();
    // Both labels land on the canvas.
    const canvas = page.locator('#radial-canvas');
    await expect(canvas.getByText('CSV ROW ONE')).toBeVisible();
    await expect(canvas.getByText('CSV ROW TWO')).toBeVisible();
  });

  test('save then load restores edited content (round-trip fidelity)', async ({ page }) => {
    await page.goto('/');
    // Select the first slice and rename it.
    await page.getByRole('button', { name: 'API CALLS PROCESSED' }).click();
    const labelInput = page.locator('#slice-label');
    await labelInput.fill('ZEBRA ROUND TRIP');

    // Save the project and grab the downloaded file.
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Save' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('sliceit-project.json');
    const savedPath = await download.path();
    expect(savedPath).toBeTruthy();

    // Overwrite the label so we can prove the load actually restores state.
    await labelInput.fill('ALPHA AFTER EDIT');

    // Load the previously saved file back.
    await page.setInputFiles('#load-project', savedPath as string);

    // The restored project re-renders with the saved label. Labels render
    // through the text-fitting pipeline (uppercase, spacing collapsed), so
    // match the label substring on the canvas and the exact label in the UI.
    await expect(page.locator('#radial-canvas').getByText(/ZEBRA/)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'ZEBRA ROUND TRIP' })
    ).toBeVisible();
  });
});


test.describe('theme', () => {
  test('theme cycles system -> light -> dark and persists', async ({ page }) => {
    await page.goto('/');
    // A fresh context has no stored preference -> system mode (resolves to
    // light under Playwright's default color scheme).
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('sliceit:theme'))).toBe('light');

    // light -> dark
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Persisted across reloads via the pre-paint FOUC guard + useTheme.
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // dark -> system (resolves back to light here)
    await page.getByRole('button', { name: 'Switch to system theme' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('sliceit:theme'))).toBe('system');

    // system -> light
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    expect(await page.evaluate(() => localStorage.getItem('sliceit:theme'))).toBe('light');
  });

});


test.describe('popover behaviour', () => {
  test('icon picker closes on Escape and returns focus to the trigger', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'API CALLS PROCESSED' }).click();
    const trigger = page.getByRole('button', { name: 'Globe' });
    await trigger.click();
    const search = page.getByPlaceholder(/search icons/i);
    await expect(search).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(search).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
});

test.describe('mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('canvas and editors stay usable on a phone viewport', async ({ page }) => {
    await page.goto('/');

    // Canvas is laid out below the editor and keeps a real size.
    const canvas = page.locator('#radial-canvas');
    await expect(canvas).toBeVisible();
    const bbox = await canvas.boundingBox();
    expect(bbox).not.toBeNull();
    expect(bbox!.width).toBeGreaterThan(200);
    expect(bbox!.height).toBeGreaterThan(200);

    // Open the lazy Type tab and adjust a slider (proves the editor works there).
    await page.getByRole('tab', { name: 'Type' }).click();
    const slider = page.getByRole('slider', { name: 'Icon Size' });
    await slider.focus();
    const before = Number(await slider.getAttribute('aria-valuenow'));
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'))
      .toBe(String(before + 4));

    // Export actions remain reachable (footer wraps instead of overflowing).
    await expect(page.getByRole('button', { name: 'PNG' })).toBeVisible();
  });
});