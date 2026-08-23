import { lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportPanel } from './ImportPanel';
import { TextWarnings } from './TextWarnings';
import { Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n';

// Editor tabs are heavy (icon pickers, color pickers, palettes…). Load each one
// only when its tab is first activated to keep the initial bundle small.
const SliceEditor = lazy(() => import('./SliceEditor').then((m) => ({ default: m.SliceEditor })));
const CanvasPanel = lazy(() => import('./CanvasPanel').then((m) => ({ default: m.CanvasPanel })));
const PalettePanel = lazy(() => import('./PalettePanel').then((m) => ({ default: m.PalettePanel })));
const CenterPanel = lazy(() => import('./CenterPanel').then((m) => ({ default: m.CenterPanel })));
const TypographyPanel = lazy(() => import('./TypographyPanel').then((m) => ({ default: m.TypographyPanel })));

function PanelFallback() {
  return (
    <div className="flex min-h-24 items-center justify-center text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}

export function EditorPanel() {
  const { t } = useI18n();
  return (
    <Tabs defaultValue="slices" className="flex h-full flex-col">
      <TabsList className="mb-4 grid w-full grid-cols-5">
        <TabsTrigger value="slices">{t('tabs.slices')}</TabsTrigger>
        <TabsTrigger value="canvas">{t('tabs.canvas')}</TabsTrigger>
        <TabsTrigger value="palette">{t('tabs.palette')}</TabsTrigger>
        <TabsTrigger value="center">{t('tabs.center')}</TabsTrigger>
        <TabsTrigger value="typography">{t('tabs.typography')}</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto pr-1">
        <TabsContent value="slices" className="mt-0">
          <Suspense fallback={<PanelFallback />}>
            <SliceEditor />
          </Suspense>
        </TabsContent>
        <TabsContent value="canvas" className="mt-0">
          <Suspense fallback={<PanelFallback />}>
            <CanvasPanel />
          </Suspense>
        </TabsContent>
        <TabsContent value="palette" className="mt-0">
          <Suspense fallback={<PanelFallback />}>
            <PalettePanel />
          </Suspense>
        </TabsContent>
        <TabsContent value="center" className="mt-0">
          <Suspense fallback={<PanelFallback />}>
            <CenterPanel />
          </Suspense>
        </TabsContent>
        <TabsContent value="typography" className="mt-0">
          <Suspense fallback={<PanelFallback />}>
            <TypographyPanel />
          </Suspense>
        </TabsContent>
      </div>

      <TextWarnings />
      <ImportPanel />
    </Tabs>
  );
}
