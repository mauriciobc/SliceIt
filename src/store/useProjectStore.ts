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
import {
  canRedo,
  canUndo,
  popUndo,
  pushHistory,
  snapshotProject,
} from '@/lib/history';
import type { ProjectSnapshot } from '@/types/infographic';
import { createDefaultProject } from '@/lib/sampleData';
import { nanoid } from '@/lib/nanoid';
import { getLocale, subscribeLocaleChange } from '@/i18n/runtime';
import type { Locale } from '@/i18n/translations';

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

function applySnapshot(draft: AppState, snapshot: ProjectSnapshot) {
  draft.canvas = snapshot.canvas;
  draft.palette = snapshot.palette;
  draft.center = snapshot.center;
  draft.typography = snapshot.typography;
  draft.sliceStyle = snapshot.sliceStyle;
  draft.slices = snapshot.slices;
  draft.uploadedIcons = snapshot.uploadedIcons;
  draft.selectedSliceId = null;
  recomputeValidation(draft);
}

function createEmptySlice(): Slice {
  return {
    id: nanoid(),
    metric: '0',
    label: 'NEW SLICE',
  };
}

const defaultProject = createDefaultProject();

/**
 * Serialize only the user-facing project content, dropping id fields (slice
 * ids, logo ids, uploaded-icon ids) so two structurally identical projects are
 * comparable regardless of generated ids.
 */
function toComparableProject(state: AppState | ProjectState): string {
  return JSON.stringify(
    {
      canvas: state.canvas,
      palette: state.palette,
      center: state.center,
      typography: state.typography,
      sliceStyle: state.sliceStyle,
      slices: state.slices,
      uploadedIcons: state.uploadedIcons,
    },
    (key, value) => (key === 'id' ? undefined : value)
  );
}

function isDefaultContent(state: AppState, locale: Locale): boolean {
  return toComparableProject(state) === toComparableProject(createDefaultProject(locale));
}

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
  undo(): void;
  redo(): void;
  reportError(error: ValidationMessage): void;
}

export const useProjectStore = create<AppState & ProjectActions>((set) => {
  const createPartialSetter = <T extends object>(field: keyof AppState) =>
    (partial: Partial<T>) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        Object.assign(draft[field] as T, partial);
      }));

  return {
    ...defaultProject,
    warnings: [],
    errors: [],
    history: { past: [], future: [] },

    setCanvas: createPartialSetter<CanvasConfig>('canvas'),
    setAspectRatio: (aspectRatio) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.canvas.aspectRatio = aspectRatio;
        draft.canvas.dimensions = updateDimensionsForAspectRatio(
          aspectRatio,
          draft.canvas.dimensions
        );
      })),

    setCustomDimensions: (dimensions) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
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
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.slices.push(createEmptySlice());
        recomputeValidation(draft);
      })),

    removeSlice: (id) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        if (draft.slices.length <= MIN_SLICES) return;
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
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
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        Object.assign(target, slice);
      })),

    reorderSlices: (slices) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.slices = slices;
      })),

    setSelectedSliceId: (id) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.selectedSliceId = id;
      })),

    setSlices: (slices) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.slices = slices;
        recomputeValidation(draft);
      })),

    addLogo: (image) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        if (draft.center.logos.length >= 3) return;
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.center.logos.push(image);
      })),

    removeLogo: (id) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.center.logos = draft.center.logos.filter((logo) => logo.id !== id);
      })),

    addUploadedIcon: (image) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.uploadedIcons.push(image);
      })),

    removeUploadedIcon: (id) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        draft.uploadedIcons = draft.uploadedIcons.filter((icon) => icon.id !== id);
        for (const slice of draft.slices) {
          if (slice.uploadedIconId === id) {
            slice.uploadedIconId = undefined;
          }
        }
      })),

    loadProject: (project) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
        applySnapshot(draft, project);
        // Load is a hard boundary: the loaded project starts with its own history.
        draft.history = { past: [], future: [] };
      })),

    resetProject: () =>
      set((state) =>
        produce(state, (draft: Draft<AppState>) => {
          draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
          applySnapshot(draft, createDefaultProject());
          draft.history = { past: [], future: [] };
        })
      ),

    resetIconSettings: () =>
      set((state) =>
        produce(state, (draft: Draft<AppState>) => {
          draft.history = pushHistory(draft.history, snapshotProject(state), Date.now());
          draft.typography.iconVerticalPosition = 0.82;
          draft.typography.iconMargin = 8;
          for (const slice of draft.slices) {
            slice.iconVerticalPosition = undefined;
            slice.iconMargin = undefined;
          }
        })
      ),

    undo: () =>
      set((state) =>
        produce(state, (draft: Draft<AppState>) => {
          const { history, snapshot } = popUndo(draft.history);
          if (!snapshot) return;
          const current = snapshotProject(draft);
          draft.history = {
            past: history.past,
            future: [{ snapshot: current, timestamp: Date.now() }, ...history.future],
          };
          applySnapshot(draft, snapshot);
        })
      ),

    redo: () =>
      set((state) =>
        produce(state, (draft: Draft<AppState>) => {
          const future = draft.history.future;
          if (future.length === 0) return;
          const [snapshot, ...rest] = future;
          const current = snapshotProject(draft);
          draft.history = {
            past: [...draft.history.past, { snapshot: current, timestamp: Date.now() }],
            future: rest,
          };
          applySnapshot(draft, snapshot.snapshot);
        })
      ),

    reportError: (error) =>
      set((state) => produce(state, (draft: Draft<AppState>) => {
        draft.errors = [...draft.errors, error];
      })),
  };
});

// Keep the pristine starter project in sync with the active language: when the
// locale changes and the current project is still the untouched default sample
// (nothing edited, no logo/icon upload), swap it for the new locale's example.
// Edited or loaded projects are never clobbered.
let appliedDefaultLocale: Locale = getLocale();

subscribeLocaleChange(() => {
  const nextLocale = getLocale();
  if (nextLocale === appliedDefaultLocale) return;
  const previousLocale = appliedDefaultLocale;
  appliedDefaultLocale = nextLocale;

  const state = useProjectStore.getState();
  if (isDefaultContent(state, previousLocale)) {
    state.resetProject();
  }
});

// Re-exported convenience selectors for toolbar enable/disable states.
export { canUndo, canRedo };