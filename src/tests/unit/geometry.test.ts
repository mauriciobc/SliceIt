import { describe, it, expect } from 'vitest';
import { computeCanvasGeometry, getLayoutMode } from '@/lib/geometry';
import { CanvasConfig } from '@/types/infographic';

function createCanvas(width: number, height: number): CanvasConfig {
  return {
    aspectRatio: 'Custom',
    dimensions: { width, height },
    backgroundColor: '#ffffff',
  };
}

function createSlices(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `slice-${i}`,
    metric: `${i}`,
    label: `Slice ${i}`,
  }));
}

describe('geometry', () => {
  it('detects square layout', () => {
    expect(getLayoutMode({ width: 1000, height: 1000 })).toBe('square');
  });

  it('detects landscape layout', () => {
    expect(getLayoutMode({ width: 1920, height: 1080 })).toBe('landscape');
  });

  it('detects portrait layout', () => {
    expect(getLayoutMode({ width: 1080, height: 1920 })).toBe('portrait');
  });

  it('generates one wedge per slice', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(8));
    expect(geometry.wedges).toHaveLength(8);
  });

  it('keeps center wheel circular in landscape', () => {
    const geometry = computeCanvasGeometry(createCanvas(1920, 1080), createSlices(8));
    expect(geometry.innerRadius).toBeLessThan(geometry.outerRadiusX);
    expect(geometry.innerRadius).toBeLessThan(geometry.outerRadiusY);
  });

  it('keeps center wheel circular in portrait', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1920), createSlices(8));
    expect(geometry.innerRadius).toBeLessThan(geometry.outerRadiusX);
    expect(geometry.innerRadius).toBeLessThan(geometry.outerRadiusY);
  });

  it('places each centroid between the inner and outer radius', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(8));
    for (const wedge of geometry.wedges) {
      const distance = Math.sqrt(wedge.centroid.x ** 2 + wedge.centroid.y ** 2);
      expect(distance).toBeGreaterThanOrEqual(wedge.innerRadius * 0.95);
      expect(distance).toBeLessThanOrEqual(wedge.outerRadius * 1.05);
    }
  });
});
