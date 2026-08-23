import { useProjectStore } from '@/store/useProjectStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaletteConfig, PaletteMode, SliceStyleMode } from '@/types/infographic';
import { useI18n } from '@/i18n';

function ColorInputPair({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{t(label)}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 px-1 py-1"
        />
        <Input
          type="text"
          aria-label={t(label)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

const PALETTE_CONTROLS: Record<PaletteMode, Array<{ key: keyof import('@/types/infographic').PaletteConfig; label: string }>> = {
  single: [{ key: 'singleColor', label: 'palette.baseColor' }],
  gradient: [
    { key: 'gradientStart', label: 'palette.startColor' },
    { key: 'gradientEnd', label: 'palette.endColor' },
  ],
  manual: [],
};

export function PalettePanel() {
  const { t } = useI18n();
  const palette = useProjectStore((state) => state.palette);
  const setPalette = useProjectStore((state) => state.setPalette);
  const sliceStyle = useProjectStore((state) => state.sliceStyle);
  const setSliceStyle = useProjectStore((state) => state.setSliceStyle);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label id="palette-mode-label" htmlFor="palette-mode">{t('palette.mode')}</Label>
        <Select
          value={palette.mode}
          onValueChange={(v) => setPalette({ mode: v as PaletteMode })}
        >
          <SelectTrigger id="palette-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">{t('palette.single')}</SelectItem>
            <SelectItem value="gradient">{t('palette.gradient')}</SelectItem>
            <SelectItem value="manual">{t('palette.manual')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {PALETTE_CONTROLS[palette.mode].map(({ key, label }) => (
        <ColorInputPair
          key={key as string}
          id={key as string}
          label={label}
          value={palette[key]}
          onChange={(value) => setPalette({ [key]: value } as Partial<PaletteConfig>)}
        />
      ))}

      {palette.mode === 'manual' && (
        <p className="text-sm text-muted-foreground">{t('palette.manualHint')}</p>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">{t('palette.sliceStyle')}</h4>
        <div className="flex items-center justify-between mb-3">
          <Label>{t('palette.fillMode')}</Label>
          <Select
            value={sliceStyle.fillMode}
            onValueChange={(v) => setSliceStyle({ fillMode: v as SliceStyleMode })}
          >
            <SelectTrigger className="w-[120px]" aria-label={t('palette.fillMode')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">{t('palette.solid')}</SelectItem>
              <SelectItem value="radial">{t('palette.radial')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sliceStyle.fillMode === 'radial' && (
          <div className="space-y-2">
            <Label id="gradient-intensity-label" htmlFor="gradient-intensity">
              {t('palette.gradientIntensity', { value: sliceStyle.gradientIntensity.toFixed(2) })}
            </Label>
            <Slider
              id="gradient-intensity"
              aria-labelledby="gradient-intensity-label"
              value={[sliceStyle.gradientIntensity]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([value]) => setSliceStyle({ gradientIntensity: value })}
            />
          </div>
        )}
      </div>
    </div>
  );
}