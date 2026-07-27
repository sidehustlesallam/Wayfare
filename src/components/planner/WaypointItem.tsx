import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Moon, Star, Trash2 } from 'lucide-react';
import type { StopType, Waypoint } from '../../types';
import { Button } from '../common/Button';

interface WaypointItemProps {
  waypoint: Waypoint;
  index: number;
  onRemove: (id: string) => void;
  onStopTypeChange: (id: string, stopType: StopType) => void;
}

export function WaypointItem({
  waypoint,
  index,
  onRemove,
  onStopTypeChange,
}: WaypointItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: waypoint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOvernight = waypoint.stopType === 'overnight';

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 rounded-md border border-wayfare-mist bg-white p-2 ${
        isDragging ? 'z-10 opacity-90 shadow-panel' : ''
      }`}
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-wayfare-slate/40 hover:text-wayfare-slate active:cursor-grabbing"
        aria-label={`Drag to reorder ${waypoint.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wayfare-sky/15 text-[11px] font-bold text-wayfare-sky">
            {index + 1}
          </span>
          <p className="truncate text-sm font-semibold text-wayfare-ink">
            {waypoint.label}
          </p>
        </div>
        <p className="mt-0.5 text-[11px] text-wayfare-slate/60">
          {waypoint.lat.toFixed(3)}, {waypoint.lng.toFixed(3)}
        </p>
        <div className="mt-2 flex gap-1">
          <button
            type="button"
            onClick={() => onStopTypeChange(waypoint.id, 'must-visit')}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition ${
              !isOvernight
                ? 'bg-wayfare-sky/15 text-wayfare-sky'
                : 'text-wayfare-slate/60 hover:bg-wayfare-mist'
            }`}
          >
            <Star className="h-3 w-3" />
            Must visit
          </button>
          <button
            type="button"
            onClick={() => onStopTypeChange(waypoint.id, 'overnight')}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition ${
              isOvernight
                ? 'bg-wayfare-forest/15 text-wayfare-forest'
                : 'text-wayfare-slate/60 hover:bg-wayfare-mist'
            }`}
          >
            <Moon className="h-3 w-3" />
            Overnight
          </button>
        </div>
      </div>

      <Button
        variant="ghost"
        className="!px-2 !py-1 text-wayfare-danger"
        aria-label={`Remove ${waypoint.label}`}
        onClick={() => onRemove(waypoint.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}
