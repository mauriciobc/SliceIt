import { ProjectState } from '@/types/infographic';
import { z } from 'zod';

const dimensionsSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

const canvasSchema = z.object({
  aspectRatio: z.enum(['1:1', '4:5', '16:9', '9:16', '4:3', 'Custom']),
  dimensions: dimensionsSchema,
  backgroundColor: z.string(),
  segmentExtension: z.number().optional(),
  textPadding: z.number().optional(),
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
});

const sliceSchema = z.object({
  id: z.string(),
  metric: z.string(),
  label: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  uploadedIconId: z.string().optional(),
});

const projectSchema = z.object({
  version: z.number(),
  canvas: canvasSchema,
  palette: paletteSchema,
  center: centerSchema,
  typography: typographySchema,
  slices: z.array(sliceSchema),
  uploadedIcons: z.array(uploadedImageSchema).optional(),
});

export function validateProject(data: unknown): ProjectState {
  const parsed = projectSchema.parse(data);
  return parsed as ProjectState;
}

export function serializeProject(state: ProjectState): string {
  return JSON.stringify(state, null, 2);
}
