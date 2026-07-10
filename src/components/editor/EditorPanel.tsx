import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CanvasPanel } from './CanvasPanel';
import { PalettePanel } from './PalettePanel';
import { CenterPanel } from './CenterPanel';
import { TypographyPanel } from './TypographyPanel';
import { SliceEditor } from './SliceEditor';
import { ImportPanel } from './ImportPanel';
import { TextWarnings } from './TextWarnings';
import { useI18n } from '@/i18n';

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
          <SliceEditor />
        </TabsContent>
        <TabsContent value="canvas" className="mt-0">
          <CanvasPanel />
        </TabsContent>
        <TabsContent value="palette" className="mt-0">
          <PalettePanel />
        </TabsContent>
        <TabsContent value="center" className="mt-0">
          <CenterPanel />
        </TabsContent>
        <TabsContent value="typography" className="mt-0">
          <TypographyPanel />
        </TabsContent>
      </div>

      <TextWarnings />
      <ImportPanel />
    </Tabs>
  );
}
