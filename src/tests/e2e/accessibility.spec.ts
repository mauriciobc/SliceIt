import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SERIOUS = ['critical', 'serious'];

async function seriousViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((v) => SERIOUS.includes(v.impact ?? ''))
    .map((v) => v.id);
}

test.describe('accessibility', () => {
  test('initial app shell has no critical or serious violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Slices' })).toBeVisible();
    const ids = await seriousViolations(page);
    expect(ids).toEqual([]);
  });

  test('every editor tab scans clean', async ({ page }) => {
    await page.goto('/');
    for (const tab of ['Canvas', 'Palette', 'Center', 'Type']) {
      await page.getByRole('tab', { name: tab }).click();
      await page.waitForTimeout(250);
      const ids = await seriousViolations(page);
      expect(ids, tab).toEqual([]);
    }
  });

  test('icon picker popover scans clean', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'API CALLS PROCESSED' }).click();
    // Trigger shows the default Globe icon for the first slice.
    const trigger = page.getByRole('button', { name: 'Globe' });
    await trigger.click();
    await expect(page.getByPlaceholder(/search icons/i)).toBeVisible();
    const ids = await seriousViolations(page);
    expect(ids).toEqual([]);
  });
});
