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
import { RotateCcw } from 'lucide-react';
import { GOOGLE_FONT_OPTIONS } from '@/types/infographic';

export function TypographyPanel() {
  const typography = useProjectStore((state) => state.typography);
  const setTypography = useProjectStore((state) => state.setTypography);
  const resetIconSettings = useProjectStore((state) => state.resetIconSettings);

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
        <Label htmlFor="metric-label-gap">Metric\u2013Label Gap</Label>
        <Slider
          id="metric-label-gap"
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

      <div className="space-y-2">
        <Label htmlFor="icon-vertical-position">
          Icon Position: {typography.iconVerticalPosition.toFixed(2)}
        </Label>
        <Slider
          id="icon-vertical-position"
          value={[typography.iconVerticalPosition]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([value]) => setTypography({ iconVerticalPosition: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          {typography.iconVerticalPosition < 0.5 ? 'Inner' : typography.iconVerticalPosition > 0.5 ? 'Outer' : 'Center'}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon-margin">
          Icon Margin: {typography.iconMargin}px
        </Label>
        <Slider
          id="icon-margin"
          value={[typography.iconMargin]}
          min={0}
          max={50}
          step={1}
          onValueChange={([value]) => setTypography({ iconMargin: value })}
        />
        <div className="text-right text-xs text-muted-foreground">
          Min distance from edge
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={resetIconSettings}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Icon Settings
      </Button>
    </div>
  );
}
