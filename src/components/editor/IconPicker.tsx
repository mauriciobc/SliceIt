import { useMemo, useState, createElement } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UploadedImage } from '@/types/infographic';
import { getIconComponent, searchIconNames } from '@/lib/icons';
import { cn } from '@/lib/utils';

const MAX_RESULTS = 300;

function BuiltinIcon({ name, className }: { name: string; className?: string }) {
  const Icon = getIconComponent(name);
  return Icon ? createElement(Icon, { className }) : null;
}

interface IconPickerProps {
  value: string | undefined;
  uploadedValue: string | undefined;
  uploadedIcons: UploadedImage[];
  onSelectBuiltin: (name: string | undefined) => void;
  onSelectUploaded: (id: string | undefined) => void;
  onUpload: (file: File) => void;
}

export function IconPicker({
  value,
  uploadedValue,
  uploadedIcons,
  onSelectBuiltin,
  onSelectUploaded,
  onUpload,
}: IconPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchIconNames(query), [query]);
  const visibleResults = results.slice(0, MAX_RESULTS);
  const hasMore = results.length > MAX_RESULTS;

  const selectedUploaded = uploadedIcons.find((i) => i.id === uploadedValue);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const selectBuiltin = (name: string) => {
    onSelectBuiltin(name);
    setOpen(false);
  };

  const selectUploaded = (id: string) => {
    onSelectUploaded(id);
    setOpen(false);
  };

  const clearSelection = () => {
    onSelectBuiltin(undefined);
    onSelectUploaded(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-sm hover:bg-muted/50"
        >
          {selectedUploaded ? (
            <img src={selectedUploaded.dataUrl} alt="" className="h-4 w-4 object-contain" />
          ) : value ? (
            <BuiltinIcon name={value} className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
          <span className="flex-1 truncate text-left text-muted-foreground">
            {selectedUploaded
              ? selectedUploaded.name
              : value
                ? value
                : 'Select an icon'}
          </span>
          {selectedUploaded || value ? (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons\u2026"
              className="pl-8"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="icon-picker-upload"
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted/50"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload SVG/PNG
              <input
                id="icon-picker-upload"
                type="file"
                accept=".svg,.png"
                className="sr-only"
                onChange={handleUpload}
              />
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={clearSelection}
            >
              None
            </Button>
          </div>

          {uploadedIcons.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Uploaded
              </div>
              <div className="grid grid-cols-8 gap-1">
                {uploadedIcons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    title={icon.name}
                    onClick={() => selectUploaded(icon.id)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted/50',
                      uploadedValue === icon.id && 'border-primary bg-primary/5'
                    )}
                  >
                    <img src={icon.dataUrl} alt={icon.name} className="h-5 w-5 object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {results.length} icons
          </div>
          <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto rounded-md border p-2">
            {visibleResults.map((name) => {
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => selectBuiltin(name)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted/50',
                    value === name && 'bg-primary/10 ring-1 ring-primary'
                  )}
                >
                  {<BuiltinIcon name={name} className="h-5 w-5" />}
                </button>
              );
            })}
            {results.length === 0 && (
              <div className="col-span-8 py-4 text-center text-xs text-muted-foreground">
                No icons found
              </div>
            )}
          </div>
          {hasMore && (
            <div className="text-center text-[10px] text-muted-foreground">
              Showing {MAX_RESULTS} of {results.length} \u2014 refine your search
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
