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

      <main className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Full-width above the canvas on small screens; fixed 384px sidebar on lg+. */}
        <aside
          className={cn(
            'w-full flex-shrink-0 overflow-y-auto border-b border-border bg-card p-4',
            'lg:w-96 lg:border-b-0 lg:border-r'
          )}
        >
          <EditorPanel />
        </aside>

        <section className="relative flex min-h-[55vh] flex-1 flex-col overflow-hidden bg-muted/30 lg:min-h-0">
          <div className="relative flex-1">
            <RadialCanvas />
          </div>
          <ExportPanel />
        </section>
      </main>

      <AppStatusBar />
    </div>
  );
}