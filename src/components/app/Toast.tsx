import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { dismissToast, subscribeToast } from '@/lib/toast';
import { useI18n } from '@/i18n';

const AUTO_DISMISS_MS = 3000;

export function Toast() {
  const { t } = useI18n();
  const [messageKey, setMessageKey] = useState<string | null>(() => {
    // Pick up a message that was raised before this component mounted.
    let initial: string | null = null;
    subscribeToast((key) => {
      initial = key;
    })();
    return initial;
  });

  useEffect(() => subscribeToast(setMessageKey), []);
  useEffect(() => dismissToast, []);

  useEffect(() => {
    if (!messageKey) return;
    const timer = setTimeout(dismissToast, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [messageKey]);

  if (!messageKey) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-popover px-4 py-2 text-sm text-popover-foreground shadow-lg"
    >
      <span>{t(messageKey)}</span>
      <button
        type="button"
        onClick={dismissToast}
        aria-label={t('toast.dismiss')}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}