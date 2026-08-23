import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconPicker } from '@/components/editor/IconPicker';
import { I18nProvider } from '@/i18n';

describe('IconPicker', () => {
  afterEach(() => cleanup());

  function setup() {
    const onSelectBuiltin = vi.fn();
    const onSelectUploaded = vi.fn();
    const onUpload = vi.fn();
    render(
      <I18nProvider>
        <IconPicker
          value="Globe"
          uploadedValue={undefined}
          uploadedIcons={[]}
          onSelectBuiltin={onSelectBuiltin}
          onSelectUploaded={onSelectUploaded}
          onUpload={onUpload}
        />
      </I18nProvider>
    );
    return { onSelectBuiltin, onSelectUploaded, onUpload };
  }

  it('opens and searches the icon grid', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Globe' }));
    const search = await screen.findByPlaceholderText(/search icons/i);
    await userEvent.type(search, 'globe');
    // Search is case-insensitive substring over 268 icons.
    expect(screen.getByTitle('Globe')).toBeTruthy();
  });

  it('moves focus with arrow keys across the grid', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Globe' }));
    // Locate the results grid (inside the popover) and its icon buttons.
    const grid = document.querySelector('.grid.max-h-56') as HTMLElement;
    expect(grid).toBeTruthy();
    const buttons = Array.from(grid.querySelectorAll('button[type="button"]')) as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(100);

    buttons[5].focus();
    expect(document.activeElement).toBe(buttons[5]);

    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[6]);
    fireEvent.keyDown(grid, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[14]);
    fireEvent.keyDown(grid, { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(grid, { key: 'End' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });

  it('clamps navigation at the grid edges', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Globe' }));
    const grid = document.querySelector('.grid.max-h-56') as HTMLElement;
    const buttons = Array.from(grid.querySelectorAll('button[type="button"]')) as HTMLButtonElement[];

    buttons[0].focus();
    fireEvent.keyDown(grid, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[0]);

    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  });
});