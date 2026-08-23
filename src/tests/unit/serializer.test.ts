import { describe, it, expect } from 'vitest';
import { createDefaultProject } from '@/lib/sampleData';
import { serializeProject, validateProject } from '@/lib/projectSerializer';
import { ProjectState } from '@/types/infographic';

describe('projectSerializer', () => {
  it('round-trips a default project without loss', () => {
    const original = createDefaultProject();
    const restored = validateProject(JSON.parse(serializeProject(original)));
    expect(restored.slices).toEqual(original.slices);
    expect(restored.canvas).toEqual(original.canvas);
    expect(restored.typography).toEqual(original.typography);
    expect(restored.center).toEqual(original.center);
    expect(restored.palette).toEqual(original.palette);
    expect(restored.sliceStyle).toEqual(original.sliceStyle);
    expect(restored.uploadedIcons).toEqual([]);
    expect(restored.version).toBe(original.version);
  });

  it('normalizes selectedSliceId to null on load', () => {
    const project = createDefaultProject();
    project.selectedSliceId = project.slices[0].id;
    const restored = validateProject(JSON.parse(serializeProject(project)));
    expect(restored.selectedSliceId).toBeNull();
  });

  it('preserves custom canvas dimensions and per-slice overrides', () => {
    const project = createDefaultProject();
    project.canvas.aspectRatio = 'Custom';
    project.canvas.dimensions = { width: 1920, height: 1080 };
    project.slices[0].iconVerticalPosition = 0.5;
    project.slices[0].iconMargin = 24;
    project.slices[0].uploadedIconId = 'up-1';
    project.uploadedIcons = [
      { id: 'up-1', name: 'logo.svg', dataUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', type: 'image/svg+xml' },
    ];
    const restored = validateProject(JSON.parse(serializeProject(project)));
    expect(restored.canvas.aspectRatio).toBe('Custom');
    expect(restored.canvas.dimensions).toEqual({ width: 1920, height: 1080 });
    expect(restored.slices[0].iconVerticalPosition).toBe(0.5);
    expect(restored.slices[0].iconMargin).toBe(24);
    expect(restored.slices[0].uploadedIconId).toBe('up-1');
    expect(restored.uploadedIcons[0].id).toBe('up-1');
  });

  it('fills defaults for optional fields added after the project was saved', () => {
    const legacy = {
      version: 1,
      canvas: { aspectRatio: '1:1', dimensions: { width: 1080, height: 1080 }, backgroundColor: '#ffffff' },
      palette: { mode: 'single', singleColor: '#0066FF', gradientStart: '#3CB371', gradientEnd: '#0077FF' },
      center: {
        title: 'T', subtitle: 'S', footerCaption: 'C', titleFont: 'Oswald', subtitleFont: 'Oswald',
        captionFont: 'Inter', titleColor: '#fff', subtitleColor: '#fff', captionColor: '#ddd',
        logos: [], logoPlacement: 'auto',
      },
      typography: {
        metricFont: 'Oswald', labelFont: 'Inter', metricColor: '#fff', labelColor: '#fff',
        showIcons: true, iconSize: 48,
      },
      sliceStyle: { fillMode: 'solid', gradientIntensity: 0.35 },
      slices: [{ id: 's1', metric: '10', label: 'X' }],
    };
    const restored = validateProject(legacy);
    // New optional fields fall back to today's defaults.
    expect(restored.typography.metricLabelGap).toBe(0.35);
    expect(restored.typography.iconVerticalPosition).toBe(0.82);
    expect(restored.typography.iconMargin).toBe(8);
    expect(restored.canvas.segmentExtension).toBe(1.48);
    expect(restored.uploadedIcons).toEqual([]);
    expect(restored.slices).toHaveLength(1);
  });

  it('rejects structurally broken payloads instead of crashing', () => {
    expect(() => validateProject({ version: 1, slices: 'nope' })).toThrow();
    expect(() => validateProject(null)).toThrow();
    expect(() => validateProject({ version: 1, slices: [{ id: 's1' }], canvas: { aspectRatio: 'BAD' } })).toThrow();
  });

  it('rejects unknown palette mode values', () => {
    const project = createDefaultProject();
    project.palette.mode = 'neon' as ProjectState['palette']['mode'];
    expect(() => validateProject(JSON.parse(serializeProject(project)))).toThrow();
  });
});
