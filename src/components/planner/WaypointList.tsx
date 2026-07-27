import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { StopType, Waypoint } from '../../types';
import { WaypointItem } from './WaypointItem';

interface WaypointListProps {
  waypoints: Waypoint[];
  onRemove: (id: string) => void;
  onStopTypeChange: (id: string, stopType: StopType) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function WaypointList({
  waypoints,
  onRemove,
  onStopTypeChange,
  onReorder,
}: WaypointListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = waypoints.findIndex((wp) => wp.id === active.id);
    const toIndex = waypoints.findIndex((wp) => wp.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    onReorder(fromIndex, toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={waypoints.map((wp) => wp.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2" aria-label="Waypoint list">
          {waypoints.map((waypoint, index) => (
            <WaypointItem
              key={waypoint.id}
              waypoint={waypoint}
              index={index}
              onRemove={onRemove}
              onStopTypeChange={onStopTypeChange}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
