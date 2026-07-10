import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { serializeProject, validateProject } from '@/lib/projectSerializer';
import { ProjectState } from '@/types/infographic';
import { Save, FolderOpen } from 'lucide-react';

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

export function ProjectActions() {
  const state = useProjectStore();
  const project = useMemo(
    () => ({
      version: state.version,
      canvas: state.canvas,
      palette: state.palette,
      center: state.center,
      typography: state.typography,
      slices: state.slices,
      selectedSliceId: null as string | null,
    }),
    [state.version, state.canvas, state.palette, state.center, state.typography, state.slices]
  );
  const loadProject = useProjectStore((s) => s.loadProject);
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
      // ignore invalid project files
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
      if (meta && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleSave}>
        <Save className="mr-1 h-4 w-4" />
        Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        onClick={() => fileInputRef.current?.click()}
      >
        <label htmlFor="load-project" className="cursor-pointer">
          <FolderOpen className="mr-1 h-4 w-4" />
          Load
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
