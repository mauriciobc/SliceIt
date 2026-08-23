import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useProjectStore } from '@/store/useProjectStore';
import { embedExportFonts } from './exportFonts';
import { PNG_RESOLUTIONS, type PngResolution } from './exportConfig';

const SHORT_EDGE_TARGETS: Partial<Record<PngResolution, number>> = {
  social: 1080,
  hd: 1920,
  '4k': 3840,
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

  const { pixelRatio } = PNG_RESOLUTIONS[resolution];
  const filename = filenameForResolution('infographic.png', resolution);

  let targetPixelRatio = pixelRatio;
  const targetShortEdge = SHORT_EDGE_TARGETS[resolution];
  if (targetShortEdge) {
    const viewBox = svg.viewBox.baseVal;
    const shortEdge = Math.min(viewBox.width, viewBox.height);
    targetPixelRatio = targetShortEdge / shortEdge;
  }

  const state = useProjectStore.getState();
  await document.fonts.ready;
  await embedExportFonts(svg, state);

  const dataUrl = await toPng(svg, {
    pixelRatio: targetPixelRatio,
    cacheBust: true,
    backgroundColor: '#ffffff',
    skipFonts: false,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, filename);
}