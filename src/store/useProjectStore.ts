import { create } from 'zustand';
import { produce, type Draft } from 'immer';
import {
  AppState,
  AspectRatioPreset,
  CanvasConfig,
  CenterConfig,
  Dimensions,
  HARD_MAX_SLICES,
  MIN_SLICES,
  PaletteConfig,
  ProjectState,
  RECOMMENDED_MAX_SLICES,
  Slice,
  TypographyConfig,
  updateDimensionsForAspectRatio,
  UploadedImage,
} from '@/types/infographic';
import { createDefaultProject } from '@/lib/sampleData';
import { nanoid } from '@/lib/nanoid';

function validateSliceCount(count: number): Pick<AppState, 'warnings' | 'errors'> {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (count > HARD_MAX_SLICES) {
    errors.push(`Maximum ${HARD_MAX_SLICES} slices allowed.`);
  } else if (count > RECOMMENDED_MAX_SLICES) {
    warnings.push('More than 24 slices may reduce readability.');
  }

  if (count < MIN_SLICES) {
    errors.push(`At least ${MIN_SLICES} slices are required.`);
  }

  return { warnings, errors };
}

function recomputeValidation(draft: AppState) {
  const { warnings, errors } = validateSliceCount(draft.slices.length);
  draft.warnings = warnings;
  draft.errors = errors;
}

function createEmptySlice(): Slice {
  return {
    id: nanoid(),
    metric: '0',
    label: 'NEW SLICE',
  };
}

const defaultProject = createDefaultProject();

interface ProjectActions {
  setCanvas(canvas: Partial<CanvasConfig>): void;
  setAspectRatio(aspectRatio: AspectRatioPreset): void;
  setCustomDimensions(dimensions: Dimensions): void;
  setPalette(palette: Partial<PaletteConfig>): void;
  setCenter(center: Partial<CenterConfig>): void;
  setTypography(typography: Partial<TypographyConfig>): void;
  addSlice(): void;
  removeSlice(id: string): void;
  updateSlice(id: string, slice: Partial<Slice>): void;
  reorderSlices(slices: Slice[]): void;
  setSelectedSliceId(id: string | null): void;
  setSlices(slices: Slice[]): void;
  addLogo(image: UploadedImage): void;
  removeLogo(id: string): void;
  addUploadedIcon(image: UploadedImage): void;
  loadProject(project: ProjectState): void;
  resetProject(): void;
}

export const useProjectStore = create<AppState & ProjectActions>((set) => ({
  ...defaultProject,
  warnings: [],
  errors: [],

  setCanvas: (canvas) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      Object.assign(draft.canvas, canvas);
    })),

  setAspectRatio: (aspectRatio) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.canvas.aspectRatio = aspectRatio;
      draft.canvas.dimensions = updateDimensionsForAspectRatio(
        aspectRatio,
        draft.canvas.dimensions
      );
    })),

  setCustomDimensions: (dimensions) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.canvas.dimensions = dimensions;
      draft.canvas.aspectRatio = 'Custom';
    })),

  setPalette: (palette) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      Object.assign(draft.palette, palette);
    })),

  setCenter: (center) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      Object.assign(draft.center, center);
    })),

  setTypography: (typography) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      Object.assign(draft.typography, typography);
    })),

  addSlice: () =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      if (draft.slices.length >= HARD_MAX_SLICES) return;
      draft.slices.push(createEmptySlice());
      recomputeValidation(draft);
    })),

  removeSlice: (id) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      if (draft.slices.length <= MIN_SLICES) return;
      draft.slices = draft.slices.filter((slice) => slice.id !== id);
      if (draft.selectedSliceId === id) {
        draft.selectedSliceId = null;
      }
      recomputeValidation(draft);
    })),

  updateSlice: (id, slice) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      const target = draft.slices.find((s) => s.id === id);
      if (!target) return;
      Object.assign(target, slice);
    })),

  reorderSlices: (slices) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.slices = slices;
    })),

  setSelectedSliceId: (id) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.selectedSliceId = id;
    })),

  setSlices: (slices) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.slices = slices;
      recomputeValidation(draft);
    })),

  addLogo: (image) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      if (draft.center.logos.length >= 3) return;
      draft.center.logos.push(image);
    })),

  removeLogo: (id) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.center.logos = draft.center.logos.filter((logo) => logo.id !== id);
    })),

  addUploadedIcon: () => {
    // Uploaded icons are stored in a separate registry; kept simple here.
    // TODO: implement dedicated icon upload registry when needed.
  },

  loadProject: (project) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.canvas = project.canvas;
      draft.palette = project.palette;
      draft.center = project.center;
      draft.typography = project.typography;
      draft.slices = project.slices;
      draft.selectedSliceId = null;
      recomputeValidation(draft);
    })),

  resetProject: () =>
    set((state) =>
      produce(state, (draft: Draft<AppState>) => {
        const fresh = createDefaultProject();
        draft.canvas = fresh.canvas;
        draft.palette = fresh.palette;
        draft.center = fresh.center;
        draft.typography = fresh.typography;
        draft.slices = fresh.slices;
        draft.selectedSliceId = null;
        recomputeValidation(draft);
      })
    ),
}));
