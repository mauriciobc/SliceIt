import { embedGoogleFonts } from './fontEmbed';
import { ProjectState } from '@/types/infographic';

export function getExportFonts(state: { center: ProjectState['center']; typography: ProjectState['typography'] }) {
  return [
    state.center.titleFont,
    state.center.subtitleFont,
    state.center.captionFont,
    state.typography.metricFont,
    state.typography.labelFont,
  ];
}

export async function embedExportFonts(svg: SVGSVGElement, state: ProjectState) {
  await embedGoogleFonts(svg, getExportFonts(state));
}