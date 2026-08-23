import {
  AppState,
  HistoryState,
  ProjectSnapshot,
} from '@/types/infographic';

/**
 * History management for the project store (undo/redo).
 *
 * All functions here are pure so the coalescing/limit rules can be unit-tested
 * without a store instance. The store only wires them into its actions.
 */

export const HISTORY_LIMIT = 30;

/**
 * While the user keeps mutating within this window (a slider drag, a rapid
 * series of switch clicks) we treat the changes as ONE undoable gesture and
 * keep a single history entry holding the state that existed before the
 * gesture started.
 */
export const COALESCE_WINDOW_MS = 500;

export function snapshotProject(state: AppState): ProjectSnapshot {
  return {
    canvas: state.canvas,
    palette: state.palette,
    center: state.center,
    typography: state.typography,
    sliceStyle: state.sliceStyle,
    slices: state.slices,
    uploadedIcons: state.uploadedIcons,
  };
}

export function sameContent(a: ProjectSnapshot, b: ProjectSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Record a new history entry for the snapshot that existed BEFORE the current
 * mutation. Consecutive mutations inside the coalescing window refresh the
 * timestamp of the most recent entry instead of adding noise entries, so a
 * drag becomes a single undo step that restores the pre-gesture snapshot.
 *
 * A snapshot identical to the last recorded one is ignored (no-op actions).
 */
export function pushHistory(
  history: HistoryState,
  snapshot: ProjectSnapshot,
  now: number,
  limit: number = HISTORY_LIMIT,
  coalesceWindowMs: number = COALESCE_WINDOW_MS
): HistoryState {
  const last = history.past[history.past.length - 1];
  if (last && sameContent(last.snapshot, snapshot)) {
    // Nothing user-visible changed since the last entry — keep things quiet.
    return history;
  }

  if (last && now - last.timestamp < coalesceWindowMs) {
    return {
      past: [...history.past.slice(0, -1), { ...last, timestamp: now }],
      future: [],
    };
  }

  return {
    past: [...history.past.slice(-(limit - 1)), { snapshot, timestamp: now }],
    future: [],
  };
}

/** Pop the most recent snapshot; returns null when there is nothing to undo. */
export function popUndo(history: HistoryState): {
  history: HistoryState;
  snapshot: ProjectSnapshot | null;
} {
  const last = history.past[history.past.length - 1];
  if (!last) return { history, snapshot: null };
  return {
    history: { past: history.past.slice(0, -1), future: history.future },
    snapshot: last.snapshot,
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}