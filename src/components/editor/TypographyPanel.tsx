import { useProjectStore } from '@/store/useProjectStore';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, RotateCcw } from 'lucide-react';
import { GOOGLE_FONT_OPTIONS } from '@/types/infographic';
import { useI18n } from '@/i18n';

export function TypographyPanel() {
  const { t } = useI18n();
  const typography = useProjectStore((state) => state.typography);
  const setTypography = useProjectStore((state) => state.setTypography);
  const resetIconSettings = useProjectStore((state) => state.resetIconSettings);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label id="metric-font-label" htmlFor="metric-font">{t('typography.metricFont')}</Label>
          <Select
            value={typography.metricFont}
            onValueChange={(v) => setTypography({ metricFont: v })}
          >
            <SelectTrigger id="metric-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label id="label-font-label" htmlFor="label-font">{t('typography.labelFont')}</Label>
          <Select
            value={typography.labelFont}
            onValueChange={(v) => setTypography({ labelFont: v })}
          >
            <SelectTrigger id="label-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label id="metric-font-weight-label" htmlFor="metric-font-weight">
          {t('typography.metricWeight', { value: typography.metricFontWeight ?? 700 })}
        </Label>
        <Slider
          id="metric-font-weight"
          aria-labelledby="metric-font-weight-label"
          value={[typography.metricFontWeight ?? 700]}
          min={400}
          max={900}
          step={100}
          onValueChange={([value]) => setTypography({ metricFontWeight: value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label id="rotate-text-label" htmlFor="rotate-text">{t('typography.rotateText')}</Label>
        <Switch
          id="rotate-text"
          checked={typography.rotateText ?? false}
          onCheckedChange={(checked) => setTypography({ rotateText: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('typography.textAlign')}</Label>
        <ToggleGroup
          type="single"
          value={typography.textAlign ?? 'middle'}
          onValueChange={(value) => {
            if (value) setTypography({ textAlign: value as 'start' | 'middle' | 'end' });
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="start" aria-label={t('typography.alignLeft')}>
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="middle" aria-label={t('typography.alignCenter')}>
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="end" aria-label={t('typography.alignRight')}>
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between">
        <Label id="show-icons-label" htmlFor="show-icons">{t('typography.showIcons')}</Label>
        <Switch
          id="show-icons"
          checked={typography.showIcons}
          onCheckedChange={(checked) => setTypography({ showIcons: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>{t('typography.iconPlacement')}</Label>
        <Select
          value={typography.iconPlacement ?? 'outer'}
          onValueChange={(v) => setTypography({ iconPlacement: v as 'inner' | 'outer' })}
        >
          <SelectTrigger className="w-[120px]" aria-label={t('typography.iconPlacement')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inner">{t('typography.inner')}</SelectItem>
            <SelectItem value="outer">{t('typography.outer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label id="metric-label-gap-label" htmlFor="metric-label-gap">
          {t('typography.metricLabelGap')}
        </Label>
        <Slider
          id="metric-label-gap"
          aria-labelledby="metric-label-gap-label"
          value={[typography.metricLabelGap]}
          min={0.05}
          max={0.8}
          step={0.01}
          onValueChange={([value]) => setTypography({ metricLabelGap: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {typography.metricLabelGap.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        <Label id="icon-size-label" htmlFor="icon-size">{t('typography.iconSize')}</Label>
        <Slider
          id="icon-size"
          aria-labelledby="icon-size-label"
          value={[typography.iconSize]}
          min={16}
          max={96}
          step={4}
          onValueChange={([value]) => setTypography({ iconSize: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {typography.iconSize}px
        </div>
      </div>

      <div className="space-y-2">
        <Label id="icon-vertical-position-label" htmlFor="icon-vertical-position">
          {t('typography.iconOffset', { value: typography.iconVerticalPosition.toFixed(2) })}
        </Label>
        <Slider
          id="icon-vertical-position"
          aria-labelledby="icon-vertical-position-label"
          value={[typography.iconVerticalPosition]}
          min={0.32}
          max={1.32}
          step={0.01}
          onValueChange={([value]) => setTypography({ iconVerticalPosition: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {t('typography.iconOffsetHint')}
        </div>
      </div>

      <div className="space-y-2">
        <Label id="icon-margin-label" htmlFor="icon-margin">
          {t('typography.iconMargin', { value: typography.iconMargin })}
        </Label>
        <Slider
          id="icon-margin"
          aria-labelledby="icon-margin-label"
          value={[typography.iconMargin]}
          min={0}
          max={50}
          step={1}
          onValueChange={([value]) => setTypography({ iconMargin: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {t('typography.iconMarginHint')}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={resetIconSettings}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        {t('typography.resetIconSettings')}
      </Button>
    </div>
  );
}