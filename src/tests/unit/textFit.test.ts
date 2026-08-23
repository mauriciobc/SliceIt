import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { fitText } from '@/lib/textFit';

// The jsdom environment may provide a canvas 2D context whose measureText is
// unreliable (near-zero widths). Pin the measure fallback (text.length * 10)
// so the tests are deterministic.
beforeAll(() => {
  const originalCreateElement = document.createElement.bind(document);
  vi.stubGlobal('document', {
    ...document,
    createElement: (tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'canvas') {
        (el as HTMLCanvasElement).getContext = () => null;
      }
      return el;
    },
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('textFit', () => {
  it('fits short text without overflow', () => {
    const result = fitText('API', {
      maxWidth: 200,
      maxHeight: 100,
      fontFamily: 'Inter',
    });
    expect(result.overflow).toBe(false);
    expect(result.lines).toContain('API');
  });

  it('keeps a short text on one line', () => {
    const r = fitText('SHORT', { maxWidth: 200, maxHeight: 60, fontFamily: 'Inter' });
    expect(r.lines).toEqual(['SHORT']);
    expect(r.overflow).toBe(false);
    expect(r.fontSize).toBeGreaterThan(0);
  });

  it('reports overflow for oversized text', () => {
    const result = fitText('A'.repeat(200), {
      maxWidth: 10,
      maxHeight: 100,
      fontFamily: 'Inter',
    });
    expect(result.overflow).toBe(true);
  });

  it('wraps long text to multiple lines', () => {
    const r = fitText('A VERY LONG METRIC LABEL THAT SPANS MANY WORDS', {
      maxWidth: 200,
      maxHeight: 60,
      fontFamily: 'Inter',
    });
    expect(r.lines.length).toBeGreaterThan(1);
  });

  it('marks overflow when no candidate size fits the height', () => {
    const r = fitText('ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT NINE TEN ELEVEN TWELVE', {
      maxWidth: 40,
      maxHeight: 20,
      fontFamily: 'Inter',
    });
    expect(r.overflow).toBe(true);
    expect(r.fontSize).toBeGreaterThanOrEqual(12);
  });

  it('respects min and max font sizes', () => {
    const r = fitText('SHORT', {
      maxWidth: 200,
      maxHeight: 60,
      fontFamily: 'Inter',
      minFontSize: 40,
      maxFontSize: 40,
    });
    expect(r.fontSize).toBe(40);
  });

  it('handles empty text', () => {
    const r = fitText('', { maxWidth: 200, maxHeight: 60, fontFamily: 'Inter' });
    expect(r.lines.length).toBe(0);
    expect(r.overflow).toBe(false);
  });

  it('never silently renders a line wider than maxWidth', () => {
    const r = fitText('ALPHA BETA GAMMA DELTA EPSILON ZETA ETA THETA', {
      maxWidth: 100,
      maxHeight: 120,
      fontFamily: 'Inter',
    });
    // Either every line fits, or the fitter reports overflow (single unbreakable word).
    const allFit = r.lines.every((line) => line.length * 10 <= 100);
    expect(allFit || r.overflow).toBe(true);
  });

  it('flags an unbreakable word wider than maxWidth as overflow', () => {
    const r = fitText('SUPERCALIFRAGILISTICEXPIALIDOCIOUS'.repeat(2), {
      maxWidth: 60,
      maxHeight: 120,
      fontFamily: 'Inter',
    });
    expect(r.overflow).toBe(true);
  });
});