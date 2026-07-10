import { saveAs } from 'file-saver';

export async function exportSvg(filename = 'infographic.svg') {
  const svg = document.getElementById('radial-canvas');
  if (!svg || !(svg instanceof SVGSVGElement)) {
    throw new Error('Canvas SVG not found');
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Inline computed styles from the original SVG so exported file renders correctly
  const computedStyles = window.getComputedStyle(svg);
  clone.style.fontFamily = computedStyles.fontFamily;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, filename);
}
