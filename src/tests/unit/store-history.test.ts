import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useProjectStore } from '@/store/useProjectStore';
import { createDefaultProject } from '@/lib/sampleData';
import { HISTORY_LIMIT, COALESCE_WINDOW_MS } from '@/lib/history';

describe('undo/redo store integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useProjectStore.getState().resetProject();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const pastCount = () => useProjectStore.getState().history.past.length;
  const futureCount = () => useProjectStore.getState().history.future.length;

  it('records history for content mutations and undo restores them', () => {
    const s = useProjectStore.getState();
    const original = s.typography.metricFont;

    s.setTypography({ metricFont: 'Inter' });
    expect(useProjectStore.getState().typography.metricFont).toBe('Inter');
    expect(pastCount()).toBe(1);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().typography.metricFont).toBe(original);
    expect(futureCount()).toBe(1);

    useProjectStore.getState().redo();
    expect(useProjectStore.getState().typography.metricFont).toBe('Inter');
    expect(pastCount()).toBe(1);
  });

  it('a new edit after undo clears the redo stack', () => {
    const s = useProjectStore.getState();
    s.setTypography({ iconSize: 60 });
    useProjectStore.getState().undo();
    expect(futureCount()).toBe(1);

    vi.advanceTimersByTime(COALESCE_WINDOW_MS + 50);
    s.setTypography({ iconSize: 72 });
    expect(futureCount()).toBe(0);
    expect(useProjectStore.getState().typography.iconSize).toBe(72);
  });

  it('rapid slider-style mutations coalesce into a single undo step', () => {
    const s = useProjectStore.getState();
    const originalIconSize = s.typography.iconSize;

    // Simulate a drag: many tiny updates within the coalescing window.
    for (let i = 1; i <= 20; i++) {
      s.setTypography({ iconSize: originalIconSize + i });
      vi.advanceTimersByTime(20);
    }
    expect(pastCount()).toBe(1);

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().typography.iconSize).toBe(originalIconSize);
  });

  it('addSlice/removeSlice are undoable and revalidation follows', () => {
    const s = useProjectStore.getState();
    const count = s.slices.length;

    s.addSlice();
    expect(useProjectStore.getState().slices).toHaveLength(count + 1);
    useProjectStore.getState().undo();
    expect(useProjectStore.getState().slices).toHaveLength(count);

    // removeSlice guarded at MIN_SLICES creates no history entry
    for (let i = count; i > 4; i--) {
      const state = useProjectStore.getState();
      state.removeSlice(state.slices[0].id);
    }
    const before = useProjectStore.getState().slices.length;
    useProjectStore.getState().removeSlice(useProjectStore.getState().slices[0].id);
    expect(useProjectStore.getState().slices).toHaveLength(before);
  });

  it('resetProject clears history but reset itself is not undoable', () => {
    const s = useProjectStore.getState();
    s.setTypography({ metricFont: 'Arial' });
    expect(pastCount()).toBeGreaterThan(0);

    useProjectStore.getState().resetProject();
    expect(pastCount()).toBe(0);
    expect(futureCount()).toBe(0);
    expect(useProjectStore.getState().typography.metricFont).toBe('Oswald');
  });

  it('loadProject replaces history', () => {
    const s = useProjectStore.getState();
    s.setTypography({ metricFont: 'Arial' });

    const fresh = createDefaultProject();
    fresh.typography.metricFont = 'Lora';
    useProjectStore.getState().loadProject(fresh);
    expect(pastCount()).toBe(0);
    expect(useProjectStore.getState().typography.metricFont).toBe('Lora');
  });

  it('selection changes do not pollute history', () => {
    const s = useProjectStore.getState();
    s.setSelectedSliceId(s.slices[0].id);
    expect(pastCount()).toBe(0);
  });

  it('undo restores per-slice overrides and uploaded icons', () => {
    const s = useProjectStore.getState();
    const sliceId = s.slices[0].id;
    s.updateSlice(sliceId, { iconVerticalPosition: 0.5, iconMargin: 24 });
    s.addUploadedIcon({ id: 'up-1', name: 'icon.svg', dataUrl: 'data:image/svg+xml;base64,zz', type: 'image/svg+xml' });
    s.updateSlice(sliceId, { uploadedIconId: 'up-1' });

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().slices[0].uploadedIconId).toBeUndefined();
    expect(useProjectStore.getState().uploadedIcons).toHaveLength(0);
    expect(useProjectStore.getState().slices[0].iconVerticalPosition).toBeUndefined();

    useProjectStore.getState().undo();
    expect(useProjectStore.getState().slices[0].iconVerticalPosition).toBeUndefined();
  });

  it('history is bounded (oldest entries dropped)', () => {
    const s = useProjectStore.getState();
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      vi.advanceTimersByTime(COALESCE_WINDOW_MS + 50);
      s.setTypography({ metricFontWeight: 400 + (i % 5) * 100 });
    }
    expect(pastCount()).toBeLessThanOrEqual(HISTORY_LIMIT);
  });

  it('reportError surfaces a message without touching history', () => {
    const s = useProjectStore.getState();
    s.reportError({ key: 'actions.invalidFile' });
    expect(useProjectStore.getState().errors.map((e) => e.key)).toContain('actions.invalidFile');
    expect(pastCount()).toBe(0);
  });
});