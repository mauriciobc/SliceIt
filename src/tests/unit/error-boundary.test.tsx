import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ErrorBoundary } from '@/components/app/ErrorBoundary';
import { I18nProvider } from '@/i18n';

function Bomb(): never {
  throw new Error('boom');
}

function Stable() {
  return <div>stable content</div>;
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Stable />
      </ErrorBoundary>
    );
    expect(screen.getByText('stable content')).toBeTruthy();
  });

  it('shows a friendly fallback when a child throws', () => {
    // Silence the expected console.error from componentDidCatch.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <I18nProvider>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </I18nProvider>
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload app' })).toBeTruthy();
  });
});
