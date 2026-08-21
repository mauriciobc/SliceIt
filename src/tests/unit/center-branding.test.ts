import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { createDefaultProject } from '@/lib/sampleData';
import { useProjectStore } from '@/store/useProjectStore';
import { deriveCenterColor } from '@/lib/palette';
import { computeCanvasGeometry } from '@/lib/geometry';
import { validateProject } from '@/lib/projectSerializer';
import { CenterWheel } from '@/components/canvas/CenterWheel';
import type { CanvasConfig, UploadedImage } from '@/types/infographic';

function uploaded(id: string, type: UploadedImage['type'] = 'image/svg+xml'): UploadedImage {
  return {
    id,
    name: `${id}.svg`,
    dataUrl: type === 'image/svg+xml'
      ? `data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=`
      : `data:image/png;base64,iVBORw0KGgo=`,
    type,
  };
}

describe('center branding images', () => {
  beforeEach(() => useProjectStore.getState().resetProject());

  it('caps logos at 3', () => {
    const s = useProjectStore.getState();
    s.addLogo(uploaded('a'));
    s.addLogo(uploaded('b'));
    s.addLogo(uploaded('c'));
    s.addLogo(uploaded('d'));
    expect(useProjectStore.getState().center.logos).toHaveLength(3);
    expect(useProjectStore.getState().center.logos.find(l => l.id === 'd')).toBeUndefined();
  });

  it('removes logos cleanly', () => {
    const s = useProjectStore.getState();
    s.addLogo(uploaded('a')); s.addLogo(uploaded('b'));
    s.removeLogo('b');
    expect(useProjectStore.getState().center.logos).toHaveLength(1);
    s.removeLogo('nope');
    expect(useProjectStore.getState().center.logos).toHaveLength(1);
  });

  it('stores logoPlacement variants', () => {
    const s = useProjectStore.getState();
    for (const p of ['top','bottom','center','auto'] as const) {
      s.setCenter({ logoPlacement: p });
      expect(useProjectStore.getState().center.logoPlacement).toBe(p);
    }
  });

  it('stores brandName via canvas', () => {
    useProjectStore.getState().setCanvas({ brandName: 'Acme' });
    expect(useProjectStore.getState().canvas.brandName).toBe('Acme');
    useProjectStore.getState().setCanvas({ brandName: undefined });
    expect(useProjectStore.getState().canvas.brandName).toBeUndefined();
  });

  it('stores emblemIcon and deriveTextColors', () => {
    useProjectStore.getState().setCenter({ emblemIcon: 'AlarmClock', deriveTextColors: true });
    expect(useProjectStore.getState().center.emblemIcon).toBe('AlarmClock');
    expect(useProjectStore.getState().center.deriveTextColors).toBe(true);
  });

  it('accepts svg and png logo types', () => {
    useProjectStore.getState().resetProject();
    const s = useProjectStore.getState();
    s.addLogo(uploaded('svg1', 'image/svg+xml'));
    s.addLogo(uploaded('png1', 'image/png'));
    expect(useProjectStore.getState().center.logos[1].type).toBe('image/png');
  });

  it('keeps center circular for all aspect ratios', () => {
    for (const dims of [[1080,1080],[1080,1350],[1920,1080],[1080,1920],[1600,1200]] as const) {
      const canvas = {
        aspectRatio: 'Custom' as const,
        dimensions: { width: dims[0], height: dims[1] },
        backgroundColor: '#fff',
        segmentExtension: 1.48,
        textPadding: 0.4,
        innerRadiusRatio: 0.19,
        showDividers: true,
        dividerWidth: 4,
        sourceNote: 'x',
        brandName: 'y',
      };
      const slices = createDefaultProject().slices;
      const typ = createDefaultProject().typography;
      const g = computeCanvasGeometry(canvas as CanvasConfig, slices, typ);
      expect(g.innerRadius).toBeGreaterThan(0);
      expect(g.innerRadius).toBeLessThan(Math.min(g.outerRadiusX, g.outerRadiusY));
    }
  });

  it('deriveCenterColor returns valid hex for palettes', () => {
    for (const cols of [['#0066FF','#3CB371'], ['#FF0000','#00FF00','#0000FF'], []] as string[][]) {
      const cc = deriveCenterColor(cols);
      expect(cc).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('serializer accepts logos+brandName+emblemIcon', () => {
    const proj = createDefaultProject();
    proj.center.logos = [uploaded('x'), uploaded('y')];
    proj.canvas.brandName = 'TestCo';
    proj.center.emblemIcon = 'AlarmClock';
    expect(() => validateProject(proj)).not.toThrow();
  });

  it('isolates uploadedIcons vs logos', () => {
    useProjectStore.getState().resetProject();
    const s = useProjectStore.getState();
    s.addUploadedIcon(uploaded('icon1'));
    s.addLogo(uploaded('logo1'));
    expect(useProjectStore.getState().uploadedIcons).toHaveLength(1);
    expect(useProjectStore.getState().center.logos).toHaveLength(1);
  });

  it('renders logos as <image> elements inside hub (SVG)', () => {
    const proj = createDefaultProject();
    const svgLogo = uploaded('svg1', 'image/svg+xml');
    const pngLogo = uploaded('png1', 'image/png');
    const geometry = computeCanvasGeometry(proj.canvas, proj.slices, proj.typography);
    const centerWithLogos = { ...proj.center, logos: [svgLogo, pngLogo], logoPlacement: 'top' as const };
    const { container } = render(
      createElement('svg', null, createElement(CenterWheel, { geometry, centerConfig: centerWithLogos, centerColor: '#fff' }))
    );
    const images = container.querySelectorAll('image');
    expect(images.length).toBe(2);
    expect(images[0].getAttribute('href')).toBe(svgLogo.dataUrl);
    expect(images[1].getAttribute('href')).toBe(pngLogo.dataUrl);
  });

  it('renders brand lockup and emblem', () => {
    const proj = createDefaultProject();
    const geometry = computeCanvasGeometry(proj.canvas, proj.slices, proj.typography);
    const { container } = render(
      createElement('svg', null,
        createElement(CenterWheel, {
          geometry,
          centerConfig: { ...proj.center, emblemIcon: 'AlarmClock', deriveTextColors: true },
          centerColor: '#111827',
          brandName: 'Acme',
        })
      )
    );
    expect(container.textContent).toContain('PRESENTED BY');
    expect(container.textContent).toContain('Acme');
    expect(container.textContent).toContain('EVERY');
  });

  it('caps export still clones logos (SVG serializer includes <image>)', async () => {
    const proj = createDefaultProject();
    const logo = uploaded('export1', 'image/svg+xml');
    const geometry = computeCanvasGeometry(proj.canvas, proj.slices, proj.typography);
    const centerWithLogo = { ...proj.center, logos: [logo] };
    const { container } = render(
      createElement('svg', { id: 'radial-canvas' },
        createElement(CenterWheel, { geometry, centerConfig: centerWithLogo, centerColor: '#fff' })
      )
    );
    const svgEl = container.querySelector('svg') as unknown as SVGSVGElement;
    const cloned = svgEl.cloneNode(true) as SVGSVGElement;
    expect(cloned.querySelector('image')?.getAttribute('href')).toBe(logo.dataUrl);
  });

  it('hides "Presented by" when showBrandAttribution is false', () => {
    const proj = createDefaultProject();
    const geometry = computeCanvasGeometry(proj.canvas, proj.slices, proj.typography);
    const { container: withBrand } = render(
      createElement('svg', null,
        createElement(CenterWheel, {
          geometry,
          centerConfig: proj.center,
          centerColor: '#111827',
          brandName: 'Acme',
          showBrandAttribution: true,
        })
      )
    );
    expect(withBrand.textContent).toContain('PRESENTED BY');
    const { container: hidden } = render(
      createElement('svg', null,
        createElement(CenterWheel, {
          geometry,
          centerConfig: proj.center,
          centerColor: '#111827',
          brandName: 'Acme',
          showBrandAttribution: false,
        })
      )
    );
    expect(hidden.textContent).not.toContain('PRESENTED BY');
    // logos must still render when attribution is hidden
    const logo = uploaded('stay', 'image/svg+xml');
    const { container: withLogoHidden } = render(
      createElement('svg', null,
        createElement(CenterWheel, {
          geometry,
          centerConfig: { ...proj.center, logos: [logo], logoPlacement: 'top' },
          centerColor: '#111827',
          brandName: 'Acme',
          showBrandAttribution: false,
        })
      )
    );
    expect(withLogoHidden.querySelectorAll('image').length).toBe(1);
  });

  it('stores and serializes showBrandAttribution toggle', () => {
    useProjectStore.getState().resetProject();
    useProjectStore.getState().setCanvas({ showBrandAttribution: false });
    expect(useProjectStore.getState().canvas.showBrandAttribution).toBe(false);
    const proj = createDefaultProject();
    proj.canvas.showBrandAttribution = false;
    expect(() => validateProject(proj)).not.toThrow();
    proj.canvas.showBrandAttribution = true;
    expect(() => validateProject(proj)).not.toThrow();
  });
});
