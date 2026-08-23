import { useProjectStore } from '@/store/useProjectStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AspectRatioPreset, ASPECT_RATIOS } from '@/types/infographic';
import { useI18n } from '@/i18n';

const ASPECT_RATIO_KEYS = Object.keys(ASPECT_RATIOS) as AspectRatioPreset[];

export function CanvasPanel() {
  const { t } = useI18n();
  const canvas = useProjectStore((state) => state.canvas);
  const setCanvas = useProjectStore((state) => state.setCanvas);
  const setAspectRatio = useProjectStore((state) => state.setAspectRatio);
  const setCustomDimensions = useProjectStore((state) => state.setCustomDimensions);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label id="aspect-ratio-label" htmlFor="aspect-ratio">{t('canvas.aspectRatio')}</Label>
        <Select value={canvas.aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatioPreset)}>
          <SelectTrigger id="aspect-ratio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIO_KEYS.map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label id="canvas-width-label" htmlFor="canvas-width">{t('canvas.width')}</Label>
          <Input
            id="canvas-width"
            type="number"
            min={100}
            value={canvas.dimensions.width}
            onChange={(e) =>
              setCustomDimensions({
                ...canvas.dimensions,
                width: Math.max(100, Number(e.target.value)),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label id="canvas-height-label" htmlFor="canvas-height">{t('canvas.height')}</Label>
          <Input
            id="canvas-height"
            type="number"
            min={100}
            value={canvas.dimensions.height}
            onChange={(e) =>
              setCustomDimensions({
                ...canvas.dimensions,
                height: Math.max(100, Number(e.target.value)),
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label id="bg-color-label" htmlFor="bg-color">{t('canvas.backgroundColor')}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="bg-color"
            type="color"
            value={canvas.backgroundColor}
            onChange={(e) => setCanvas({ backgroundColor: e.target.value })}
            className="h-9 w-14 px-1 py-1"
          />
          <Input
            type="text"
            aria-label={t('canvas.backgroundColor')}
            value={canvas.backgroundColor}
            onChange={(e) => setCanvas({ backgroundColor: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label id="segment-extension-label" htmlFor="segment-extension">
          {t('canvas.segmentExtension', { value: canvas.segmentExtension?.toFixed(1) ?? '1.3' })}
        </Label>
        <Input
          id="segment-extension"
          type="range"
          min={1.0}
          max={2.0}
          step={0.1}
          value={canvas.segmentExtension ?? 1.3}
          onChange={(e) => setCanvas({ segmentExtension: parseFloat(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">{t('canvas.segmentExtensionHint')}</p>
      </div>

      <div className="space-y-2">
        <Label id="inner-radius-ratio-label" htmlFor="inner-radius-ratio">
          {t('canvas.centerSize', { value: ((canvas.innerRadiusRatio ?? 0.18) * 100).toFixed(0) })}
        </Label>
        <Slider
          id="inner-radius-ratio"
          aria-labelledby="inner-radius-ratio-label"
          value={[canvas.innerRadiusRatio ?? 0.18]}
          min={0.1}
          max={0.4}
          step={0.01}
          onValueChange={([value]) => setCanvas({ innerRadiusRatio: value })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label id="show-dividers-label" htmlFor="show-dividers">{t('canvas.showDividers')}</Label>
        <Switch
          id="show-dividers"
          checked={canvas.showDividers ?? false}
          onCheckedChange={(checked) => setCanvas({ showDividers: checked })}
        />
      </div>

      {(canvas.showDividers ?? false) && (
        <div className="space-y-2">
          <Label id="divider-width-label" htmlFor="divider-width">
            {t('canvas.dividerWidth', { value: canvas.dividerWidth ?? 2 })}
          </Label>
          <Slider
            id="divider-width"
            aria-labelledby="divider-width-label"
            value={[canvas.dividerWidth ?? 2]}
            min={1}
            max={8}
            step={1}
            onValueChange={([value]) => setCanvas({ dividerWidth: value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label id="text-padding-label" htmlFor="text-padding">
          {t('canvas.textPosition', { value: canvas.textPadding?.toFixed(2) ?? '0.40' })}
        </Label>
        <Input
          id="text-padding"
          type="range"
          min={0.2}
          max={0.8}
          step={0.05}
          value={canvas.textPadding ?? 0.4}
          onChange={(e) => setCanvas({ textPadding: parseFloat(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">{t('canvas.textPositionHint')}</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label id="brand-name-label" htmlFor="brand-name">{t('canvas.brandName')}</Label>
        <Input
          id="brand-name"
          value={canvas.brandName ?? ''}
          onChange={(e) => setCanvas({ brandName: e.target.value || undefined })}
          placeholder={t('canvas.brandNamePlaceholder')}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label id="show-brand-attribution-label" htmlFor="show-brand-attribution">{t('canvas.showBrandAttribution')}</Label>
        <Switch
          id="show-brand-attribution"
          checked={canvas.showBrandAttribution ?? true}
          onCheckedChange={(checked) => setCanvas({ showBrandAttribution: checked })}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('canvas.brandAttributionHint')}</p>

      <div className="space-y-2">
        <Label id="source-note-label" htmlFor="source-note">{t('canvas.sourceNote')}</Label>
        <Input
          id="source-note"
          value={canvas.sourceNote ?? ''}
          onChange={(e) => setCanvas({ sourceNote: e.target.value || undefined })}
          placeholder={t('canvas.sourceNotePlaceholder')}
        />
      </div>
    </div>
  );
}