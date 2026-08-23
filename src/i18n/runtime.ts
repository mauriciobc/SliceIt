import { createContext, useContext } from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  translations,
  type Locale,
  type TranslationParams,
} from './translations';

export type TranslateFn = (key: string, params?: TranslationParams) => string;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

function resolve(key: string, locale: Locale): string {
  const resource = translations[locale];
  if (resource[key] !== undefined) return resource[key];
  if (translations[DEFAULT_LOCALE][key] !== undefined) {
    return translations[DEFAULT_LOCALE][key];
  }
  return key;
}

export function translateWith(locale: Locale): TranslateFn {
  return (key, params) => interpolate(resolve(key, locale), params);
}

let currentLocale: Locale = DEFAULT_LOCALE;
const subscribers = new Set<() => void>();

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
    return stored as Locale;
  }
  return DEFAULT_LOCALE;
}

currentLocale = getInitialLocale();

export function setLocale(locale: Locale): void {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
  subscribers.forEach((fn) => fn());
}

export function getLocale(): Locale {
  return currentLocale;
}

export function subscribeLocaleChange(cb: () => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

export const t: TranslateFn = (key, params) =>
  translateWith(currentLocale)(key, params);

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
