import { describe, it, expect } from 'vitest';
import {
  canRedo,
  canUndo,
  popUndo,
  pushHistory,
  sameContent,
  snapshotProject,
  HISTORY_LIMIT,
  COALESCE_WINDOW_MS,
} from '@/lib/history';
import { createDefaultProject } from '@/lib/sampleData';
import { HistoryState } from '@/types/infographic';

const empty: HistoryState = { past: [], future: [] };
const now = 1_000_000;

// snapshotProject keeps references (safe under Immer); tests must clone before
// mutating so earlier snapshots stay immutable.
function snap(project: ReturnType<typeof createDefaultProject>) {
  return snapshotProject(project as never);
}

describe('history helpers', () => {
  it('snapshotProject captures only serializable project content', () => {
    const project = createDefaultProject();
    const app = { ...project, warnings: [], errors: [], history: empty, selectedSliceId: 'x' };
    const s = snapshotProject(app as never);
    expect(s.slices).toHaveLength(8);
    expect('selectedSliceId' in s).toBe(false);
    expect('warnings' in s).toBe(false);
  });

  it('sameContent compares snapshots structurally', () => {
    const a = createDefaultProject();
    const b = structuredClone(a);
    expect(sameContent(snap(a), snap(b))).toBe(true);
    b.typography.metricLabelGap = 0.5;
    expect(sameContent(snap(a), snap(b))).toBe(false);
  });

  it('first push creates one entry and clears future', () => {
    const h = pushHistory(
      { past: [], future: [{ snapshot: snap(createDefaultProject()), timestamp: now }] },
      snap(createDefaultProject()),
      now + 1
    );
    expect(h.past).toHaveLength(1);
    expect(h.future).toEqual([]);
  });

  it('a mutation inside the coalescing window keeps ONE entry (drag == one undo step)', () => {
    const a = createDefaultProject();
    const beforeDrag = snap(a);
    const b = structuredClone(a);
    b.typography.iconSize = 64;
    const midDrag = snap(b);
    const c = structuredClone(b);
    c.typography.iconSize = 72;
    const endDrag = snap(c);

    let h = pushHistory(empty, beforeDrag, now);
    h = pushHistory(h, midDrag, now + 50);
    h = pushHistory(h, endDrag, now + 120, HISTORY_LIMIT, COALESCE_WINDOW_MS);
    expect(h.past).toHaveLength(1);
    // The single entry keeps the state that existed before the gesture.
    expect(sameContent(h.past[0].snapshot, beforeDrag)).toBe(true);
  });

  it('a pause longer than the window starts a new entry', () => {
    const a = createDefaultProject();
    const first = snap(a);
    const b = structuredClone(a);
    b.typography.iconSize = 60;
    let h = pushHistory(empty, first, now);
    h = pushHistory(h, snap(b), now + COALESCE_WINDOW_MS + 50);
    expect(h.past).toHaveLength(2);
  });

  it('identical consecutive snapshots are ignored (no-op actions stay quiet)', () => {
    const a = createDefaultProject();
    const base = snap(a);
    let h = pushHistory(empty, base, now);
    h = pushHistory(h, base, now + 10);
    expect(h.past).toHaveLength(1);
  });

  it('caps past at HISTORY_LIMIT, dropping the oldest', () => {
    const project = createDefaultProject();
    let h: HistoryState = empty;
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      const variant = structuredClone(project);
      variant.slices[0].metric = 'm' + i;
      h = pushHistory(h, snap(variant), now + i * 600, HISTORY_LIMIT, COALESCE_WINDOW_MS);
    }
    expect(h.past).toHaveLength(HISTORY_LIMIT);
    // The oldest (metric 'm0') was dropped, the newest kept.
    expect(h.past[0].snapshot.slices[0].metric).toBe('m5');
    expect(h.past[h.past.length - 1].snapshot.slices[0].metric).toBe('m34');
  });

  it('popUndo returns null when there is nothing to undo', () => {
    const { snapshot } = popUndo(empty);
    expect(snapshot).toBeNull();
  });

  it('popUndo removes the newest entry and exposes it', () => {
    const a = createDefaultProject();
    const first = snap(a);
    const b = structuredClone(a);
    b.typography.iconSize = 60;
    let h = pushHistory(empty, first, now);
    h = pushHistory(h, snap(b), now + 600);
    const { history, snapshot } = popUndo(h);
    expect(history.past).toHaveLength(1);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.typography.iconSize).toBe(60);
  });

  it('canUndo/canRedo reflect stack contents', () => {
    const h = pushHistory(empty, snap(createDefaultProject()), now);
    expect(canUndo(h)).toBe(true);
    expect(canRedo(h)).toBe(false);
    expect(canRedo({ past: [], future: [h.past[0]] })).toBe(true);
  });
});
