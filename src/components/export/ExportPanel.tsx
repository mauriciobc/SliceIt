import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportSvg } from '@/lib/exportSvg';
import { exportPng, PNG_RESOLUTIONS, PngResolution } from '@/lib/exportPng';
import { ProjectActions } from './ProjectActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Image } from 'lucide-react';

export function ExportPanel() {
  const [pngResolution, setPngResolution] = useState<PngResolution>('2x');

  return (
    <div className="flex items-center justify-between border-t border-border bg-card p-3">
      <ProjectActions />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => exportSvg()}>
          <Download className="mr-1 h-4 w-4" />
          SVG
        </Button>

        <div className="flex items-center gap-2">
          <Select
            value={pngResolution}
            onValueChange={(v) => setPngResolution(v as PngResolution)}
          >
            <SelectTrigger className="h-8 w-[140px]" aria-label="PNG resolution">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PNG_RESOLUTIONS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="default" size="sm" onClick={() => exportPng(pngResolution)}>
            <Image className="mr-1 h-4 w-4" />
            PNG
          </Button>
        </div>
      </div>
    </div>
  );
}
