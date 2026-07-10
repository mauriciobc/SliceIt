import { useI18n } from '@/i18n';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

export function AppHeader() {
  const { t, locale, setLocale } = useI18n();

  const handleChange = (value: string) => setLocale(value as Locale);

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-4 shadow-sm">
      <h1 className="text-lg font-semibold tracking-tight">SliceIt</h1>
      <span className="ml-2 text-xs text-muted-foreground">
        {t('header.subtitle')}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <Select value={locale} onValueChange={handleChange}>
          <SelectTrigger className="h-8 w-[150px]" aria-label={t('language.label')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LOCALES.map((code) => (
              <SelectItem key={code} value={code}>
                {t(`language.${code === 'en' ? 'en' : 'ptBR'}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
