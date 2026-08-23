// Resolution presets shared between the export UI and the PNG exporter.
// Kept in its own module so the UI can reference it without pulling in the
// heavyweight html-to-image pipeline.
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
