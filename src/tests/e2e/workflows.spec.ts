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


test.describe('focus mode and feedback', () => {
  test('focus mode hides the editor and restores it', async ({ page }) => {
    await page.goto('/');
    const editor = page.locator('aside');
    await expect(editor).toBeVisible();

    await page.getByRole('button', { name: 'Enter focus mode' }).click();
    await expect(editor).not.toBeVisible();
    // The canvas section now spans the full viewport width.
    const section = await page.locator('main section').boundingBox();
    expect(section!.width).toBeGreaterThan(1100);

    await page.getByRole('button', { name: 'Exit focus mode' }).click();
    await expect(editor).toBeVisible();
  });

  test('exporting shows a transient confirmation toast', async ({ page }) => {
    await page.goto('/');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'SVG' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('infographic.svg');

    const toast = page.getByRole('status');
    await expect(toast).toContainText('Export downloaded');
    // Auto-dismisses after ~3s.
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });
});


test.describe('locale-aware starter project', () => {
  test('switching locale swaps the untouched starter project', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#radial-canvas').getByText('EVERY')).toBeVisible();

    await page.locator('header').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();
    // Center title swaps to the Brazilian starter; 'BRASIL' also appears inside
    // a slice label, so target the exact center text with .first().
    await expect(
      page.locator('#radial-canvas').getByText('BRASIL', { exact: true }).first()
    ).toBeVisible();
    await expect(page.locator('#radial-canvas').getByText(/203/)).toBeVisible();

    // Switching back restores the English starter (both directions swap).
    await page.locator('header').getByRole('combobox').click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(page.locator('#radial-canvas').getByText('EVERY')).toBeVisible();
  });

  test('edited projects are never clobbered by language switches', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'API CALLS PROCESSED' }).click();
    await page.locator('#slice-label').fill('CUSTOM LABEL');

    await page.locator('header').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();

    // Edited content survives: the custom label stays and the EN starter is
    // intentionally NOT swapped.
    await expect(page.locator('#radial-canvas').getByText(/CUSTOM/)).toBeVisible();
    await expect(page.locator('#radial-canvas').getByText('EVERY')).toBeVisible();
  });
});


test.describe('keyboard shortcuts reference', () => {
  test('help popover lists the shortcuts and is localized', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('SliceIt \u2014 Radial Infographic Generator');

    await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
    const popover = page.getByRole('dialog');
    await expect(popover).toBeVisible();

    // The popover is named and shows the undo shortcut.
    await expect(popover).toHaveAttribute('aria-label', 'Keyboard shortcuts');
    await expect(popover.getByText('Undo')).toBeVisible();
    await expect(popover.getByText('Ctrl+Z')).toBeVisible();

    // Switching language localizes title + popover (combo stays platform-bound).
    await page.locator('header').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();
    await expect(page).toHaveTitle('SliceIt \u2014 Gerador de Infogr\u00E1ficos Radiais');
    await expect(page.getByRole('button', { name: 'Atalhos de teclado' })).toBeVisible();
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