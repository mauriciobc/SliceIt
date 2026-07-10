import { describe, it, expect } from 'vitest';
import { deriveCenterColor, generateSliceColors } from '@/lib/palette';
import { PaletteConfig, Slice } from '@/types/infographic';

function createPalette(mode: PaletteConfig['mode'], overrides?: Partial<PaletteConfig>): PaletteConfig {
  return {
    mode,
    singleColor: '#0066FF',
    gradientStart: '#3CB371',
    gradientEnd: '#0077FF',
    ...overrides,
  };
}

function createSlices(count: number): Slice[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `slice-${i}`,
    metric: `${i}`,
    label: `Slice ${i}`,
  }));
}

describe('palette', () => {
  it('generates different colors in gradient mode', () => {
    const palette = createPalette('gradient');
    const slices = createSlices(4);
    const colors = slices.map((_, i) => generateSliceColors(palette, slices, i));
    expect(new Set(colors).size).toBeGreaterThan(1);
  });

  it('uses manual colors when in manual mode', () => {
    const palette = createPalette('manual');
    const slices = [
      { id: '1', metric: '1', label: 'A', color: '#FF0000' },
      { id: '2', metric: '2', label: 'B', color: '#00FF00' },
    ];
    expect(generateSliceColors(palette, slices, 0)).toBe('#FF0000');
    expect(generateSliceColors(palette, slices, 1)).toBe('#00FF00');
  });

  it('derives a center color from slice colors', () => {
    const centerColor = deriveCenterColor(['#0066FF', '#3CB371']);
    expect(centerColor).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
