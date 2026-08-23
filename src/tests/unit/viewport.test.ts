import { describe, it, expect } from 'vitest';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  clampPan,
  clampZoom,
  normalizeViewport,
  stepZoom,
} from '@/lib/viewport';

describe('viewport math', () => {
  it('clamps zoom to [1, 4]', () => {
    expect(clampZoom(0.5)).toBe(1);
    expect(clampZoom(10)).toBe(4);
    expect(clampZoom(2)).toBe(2);
  });

  it('steps zoom on the quarter grid', () => {
    expect(stepZoom(1, 1)).toBeCloseTo(1.25);
    expect(stepZoom(2, -1)).toBeCloseTo(1.75);
    expect(stepZoom(1, -1)).toBe(1); // floor at the minimum
    expect(stepZoom(4, 1)).toBe(4); // ceiling at the maximum
  });

  it('does not allow panning at zoom 1', () => {
    const p = clampPan({ x: 999, y: 999 }, 1, { width: 800, height: 600 }, { width: 800, height: 600 });
    expect(p).toEqual({ x: 0, y: 0 });
  });

  it('clamps pan to the viewport edges for a zoomed-in content', () => {
    const viewport = { width: 400, height: 300 };
    const content = { width: 200, height: 200 };
    // At zoom 4 the content is 800x800; offsets beyond (800-400)/2=200 are clamped.
    const p = clampPan({ x: 500, y: -500 }, 4, viewport, content);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(-250);
  });

  it('normalizeViewport resets pan when zoom returns to 1', () => {
    const vp = { width: 400, height: 300 };
    const content = { width: 200, height: 200 };
    const normal = normalizeViewport({ x: 50, y: -30 }, 1, vp, content);
    expect(normal.pan).toEqual({ x: 0, y: 0 });
    expect(normal.zoom).toBe(1);
  });

  it('normalizeViewport keeps a clamped pan when zoomed', () => {
    const vp = { width: 400, height: 300 };
    const content = { width: 200, height: 200 };
    const normal = normalizeViewport({ x: 90, y: 999 }, 2, vp, content);
    // At zoom 2 the content is 400x400: maxX (400-400)/2 = 0; maxY (400-300)/2 = 50.
    expect(normal.pan).toEqual({ x: 0, y: 50 });
  });

  it('exports useful constants for the toolbar', () => {
    expect(ZOOM_STEP).toBe(0.25);
    expect(MIN_ZOOM).toBe(1);
    expect(MAX_ZOOM).toBe(4);
  });
});