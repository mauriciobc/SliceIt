import { test, expect } from '@playwright/test';

test.describe('locale-aware default infographic', () => {
  test('selecting PT-BR swaps the default example to Brazilian data', async ({ page }) => {
    await page.goto('/');

    // English default first.
    const canvas = page.locator('#radial-canvas');
    await expect(canvas.getByText('EVERY')).toBeVisible();
    await expect(canvas.getByText('MINUTE')).toBeVisible();
    await expect(page.getByRole('button', { name: 'API CALLS PROCESSED' })).toBeVisible();

    // Switch the app language to PT-BR.
    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();

    // The pristine default project now shows the Brazilian example.
    await expect(canvas.getByText('BRASIL', { exact: true })).toBeVisible();
    await expect(canvas.getByText('EM NÚMEROS')).toBeVisible();
    await expect(page.getByRole('button', { name: 'POPULAÇÃO' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'TÍTULOS DA COPA' })).toBeVisible();
    await expect(page.getByText('Fonte: dados de exemplo do SliceIt')).toBeVisible();
  });

  test('switching back to English restores the English example', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();
    await expect(page.locator('#radial-canvas').getByText('BRASIL', { exact: true })).toBeVisible();

    // The combobox label is now localized too.
    await page.getByRole('combobox', { name: 'Idioma' }).click();
    await page.getByRole('option', { name: 'English' }).click();

    const canvas = page.locator('#radial-canvas');
    await expect(canvas.getByText('EVERY')).toBeVisible();
    await expect(page.getByRole('button', { name: 'API CALLS PROCESSED' })).toBeVisible();
  });

  test('locale switch never clobbers user edits', async ({ page }) => {
    await page.goto('/');

    // Rename the first slice and pick a custom center title.
    await page.getByRole('button', { name: 'API CALLS PROCESSED' }).click();
    await page.locator('#slice-label').fill('MEU DADO CUSTOM');

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Português (BR)' }).click();

    // The edited label survives the language switch.
    await expect(page.getByRole('button', { name: 'MEU DADO CUSTOM' })).toBeVisible();
  });
});