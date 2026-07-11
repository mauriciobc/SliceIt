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
  SliceStyleConfig,
  TypographyConfig,
  updateDimensionsForAspectRatio,
  UploadedImage,
  ValidationMessage,
} from '@/types/infographic';
import { createDefaultProject } from '@/lib/sampleData';
import { nanoid } from '@/lib/nanoid';

function validateSliceCount(count: number): Pick<AppState, 'warnings' | 'errors'> {
  const warnings: ValidationMessage[] = [];
  const errors: ValidationMessage[] = [];

  if (count > HARD_MAX_SLICES) {
    errors.push({ key: 'validation.maxSlices', params: { max: HARD_MAX_SLICES } });
  } else if (count > RECOMMENDED_MAX_SLICES) {
    warnings.push({
      key: 'validation.recommendedSlices',
      params: { max: RECOMMENDED_MAX_SLICES },
    });
  }

  if (count < MIN_SLICES) {
    errors.push({ key: 'validation.minSlices', params: { min: MIN_SLICES } });
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
  setSliceStyle(style: Partial<SliceStyleConfig>): void;
  addSlice(): void;
  removeSlice(id: string): void;
  updateSlice(id: string, slice: Partial<Slice>): void;
  reorderSlices(slices: Slice[]): void;
  setSelectedSliceId(id: string | null): void;
  setSlices(slices: Slice[]): void;
  addLogo(image: UploadedImage): void;
  removeLogo(id: string): void;
  addUploadedIcon(image: UploadedImage): void;
  removeUploadedIcon(id: string): void;
  loadProject(project: ProjectState): void;
  resetProject(): void;
  resetIconSettings(): void;
}

export const useProjectStore = create<AppState & ProjectActions>((set) => {
  const createPartialSetter = <T extends object>(field: keyof AppState) =>
    (partial: Partial<T>) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        Object.assign(draft[field] as T, partial);
      }));

  return {
    ...defaultProject,
    warnings: [],
    errors: [],

    setCanvas: createPartialSetter<CanvasConfig>('canvas'),
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

  setPalette: createPartialSetter<PaletteConfig>('palette'),
  setCenter: createPartialSetter<CenterConfig>('center'),
  setTypography: createPartialSetter<TypographyConfig>('typography'),
  setSliceStyle: createPartialSetter<SliceStyleConfig>('sliceStyle'),

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

  addUploadedIcon: (image) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.uploadedIcons.push(image);
    })),

  removeUploadedIcon: (id) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.uploadedIcons = draft.uploadedIcons.filter((icon) => icon.id !== id);
      for (const slice of draft.slices) {
        if (slice.uploadedIconId === id) {
          slice.uploadedIconId = undefined;
        }
      }
    })),

  loadProject: (project) =>
    set((state) => produce(state, (draft: Draft<AppState>) => {
      draft.canvas = project.canvas;
      draft.palette = project.palette;
      draft.center = project.center;
      draft.typography = project.typography;
      draft.sliceStyle = project.sliceStyle;
      draft.slices = project.slices;
      draft.uploadedIcons = project.uploadedIcons ?? [];
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
        draft.sliceStyle = fresh.sliceStyle;
        draft.slices = fresh.slices;
        draft.uploadedIcons = fresh.uploadedIcons;
        draft.selectedSliceId = null;
        recomputeValidation(draft);
      })
    ),

  resetIconSettings: () =>
    set((state) =>
      produce(state, (draft: Draft<AppState>) => {
        draft.typography.iconVerticalPosition = 0.82;
        draft.typography.iconMargin = 8;
        for (const slice of draft.slices) {
          slice.iconVerticalPosition = undefined;
          slice.iconMargin = undefined;
        }
      })
    ),
  }
})
