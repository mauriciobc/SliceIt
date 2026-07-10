import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';

export function AppStatusBar() {
  const warnings = useProjectStore((state) => state.warnings);
  const errors = useProjectStore((state) => state.errors);

  const hasMessages = warnings.length > 0 || errors.length > 0;

  return (
    <footer
      className={cn(
        'flex h-8 items-center gap-4 border-t border-border bg-card px-4 text-xs',
        hasMessages ? 'justify-between' : 'justify-end'
      )}
    >
      {hasMessages && (
        <div className="flex items-center gap-3">
          {errors.map((error) => (
            <span key={error} className="text-destructive">
              {error}
            </span>
          ))}
          {warnings.map((warning) => (
            <span key={warning} className="text-amber-600">
              {warning}
            </span>
          ))}
        </div>
      )}
      <span className="text-muted-foreground">Ready</span>
    </footer>
  );
}
