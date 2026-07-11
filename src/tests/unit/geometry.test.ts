import { describe, it, expect } from 'vitest';
import { computeCanvasGeometry, getLayoutMode } from '@/lib/geometry';
import { CanvasConfig } from '@/types/infographic';

function createCanvas(width: number, height: number): CanvasConfig {
  return {
    aspectRatio: 'Custom',
    dimensions: { width, height },
    backgroundColor: '#ffffff',
    segmentExtension: 1.3,
    textPadding: 0.4,
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

  it('icon ring is concentric and proportional to the wedge ellipse', () => {
    const geometry = computeCanvasGeometry(createCanvas(1920, 1080), createSlices(8));
    const targetAspect = geometry.outerRadiusY / geometry.outerRadiusX;
    for (const wedge of geometry.wedges) {
      const angle = (wedge.startAngle + wedge.endAngle) / 2;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const outerDx = wedge.iconOuterPoint.x;
      const outerDy = wedge.iconOuterPoint.y;

      if (Math.abs(sinA) > 0.01 && Math.abs(cosA) > 0.01) {
        const rx = Math.abs(outerDx / sinA);
        const ry = Math.abs(outerDy / cosA);
        expect(ry / rx).toBeCloseTo(targetAspect, 2);
      }
    }
  });

  it('narrows safeBounds width with more slices', () => {
    const wide = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(4));
    const narrow = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(12));
    expect(narrow.wedges[0].safeBounds.width).toBeLessThan(wide.wedges[0].safeBounds.width);
  });

  it('maps landscape radii to scaled half-dimensions (X from width, Y from height)', () => {
    const geometry = computeCanvasGeometry(createCanvas(1920, 1080), createSlices(8));
    expect(geometry.outerRadiusX).toBeCloseTo((1920 / 2) * 1.3, 5);
    expect(geometry.outerRadiusY).toBeCloseTo((1080 / 2) * 1.3, 5);
  });

  it('maps portrait radii to scaled half-dimensions (X from width, Y from height)', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1920), createSlices(8));
    expect(geometry.outerRadiusX).toBeCloseTo((1080 / 2) * 1.3, 5);
    expect(geometry.outerRadiusY).toBeCloseTo((1920 / 2) * 1.3, 5);
  });

  it('clamps square radii to the smaller scaled half-dimension', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(8));
    const expected = (1080 / 2) * 1.3;
    expect(geometry.outerRadiusX).toBeCloseTo(expected, 5);
    expect(geometry.outerRadiusY).toBeCloseTo(expected, 5);
  });

  it('applies inflate to the wedge clipPath but not the base path', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(8));
    for (const wedge of geometry.wedges) {
      expect(wedge.clipPath).not.toBe(wedge.path);
    }
  });

  it('derives icon ring radii from inner radius + inflate', () => {
    const geometry = computeCanvasGeometry(createCanvas(1080, 1080), createSlices(8));
    const innerRadius = Math.min(1080, 1080) * 0.18;
    const inflate = Math.max(1, 8 + 48 / 2);
    const innerR = innerRadius + inflate;
    const outerRX = Math.max(innerR, 1080 / 2 - inflate);
    for (const wedge of geometry.wedges) {
      const dIn = Math.hypot(wedge.iconInnerPoint.x, wedge.iconInnerPoint.y);
      const dOut = Math.hypot(wedge.iconOuterPoint.x, wedge.iconOuterPoint.y);
      expect(dIn).toBeCloseTo(innerR, 1);
      expect(dOut).toBeCloseTo(outerRX, 1);
    }
  });
});
