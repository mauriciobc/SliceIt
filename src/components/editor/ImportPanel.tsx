import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { nanoid } from '@/lib/nanoid';
import { parseCsv } from '@/lib/csvParser';
import { Slice } from '@/types/infographic';
import { FileUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n';

export function ImportPanel() {
  const { t } = useI18n();
  const setSlices = useProjectStore((state) => state.setSlices);
  const setCenter = useProjectStore((state) => state.setCenter);
  const setPalette = useProjectStore((state) => state.setPalette);
  const setCanvas = useProjectStore((state) => state.setCanvas);
  const setTypography = useProjectStore((state) => state.setTypography);

  const processFile = useCallback(
    async (file: File) => {
      const text = await file.text();

      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          if (Array.isArray(data.slices)) {
            const slices: Slice[] = data.slices.map((item: Record<string, unknown>) => ({
              id: nanoid(),
              metric: String(item.metric ?? ''),
              label: String(item.label ?? ''),
              color: item.color ? String(item.color) : undefined,
              icon: item.icon ? String(item.icon) : undefined,
            }));
            setSlices(slices);
          }
          if (data.center && typeof data.center === 'object') {
            setCenter(data.center as Partial<typeof data.center>);
          }
          if (data.palette && typeof data.palette === 'object') {
            setPalette(data.palette as Partial<typeof data.palette>);
          }
          if (data.canvas && typeof data.canvas === 'object') {
            setCanvas(data.canvas as Partial<typeof data.canvas>);
          }
          if (data.typography && typeof data.typography === 'object') {
            setTypography(data.typography as Partial<typeof data.typography>);
          }
        } catch {
          // ignore invalid JSON
        }
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const slices = parseCsv(text);
        setSlices(slices);
      }
    },
    [setSlices, setCenter, setPalette, setCanvas, setTypography]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    multiple: false,
    onDrop: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  return (
    <div className="mt-4 space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border border-dashed p-4 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'hover:border-muted-foreground/50 hover:bg-muted/30'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <Label className="text-sm font-medium">
            {isDragActive ? t('import.dropActive') : t('import.dropInactive')}
          </Label>
          <p className="text-xs text-muted-foreground">{t('import.hint')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="relative">
          <label htmlFor="import-file" className="cursor-pointer">
            <FileUp className="mr-1 h-4 w-4" />
            {t('import.chooseFile')}
            <input
              id="import-file"
              type="file"
              accept=".csv,.json"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </label>
        </Button>
        <span className="text-xs text-muted-foreground">{t('import.orSelect')}</span>
      </div>
    </div>
  );
}
