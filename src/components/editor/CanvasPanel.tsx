import { useProjectStore } from '@/store/useProjectStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AspectRatioPreset, ASPECT_RATIOS } from '@/types/infographic';

const ASPECT_RATIO_KEYS = Object.keys(ASPECT_RATIOS) as AspectRatioPreset[];

export function CanvasPanel() {
  const canvas = useProjectStore((state) => state.canvas);
  const setCanvas = useProjectStore((state) => state.setCanvas);
  const setAspectRatio = useProjectStore((state) => state.setAspectRatio);
  const setCustomDimensions = useProjectStore((state) => state.setCustomDimensions);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
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
          <Label htmlFor="canvas-width">Width</Label>
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
          <Label htmlFor="canvas-height">Height</Label>
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
        <Label htmlFor="bg-color">Background Color</Label>
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
            value={canvas.backgroundColor}
            onChange={(e) => setCanvas({ backgroundColor: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="segment-extension">
          Segment Extension: {canvas.segmentExtension?.toFixed(1) ?? '1.3'}
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
        <p className="text-xs text-muted-foreground">How far segments extend beyond canvas (1.0 = to edge, 1.5 = 50% bleed)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-padding">
          Text Position: {canvas.textPadding?.toFixed(2) ?? '0.40'}
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
        <p className="text-xs text-muted-foreground">Text position within segments (0.0 = inner, 1.0 = outer)</p>
      </div>
    </div>
  );
}
