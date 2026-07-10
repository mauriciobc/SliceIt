import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export type PngResolution = '1x' | '2x' | '4x' | 'social' | 'hd' | '4k';

export const PNG_RESOLUTIONS: Record<
  PngResolution,
  { label: string; pixelRatio: number }
> = {
  '1x': { label: '1x (Current size)', pixelRatio: 1 },
  '2x': { label: '2x', pixelRatio: 2 },
  '4x': { label: '4x', pixelRatio: 4 },
  social: { label: 'Social (1080px short edge)', pixelRatio: 1 },
  hd: { label: 'HD (1920px short edge)', pixelRatio: 1 },
  '4k': { label: '4K (3840px short edge)', pixelRatio: 1 },
};

function filenameForResolution(base: string, resolution: PngResolution): string {
  const name = base.replace(/\.png$/i, '');
  return `${name}-${resolution}.png`;
}

export async function exportPng(resolution: PngResolution = '2x') {
  const svg = document.getElementById('radial-canvas');
  if (!svg || !(svg instanceof SVGSVGElement)) {
    throw new Error('Canvas SVG not found');
  }

  const { label, pixelRatio } = PNG_RESOLUTIONS[resolution];
  const filename = filenameForResolution('infographic.png', resolution);

  let targetPixelRatio = pixelRatio;
  if (label.includes('short edge')) {
    const viewBox = svg.viewBox.baseVal;
    const shortEdge = Math.min(viewBox.width, viewBox.height);
    const targetShortEdge =
      resolution === 'social' ? 1080 : resolution === 'hd' ? 1920 : 3840;
    targetPixelRatio = targetShortEdge / shortEdge;
  }

  const dataUrl = await toPng(svg, {
    pixelRatio: targetPixelRatio,
    cacheBust: true,
    backgroundColor: '#ffffff',
    skipFonts: true,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, filename);
}
