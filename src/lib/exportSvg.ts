import { saveAs } from 'file-saver';
import { useProjectStore } from '@/store/useProjectStore';
import { embedGoogleFonts } from '@/lib/fontEmbed';

export async function exportSvg(filename = 'infographic.svg') {
  const svg = document.getElementById('radial-canvas');
  if (!svg || !(svg instanceof SVGSVGElement)) {
    throw new Error('Canvas SVG not found');
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const { center, typography } = useProjectStore.getState();
  await embedGoogleFonts(clone, [
    center.titleFont,
    center.subtitleFont,
    center.captionFont,
    typography.metricFont,
    typography.labelFont,
  ]);

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, filename);
}
