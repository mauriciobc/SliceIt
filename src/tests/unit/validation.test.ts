import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/store/useProjectStore';
import {
  HARD_MAX_SLICES,
  MIN_SLICES,
  RECOMMENDED_MAX_SLICES,
} from '@/types/infographic';

function slicesOf(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: 's' + i,
    metric: String(i),
    label: 'L' + i,
  }));
}

describe('project validation', () => {
  beforeEach(() => useProjectStore.getState().resetProject());

  it('default project (8 slices) has no warnings or errors', () => {
    const s = useProjectStore.getState();
    expect(s.warnings).toEqual([]);
    expect(s.errors).toEqual([]);
  });

  it('warns above the recommended slice count', () => {
    useProjectStore.getState().setSlices(slicesOf(RECOMMENDED_MAX_SLICES + 1));
    const s = useProjectStore.getState();
    expect(s.warnings.map((w) => w.key)).toContain('validation.recommendedSlices');
    expect(s.errors).toEqual([]);
  });

  it('errors at or above the hard slice cap', () => {
    useProjectStore.getState().setSlices(slicesOf(HARD_MAX_SLICES + 1));
    const s = useProjectStore.getState();
    expect(s.errors.map((e) => e.key)).toContain('validation.maxSlices');
  });

  it('errors below the minimum slice count', () => {
    useProjectStore.getState().setSlices(slicesOf(MIN_SLICES - 1));
    const s = useProjectStore.getState();
    expect(s.errors.map((e) => e.key)).toContain('validation.minSlices');
  });

  it('addSlice is guarded at the hard cap', () => {
    const s = useProjectStore.getState();
    s.setSlices(slicesOf(HARD_MAX_SLICES));
    // At the exact cap: recommended-count warning, no hard error yet.
    expect(useProjectStore.getState().errors).toEqual([]);
    expect(useProjectStore.getState().warnings.map((w) => w.key)).toContain('validation.recommendedSlices');

    // addSlice must be a no-op at the cap (the app can never exceed it).
    useProjectStore.getState().addSlice();
    expect(useProjectStore.getState().slices).toHaveLength(HARD_MAX_SLICES);
    expect(useProjectStore.getState().errors.map((e) => e.key)).not.toContain('validation.maxSlices');
  });

  it('removeSlice is guarded at the minimum', () => {
    const s = useProjectStore.getState();
    s.setSlices(slicesOf(MIN_SLICES));
    useProjectStore.getState().removeSlice(useProjectStore.getState().slices[0].id);
    expect(useProjectStore.getState().slices).toHaveLength(MIN_SLICES);
  });
});