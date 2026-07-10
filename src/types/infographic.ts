export type AspectRatioPreset = '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | 'Custom';

export type LayoutMode = 'square' | 'landscape' | 'portrait';

export interface Dimensions {
  width: number;
  height: number;
}

export interface CanvasConfig {
  aspectRatio: AspectRatioPreset;
  dimensions: Dimensions;
  backgroundColor: string;
}

export type PaletteMode = 'single' | 'gradient' | 'manual';

export interface PaletteConfig {
  mode: PaletteMode;
  singleColor: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
  type: 'image/svg+xml' | 'image/png';
}

export type LogoPlacement = 'top' | 'center' | 'bottom' | 'auto';

export interface CenterConfig {
  title: string;
  subtitle: string;
  footerCaption: string;
  titleFont: string;
  subtitleFont: string;
  captionFont: string;
  titleColor: string;
  subtitleColor: string;
  captionColor: string;
  centerColorOverride?: string;
  logos: UploadedImage[];
  logoPlacement: LogoPlacement;
}

export interface Slice {
  id: string;
  metric: string;
  label: string;
  color?: string;
  icon?: string;
  uploadedIconId?: string;
}

export interface TypographyConfig {
  metricFont: string;
  labelFont: string;
  metricColor: string;
  labelColor: string;
  showIcons: boolean;
  iconSize: number;
}

export interface ProjectState {
  version: number;
  canvas: CanvasConfig;
  palette: PaletteConfig;
  center: CenterConfig;
  typography: TypographyConfig;
  slices: Slice[];
  selectedSliceId: string | null;
}

export interface ValidationMessage {
  key: string;
  params?: Record<string, string | number>;
}

export interface EditorState {
  warnings: ValidationMessage[];
  errors: ValidationMessage[];
}

export type AppState = ProjectState & EditorState;

export const MIN_SLICES = 4;
export const RECOMMENDED_MAX_SLICES = 24;
export const HARD_MAX_SLICES = 36;

export const ASPECT_RATIOS: Record<AspectRatioPreset, Dimensions> = {
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '4:3': { width: 1600, height: 1200 },
  Custom: { width: 1080, height: 1080 },
};

export function updateDimensionsForAspectRatio(
  aspectRatio: AspectRatioPreset,
  current: Dimensions
): Dimensions {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1080, height: 1080 };
    case '4:5':
      return { width: 1080, height: 1350 };
    case '16:9':
      return { width: 1920, height: 1080 };
    case '9:16':
      return { width: 1080, height: 1920 };
    case '4:3':
      return { width: 1600, height: 1200 };
    case 'Custom':
    default:
      return { ...current };
  }
}

export const GOOGLE_FONT_OPTIONS = [
  'Inter',
  'Montserrat',
  'Oswald',
  'Roboto Condensed',
  'Poppins',
  'Bebas Neue',
  'Anton',
];

export const BUILTIN_ICON_NAMES = [
  'Cloud',
  'Database',
  'Server',
  'HardDrive',
  'Shield',
  'Fingerprint',
  'Activity',
  'Network',
  'GitBranch',
  'BrainCircuit',
  'Container',
  'Globe',
];
