import { RadialCanvas } from '@/components/canvas/RadialCanvas';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { ExportPanel } from '@/components/export/ExportPanel';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppStatusBar } from '@/components/layout/AppStatusBar';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';

// Expose store for E2E gauntlet validation (dev only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__sliceStore = useProjectStore;
}

export function InfographicApp() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />

      <main className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            'w-96 flex-shrink-0 overflow-y-auto border-r border-border bg-card',
            'p-4'
          )}
        >
          <EditorPanel />
        </aside>

        <section className="relative flex flex-1 flex-col overflow-hidden bg-muted/30">
          <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
            <RadialCanvas />
          </div>
          <ExportPanel />
        </section>
      </main>

      <AppStatusBar />
    </div>
  );
}
