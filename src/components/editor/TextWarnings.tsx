import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { computeCanvasGeometry } from '@/lib/geometry';
import { fitText } from '@/lib/textFit';
import { AlertTriangle } from 'lucide-react';

export function TextWarnings() {
  const canvas = useProjectStore((state) => state.canvas);
  const slices = useProjectStore((state) => state.slices);
  const typography = useProjectStore((state) => state.typography);
  const errors = useProjectStore((state) => state.errors);
  const warnings = useProjectStore((state) => state.warnings);
  const geometry = useMemo(() => computeCanvasGeometry(canvas, slices), [canvas, slices]);

  const overflowMessages = useMemo(() => {
    const messages: string[] = [];
    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      const wedge = geometry.wedges[i];
      if (!wedge) continue;

      const metricResult = fitText(slice.metric, {
        maxWidth: wedge.safeBounds.width * 0.9,
        maxHeight: wedge.safeBounds.height * 0.4,
        fontFamily: typography.metricFont,
        minFontSize: 16,
        maxFontSize: 64,
      });

      const labelResult = fitText(slice.label, {
        maxWidth: wedge.safeBounds.width * 0.9,
        maxHeight: wedge.safeBounds.height * (typography.showIcons ? 0.35 : 0.45),
        fontFamily: typography.labelFont,
        minFontSize: 12,
        maxFontSize: 28,
      });

      if (metricResult.overflow) {
        messages.push(`Metric "${slice.metric}" may overflow slice ${i + 1}.`);
      }
      if (labelResult.overflow) {
        messages.push(`Label "${slice.label}" may overflow slice ${i + 1}.`);
      }
    }
    return messages;
  }, [geometry, slices, typography.metricFont, typography.labelFont, typography.showIcons]);

  const allMessages = [...errors, ...warnings, ...overflowMessages];
  if (allMessages.length === 0) return null;

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <span>Issues ({allMessages.length})</span>
      </div>
      <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
        {allMessages.map((message, index) => (
          <li key={index} className="leading-relaxed">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
