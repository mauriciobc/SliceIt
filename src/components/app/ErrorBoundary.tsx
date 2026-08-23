import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function ErrorFallback({ onReload }: { onReload: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-base font-semibold">{t('error.title')}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{t('error.message')}</p>
      <Button variant="outline" size="sm" onClick={onReload}>
        {t('error.reload')}
      </Button>
    </div>
  );
}

/**
 * Last-resort boundary: a rendering crash anywhere below it shows a friendly
 * fallback instead of a blank screen. The project data lives in the Zustand
 * store (not in the DOM), so a reload loses nothing except the failed frame.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private readonly handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return <ErrorFallback onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}
