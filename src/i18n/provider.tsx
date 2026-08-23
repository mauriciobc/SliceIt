import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  I18nContext,
  getLocale,
  setLocale,
  subscribeLocaleChange,
  translateWith,
  type I18nContextValue,
} from './runtime';
import type { Locale } from './translations';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => subscribeLocaleChange(() => setLocaleState(getLocale())), []);

  // Keep the document language in sync so screen readers pronounce the UI
  // with the right locale.
  useEffect(() => {
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    document.title =
      locale === 'pt-BR'
        ? 'SliceIt \u2014 Gerador de Infogr\u00E1ficos Radiais'
        : 'SliceIt \u2014 Radial Infographic Generator';
  }, [locale]);

  const handleSetLocale = useCallback((next: Locale) => {
    setLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: translateWith(locale),
    }),
    [locale, handleSetLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}