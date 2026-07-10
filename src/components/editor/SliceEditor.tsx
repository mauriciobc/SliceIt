import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BUILTIN_ICON_NAMES, Slice } from '@/types/infographic';
import { getIconComponent } from '@/lib/icons';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SliceEditor() {
  const slices = useProjectStore((state) => state.slices);
  const selectedSliceId = useProjectStore((state) => state.selectedSliceId);
  const addSlice = useProjectStore((state) => state.addSlice);
  const removeSlice = useProjectStore((state) => state.removeSlice);
  const updateSlice = useProjectStore((state) => state.updateSlice);
  const reorderSlices = useProjectStore((state) => state.reorderSlices);
  const setSelectedSliceId = useProjectStore((state) => state.setSelectedSliceId);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const selectedSlice = slices.find((s) => s.id === selectedSliceId);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = slices.findIndex((s) => s.id === draggedId);
    const toIndex = slices.findIndex((s) => s.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...slices];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    reorderSlices(next);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{slices.length} slices</div>
        <Button size="sm" onClick={addSlice}>
          <Plus className="mr-1 h-4 w-4" />
          Add Slice
        </Button>
      </div>

      <div className="space-y-2">
        {slices.map((slice, index) => (
          <SliceListItem
            key={slice.id}
            slice={slice}
            index={index}
            isSelected={slice.id === selectedSliceId}
            isDragging={draggedId === slice.id}
            draggable
            onSelect={() => setSelectedSliceId(slice.id)}
            onUpdate={(updates) => updateSlice(slice.id, updates)}
            onRemove={() => removeSlice(slice.id)}
            onDragStart={() => handleDragStart(slice.id)}
            onDragOver={(e) => handleDragOver(e, slice.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {selectedSlice && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Edit Selected Slice</h3>
            <SliceForm slice={selectedSlice} onUpdate={(u) => updateSlice(selectedSlice.id, u)} />
          </div>
        </>
      )}
    </div>
  );
}

interface SliceListItemProps {
  slice: Slice;
  index: number;
  isSelected: boolean;
  isDragging?: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Slice>) => void;
  onRemove: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

function SliceListItem({
  slice,
  index,
  isSelected,
  isDragging,
  draggable,
  onSelect,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: SliceListItemProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-2 rounded-md border p-2 transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
        isDragging && 'opacity-50'
      )}
    >
      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />
      <div className="flex flex-1 items-center gap-2">
        <input
          type="color"
          value={slice.color ?? '#000000'}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="h-6 w-6 flex-shrink-0 cursor-pointer rounded border p-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Slice color"
        />
        <button
          type="button"
          onClick={onSelect}
          className="flex-1 truncate text-left text-sm font-medium"
        >
          {slice.label || `Slice ${index + 1}`}
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Remove slice"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface SliceFormProps {
  slice: Slice;
  onUpdate: (updates: Partial<Slice>) => void;
}

function SliceForm({ slice, onUpdate }: SliceFormProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="slice-metric">Metric</Label>
        <Input
          id="slice-metric"
          value={slice.metric}
          onChange={(e) => onUpdate({ metric: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slice-label">Label</Label>
        <Input
          id="slice-label"
          value={slice.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slice-color">Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="slice-color"
            type="color"
            value={slice.color ?? '#000000'}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-9 w-14 px-1 py-1"
          />
          <Input
            type="text"
            value={slice.color ?? ''}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="slice-icon">Icon</Label>
        <Select value={slice.icon ?? ''} onValueChange={(v) => onUpdate({ icon: v || undefined })}>
          <SelectTrigger id="slice-icon">
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {BUILTIN_ICON_NAMES.map((name) => {
              const Icon = getIconComponent(name);
              return (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
