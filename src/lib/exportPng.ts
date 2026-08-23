import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useProjectStore } from '@/store/useProjectStore';
import { embedExportFonts } from './exportFonts';
import { PNG_RESOLUTIONS, type PngResolution } from './exportConfig';

/**
 * Export targets, keyed by resolution:
 * - 1x/2x/4x multiply the artboard (viewBox) short edge, so "2x" of a
 *   1080px project is always exactly 2160px regardless of preview scale.
 * - social/hd/4k are absolute short-edge sizes.
 * The old implementation scaled the DISPLAYED preview size, which produced
 * 1112px "2x" exports whenever the canvas was fit-scaled in the UI.
 */
const ABSOLUTE_SHORT_EDGES: Partial<Record<PngResolution, number>> = {
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

  const filename = filenameForResolution('infographic.png', resolution);

  const viewBox = svg.viewBox.baseVal;
  const artboardShortEdge = Math.min(viewBox.width, viewBox.height);
  const absolute = ABSOLUTE_SHORT_EDGES[resolution];
  const outputShortEdge =
    absolute !== undefined
      ? absolute
      : artboardShortEdge * PNG_RESOLUTIONS[resolution].pixelRatio;

  const aspect = viewBox.width / viewBox.height;
  const canvasWidth = Math.round(outputShortEdge * aspect);
  const canvasHeight = Math.round(outputShortEdge);

  const state = useProjectStore.getState();
  await document.fonts.ready;
  await embedExportFonts(svg, state);

  const dataUrl = await toPng(svg, {
    canvasWidth,
    canvasHeight,
    backgroundColor: '#ffffff',
    cacheBust: true,
    skipFonts: false,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  saveAs(blob, filename);
}