import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDefaultProject, DEFAULT_SLICES, DEFAULT_SLICES_PT_BR } from '@/lib/sampleData';
import { useProjectStore } from '@/store/useProjectStore';
import { setLocale } from '@/i18n/runtime';

// Restore the default locale after each test so module-level locale state
// (currentLocale + the persisted storage key) stays 'en'.
function resetLocalStorage() {
  window.localStorage.removeItem('sliceit:locale');
}

describe('locale-aware default project data', () => {
  afterEach(() => {
    setLocale('en');
    resetLocalStorage();
  });

  it('keeps the English example for the default locale', () => {
    const project = createDefaultProject('en');
    expect(project.slices.map((s) => s.label)).toContain('API CALLS PROCESSED');
    expect(project.center.title).toBe('EVERY');
    expect(project.center.subtitle).toBe('MINUTE');
    expect(project.canvas.sourceNote).toBe('Source: SliceIt sample data');
    expect(project.center.emblemIcon).toBe('AlarmClock');
  });

  it('exposes a Brazilian-familiar example for pt-BR', () => {
    const project = createDefaultProject('pt-BR');
    expect(project.slices.map((s) => s.label)).toEqual(
      expect.arrayContaining(['POPULAÇÃO', 'TÍTULOS DA COPA', 'TURISTAS NO CARNAVAL'])
    );
    expect(project.center.title).toBe('BRASIL');
    expect(project.center.subtitle).toBe('EM NÚMEROS');
    expect(project.canvas.sourceNote).toBe('Fonte: dados de exemplo do SliceIt');
    expect(project.center.emblemIcon).toBe('Flag');
    // Same slice count as the English example so the layout stays balanced.
    expect(project.slices).toHaveLength(DEFAULT_SLICES.length);
  });

  it('uses the current active locale by default', () => {
    setLocale('pt-BR');
    const project = createDefaultProject();
    expect(project.slices[0].label).toBe(DEFAULT_SLICES_PT_BR[0].label);
    expect(project.center.title).toBe('BRASIL');
  });
});

describe('store: locale switch swaps only pristine default data', () => {
  beforeEach(() => {
    localStorage.removeItem('sliceit:locale');
    setLocale('en');
    useProjectStore.getState().resetProject();
  });

  afterEach(() => {
    useProjectStore.getState().resetProject();
    setLocale('en');
    resetLocalStorage();
  });

  it('initial default project follows the persisted locale', () => {
    setLocale('pt-BR');
    const fresh = createDefaultProject();
    // The store seeded at module load reflects getLocale() at import time;
    // resetProject re-seeds with the current locale, which is what a fresh
    // session under pt-BR would show.
    useProjectStore.getState().resetProject();
    expect(useProjectStore.getState().slices[0].label).toBe(fresh.slices[0].label);
    expect(useProjectStore.getState().center.title).toBe('BRASIL');
  });

  it('switches pristine default to the Brazilian example when locale changes', () => {
    expect(useProjectStore.getState().center.title).toBe('EVERY');
    setLocale('pt-BR');
    const state = useProjectStore.getState();
    expect(state.center.title).toBe('BRASIL');
    expect(state.slices[0].label).toBe(DEFAULT_SLICES_PT_BR[0].label);
    expect(state.history.past).toHaveLength(0);
    expect(state.history.future).toHaveLength(0);
  });

  it('switches back to English when locale returns to en', () => {
    setLocale('pt-BR');
    expect(useProjectStore.getState().center.title).toBe('BRASIL');
    setLocale('en');
    expect(useProjectStore.getState().center.title).toBe('EVERY');
    expect(useProjectStore.getState().slices[0].label).toBe('API CALLS PROCESSED');
  });

  it('does not clobber user edits when the locale changes', () => {
    const state = useProjectStore.getState();
    state.updateSlice(state.slices[0].id, { label: 'MY CUSTOM LABEL' });

    setLocale('pt-BR');

    const after = useProjectStore.getState();
    expect(after.slices[0].label).toBe('MY CUSTOM LABEL');
    expect(after.center.title).toBe('EVERY');
  });

  it('does not clobber a loaded project when the locale changes', () => {
    const custom = createDefaultProject('en');
    custom.center.title = 'CUSTOM';
    custom.slices = custom.slices.map((s, i) => ({ ...s, label: `CUSTOM ${i}` }));
    useProjectStore.getState().loadProject(custom);

    setLocale('pt-BR');

    const after = useProjectStore.getState();
    expect(after.center.title).toBe('CUSTOM');
    expect(after.slices[0].label).toBe('CUSTOM 0');
  });

  it('tracks the applied default locale across consecutive switches', () => {
    // en -> pt-BR -> keep pt-BR (no pending swap) -> en
    setLocale('pt-BR');
    expect(useProjectStore.getState().center.title).toBe('BRASIL');
    // Changing to the same locale is a no-op for the subscription.
    setLocale('pt-BR');
    expect(useProjectStore.getState().center.title).toBe('BRASIL');
    setLocale('en');
    expect(useProjectStore.getState().center.title).toBe('EVERY');
  });

  it('only ever swaps when the project still matches the previous locale default', () => {
    // A project that is byte-identical to the English sample (e.g. an exported
    // fresh default) is treated as the pristine default, so it follows the
    // locale. Custom content never is.
    const pristineEn = createDefaultProject('en');
    useProjectStore.getState().loadProject(pristineEn);
    setLocale('pt-BR');
    expect(useProjectStore.getState().slices[0].label).toBe(DEFAULT_SLICES_PT_BR[0].label);
    expect(useProjectStore.getState().center.title).toBe('BRASIL');

    // And it swaps back the other way.
    useProjectStore.getState().loadProject(createDefaultProject('pt-BR'));
    setLocale('en');
    expect(useProjectStore.getState().center.title).toBe('EVERY');
  });
});