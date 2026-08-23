import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PNG_RESOLUTIONS, type PngResolution } from '@/lib/exportConfig';
import { ProjectActions } from './ProjectActions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Image } from 'lucide-react';
import { useI18n } from '@/i18n';

export function ExportPanel() {
  const { t } = useI18n();
  const [pngResolution, setPngResolution] = useState<PngResolution>('2x');
  const handleExportSvg = async () => {
    // Defer the exporter (file-saver) until the button is actually pressed.
    const { exportSvg } = await import('@/lib/exportSvg');
    await exportSvg();
  };
  const handleExportPng = async () => {
    // Defer the exporter (html-to-image, file-saver) until the button is pressed.
    const { exportPng } = await import('@/lib/exportPng');
    await exportPng(pngResolution);
  };

  return (
    <div className="flex items-center justify-between border-t border-border bg-card p-3">
      <ProjectActions />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExportSvg}>
          <Download className="mr-1 h-4 w-4" />
          {t('export.svg')}
        </Button>

        <div className="flex items-center gap-2">
          <Select
            value={pngResolution}
            onValueChange={(v) => setPngResolution(v as PngResolution)}
          >
            <SelectTrigger className="h-8 w-[140px]" aria-label={t('export.pngResolution')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PNG_RESOLUTIONS).map(([key]) => (
                <SelectItem key={key} value={key}>
                  {t(`export.resolution.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="default" size="sm" onClick={handleExportPng}>
            <Image className="mr-1 h-4 w-4" />
            {t('export.png')}
          </Button>
        </div>
      </div>
    </div>
  );
}