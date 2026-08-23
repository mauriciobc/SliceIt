import { useI18n } from '@/i18n';
import { SUPPORTED_LOCALES, type Locale } from '@/i18n/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Languages, Maximize2, Minimize2, Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AppHeaderProps {
  focusMode?: boolean;
  onToggleFocus?: () => void;
}

export function AppHeader({ focusMode = false, onToggleFocus }: AppHeaderProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const handleChange = (value: string) => setLocale(value as Locale);

  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');
  const mod = isMac ? '\u2318' : 'Ctrl';
  const shortcuts: Array<{ keys: string; label: string }> = [
    { keys: mod + '+Z', label: t('shortcuts.undo') },
    { keys: mod + '+Shift+Z / ' + mod + '+Y', label: t('shortcuts.redo') },
    { keys: mod + '+S', label: t('shortcuts.save') },
    { keys: mod + '+O', label: t('shortcuts.open') },
  ];

  return (
    <header className="flex h-14 items-center border-b border-border bg-card px-4 shadow-sm">
      <h1 className="text-lg font-semibold tracking-tight">SliceIt</h1>
      <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
        {t('header.subtitle')}
      </span>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {onToggleFocus && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFocus}
            aria-label={focusMode ? t('focus.exit') : t('focus.enter')}
            title={focusMode ? t('focus.exit') : t('focus.enter')}
          >
            {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('shortcuts.title')}
              title={t('shortcuts.title')}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" aria-label={t('shortcuts.title')} align="end">
            <h2 className="mb-3 text-sm font-semibold">{t('shortcuts.title')}</h2>
            <ul className="space-y-2">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{shortcut.label}</span>
                  <span className="flex flex-wrap items-center justify-end gap-1">
                    {shortcut.keys.split(' / ').map((combo) => (
                      <kbd
                        key={combo}
                        className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]"
                      >
                        {combo}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={
            theme === 'light'
              ? t('theme.switchToDark')
              : theme === 'dark'
                ? t('theme.switchToSystem')
                : t('theme.switchToLight')
          }
          title={
            theme === 'light'
              ? t('theme.switchToDark')
              : theme === 'dark'
                ? t('theme.switchToSystem')
                : t('theme.switchToLight')
          }
        >
          {theme === 'light' ? (
            <Sun className="h-4 w-4" />
          ) : theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
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