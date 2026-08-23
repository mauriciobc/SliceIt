import { useI18n } from '@/i18n';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export function AppHeader() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (value: string) => setLocale(value as Locale);

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-4 shadow-sm">
      <h1 className="text-lg font-semibold tracking-tight">SliceIt</h1>
      <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
        {t('header.subtitle')}
      </span>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={t(theme === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark')}
          title={t(theme === 'dark' ? 'theme.switchToLight' : 'theme.switchToDark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Languages className="h-4 w-4 text-muted-foreground" />
        <Select value={locale} onValueChange={handleChange}>
          <SelectTrigger className="h-8 w-[118px] sm:w-[150px]" aria-label={t('language.label')}>
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