import { ProjectState } from '@/types/infographic';
import { z } from 'zod';
import { createDefaultProject } from './sampleData';

const defaults = createDefaultProject();

const dimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

const canvasSchema = z.object({
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16', '4:3', 'Custom']),
  dimensions: dimensionsSchema,
  backgroundColor: z.string(),
  segmentExtension: z.number().default(defaults.canvas.segmentExtension),
  textPadding: z.number().default(defaults.canvas.textPadding),
  innerRadiusRatio: z.number().optional(),
  showDividers: z.boolean().optional(),
  dividerWidth: z.number().optional(),
});

const paletteSchema = z.object({
  mode: z.enum(['single', 'gradient', 'manual']),
  singleColor: z.string(),
  gradientStart: z.string(),
  gradientEnd: z.string(),
});

const uploadedImageSchema = z.object({
  id: z.string(),
  name: z.string(),
  dataUrl: z.string(),
  type: z.enum(['image/svg+xml', 'image/png']),
});

const centerSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  footerCaption: z.string(),
  titleFont: z.string(),
  subtitleFont: z.string(),
  captionFont: z.string(),
  titleColor: z.string(),
  subtitleColor: z.string(),
  captionColor: z.string(),
  centerColorOverride: z.string().optional(),
  logos: z.array(uploadedImageSchema),
  logoPlacement: z.enum(['top', 'center', 'bottom', 'auto']),
});

const typographySchema = z.object({
  metricFont: z.string(),
  labelFont: z.string(),
  metricColor: z.string(),
  labelColor: z.string(),
  showIcons: z.boolean(),
  iconSize: z.number(),
  metricLabelGap: z.number().default(defaults.typography.metricLabelGap),
  iconVerticalPosition: z.number().default(defaults.typography.iconVerticalPosition),
  iconMargin: z.number().default(defaults.typography.iconMargin),
  iconPlacement: z.enum(['inner', 'outer']).optional(),
  rotateText: z.boolean().optional(),
  metricFontWeight: z.number().optional(),
  textAlign: z.enum(['start', 'middle', 'end']).optional(),
});

const sliceSchema = z.object({
  id: z.string(),
  metric: z.string(),
  label: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  uploadedIconId: z.string().optional(),
  iconVerticalPosition: z.number().optional(),
  iconMargin: z.number().optional(),
});

const sliceStyleSchema = z.object({
  fillMode: z.enum(['solid', 'radial']),
  gradientIntensity: z.number(),
});

const projectSchema = z.object({
  version: z.number(),
  canvas: canvasSchema.default(defaults.canvas),
  palette: paletteSchema.default(defaults.palette),
  center: centerSchema.default(defaults.center),
  typography: typographySchema.default(defaults.typography),
  sliceStyle: sliceStyleSchema.default(defaults.sliceStyle),
  slices: z.array(sliceSchema),
  uploadedIcons: z.array(uploadedImageSchema).default(defaults.uploadedIcons),
});

export function validateProject(data: unknown): ProjectState {
  const parsed = projectSchema.parse(data);
  return {
    ...parsed,
    selectedSliceId: null,
  };
}

export function serializeProject(state: ProjectState): string {
  return JSON.stringify(state, null, 2);
}