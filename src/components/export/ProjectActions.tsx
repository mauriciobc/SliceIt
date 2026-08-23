import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { serializeProject, validateProject } from '@/lib/projectSerializer';
import { ProjectState } from '@/types/infographic';
import { Save, FolderOpen, Undo2, Redo2 } from 'lucide-react';
import { useI18n } from '@/i18n';

const RECENT_FILES_KEY = 'sliceit:recentFiles';

function addRecentFile(name: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_FILES_KEY) ?? '[]') as string[];
    const next = [name, ...existing.filter((n) => n !== name)].slice(0, 5);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

/** Ignore shortcuts while the user is typing in an editable control. */
function isEditing(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  );
}

export function ProjectActions() {
  const { t } = useI18n();
  // Narrow selectors: each subscription only re-renders when its own slice
  // changes (subscribing to the whole store re-rendered on every edit).
  const version = useProjectStore((s) => s.version);
  const canvas = useProjectStore((s) => s.canvas);
  const palette = useProjectStore((s) => s.palette);
  const center = useProjectStore((s) => s.center);
  const typography = useProjectStore((s) => s.typography);
  const sliceStyle = useProjectStore((s) => s.sliceStyle);
  const slices = useProjectStore((s) => s.slices);
  const uploadedIcons = useProjectStore((s) => s.uploadedIcons);
  const loadProject = useProjectStore((s) => s.loadProject);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const canUndo = useProjectStore((s) => s.history.past.length > 0);
  const canRedo = useProjectStore((s) => s.history.future.length > 0);
  const reportError = useProjectStore((s) => s.reportError);

  const project = useMemo(
    () => ({
      version,
      canvas,
      palette,
      center,
      typography,
      sliceStyle,
      slices,
      uploadedIcons,
      selectedSliceId: null as string | null,
    }),
    [version, canvas, palette, center, typography, sliceStyle, slices, uploadedIcons]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = useCallback(() => {
    const blob = new Blob([serializeProject(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sliceit-project.json';
    a.click();
    URL.revokeObjectURL(url);
    addRecentFile('sliceit-project.json');
  }, [project]);

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const project = validateProject(data) as ProjectState;
      loadProject(project);
      addRecentFile(file.name);
    } catch {
      // Surface the failure instead of silently ignoring invalid files.
      reportError({ key: 'actions.invalidFile' });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (meta && key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }
      if (meta && key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
      if (isEditing(e)) return;

      if (meta && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (meta && key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, undo, redo]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={undo}
        disabled={!canUndo}
        aria-label={t('actions.undo')}
        title={`${t('actions.undo')} (Ctrl+Z)`}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={redo}
        disabled={!canRedo}
        aria-label={t('actions.redo')}
        title={`${t('actions.redo')} (Ctrl+Shift+Z)`}
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={handleSave}>
        <Save className="mr-1 h-4 w-4" />
        {t('actions.save')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        onClick={() => fileInputRef.current?.click()}
      >
        <label htmlFor="load-project" className="cursor-pointer">
          <FolderOpen className="mr-1 h-4 w-4" />
          {t('actions.load')}
          <input
            ref={fileInputRef}
            id="load-project"
            type="file"
            accept=".json"
            className="sr-only"
            onChange={handleLoad}
          />
        </label>
      </Button>
    </div>
  );
}