import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

export function AppStatusBar() {
  const { t } = useI18n();
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
        <div aria-live="polite" className="flex items-center gap-3">
          {errors.map((error) => (
            <span key={error.key} className="text-destructive">
              {t(error.key, error.params)}
            </span>
          ))}
          {warnings.map((warning) => (
            <span key={warning.key} className="text-amber-600">
              {t(warning.key, warning.params)}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4">
        <span className="hidden text-muted-foreground md:inline">
          {t('statusBar.shortcuts')}
        </span>
        <span className="text-muted-foreground">{t('statusBar.ready')}</span>
      </div>
    </footer>
  );
}