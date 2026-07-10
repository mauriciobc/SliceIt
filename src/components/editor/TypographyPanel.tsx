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
import { GOOGLE_FONT_OPTIONS } from '@/types/infographic';

export function TypographyPanel() {
  const typography = useProjectStore((state) => state.typography);
  const setTypography = useProjectStore((state) => state.setTypography);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="metric-font">Metric Font</Label>
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
          <Label htmlFor="label-font">Label Font</Label>
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

      <div className="flex items-center justify-between">
        <Label htmlFor="show-icons">Show Icons</Label>
        <Switch
          id="show-icons"
          checked={typography.showIcons}
          onCheckedChange={(checked) => setTypography({ showIcons: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon-size">Icon Size</Label>
        <Slider
          id="icon-size"
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
    </div>
  );
}
