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
import { PaletteMode, SliceStyleMode } from '@/types/infographic';
import { useI18n } from '@/i18n';

export function PalettePanel() {
  const { t } = useI18n();
  const palette = useProjectStore((state) => state.palette);
  const setPalette = useProjectStore((state) => state.setPalette);
  const sliceStyle = useProjectStore((state) => state.sliceStyle);
  const setSliceStyle = useProjectStore((state) => state.setSliceStyle);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="palette-mode">{t('palette.mode')}</Label>
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

      {palette.mode === 'single' && (
        <div className="space-y-2">
          <Label htmlFor="single-color">{t('palette.baseColor')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="single-color"
              type="color"
              value={palette.singleColor}
              onChange={(e) => setPalette({ singleColor: e.target.value })}
              className="h-9 w-14 px-1 py-1"
            />
            <Input
              type="text"
              value={palette.singleColor}
              onChange={(e) => setPalette({ singleColor: e.target.value })}
            />
          </div>
        </div>
      )}

      {palette.mode === 'gradient' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gradient-start">{t('palette.startColor')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="gradient-start"
                type="color"
                value={palette.gradientStart}
                onChange={(e) => setPalette({ gradientStart: e.target.value })}
                className="h-9 w-14 px-1 py-1"
              />
              <Input
                type="text"
                value={palette.gradientStart}
                onChange={(e) => setPalette({ gradientStart: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradient-end">{t('palette.endColor')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="gradient-end"
                type="color"
                value={palette.gradientEnd}
                onChange={(e) => setPalette({ gradientEnd: e.target.value })}
                className="h-9 w-14 px-1 py-1"
              />
              <Input
                type="text"
                value={palette.gradientEnd}
                onChange={(e) => setPalette({ gradientEnd: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {palette.mode === 'manual' && (
        <p className="text-sm text-muted-foreground">
          {t('palette.manualHint')}
        </p>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">Slice Style</h4>
        <div className="flex items-center justify-between mb-3">
          <Label>Fill Mode</Label>
          <Select
            value={sliceStyle.fillMode}
            onValueChange={(v) => setSliceStyle({ fillMode: v as SliceStyleMode })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sliceStyle.fillMode === 'radial' && (
          <div className="space-y-2">
            <Label htmlFor="gradient-intensity">
              Gradient Intensity: {sliceStyle.gradientIntensity.toFixed(2)}
            </Label>
            <Slider
              id="gradient-intensity"
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
