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
import { Route } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import type { GeocodingResult, StopType } from '../../types';
import { WaypointItem } from './WaypointItem';
import { WaypointSearch } from './WaypointSearch';

export function WaypointBuilder() {
  const waypoints = useTripStore((s) => s.waypoints);
  const addWaypoint = useTripStore((s) => s.addWaypoint);
  const removeWaypoint = useTripStore((s) => s.removeWaypoint);
  const reorderWaypoints = useTripStore((s) => s.reorderWaypoints);
  const setStopType = useTripStore((s) => s.setStopType);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSelect = (result: GeocodingResult) => {
    addWaypoint({
      label: result.label,
      lat: result.lat,
      lng: result.lng,
      stopType: 'must-visit',
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = waypoints.findIndex((wp) => wp.id === active.id);
    const toIndex = waypoints.findIndex((wp) => wp.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    reorderWaypoints(fromIndex, toIndex);
  };

  const handleStopTypeChange = (id: string, stopType: StopType) => {
    setStopType(id, stopType);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Route className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Waypoints
        </h2>
      </header>

      <WaypointSearch onSelect={handleSelect} />

      {waypoints.length === 0 ? (
        <p className="rounded-md border border-dashed border-wayfare-mist bg-wayfare-mist/40 px-3 py-4 text-center text-sm text-wayfare-slate/70">
          Add a start city to begin your route.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={waypoints.map((wp) => wp.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {waypoints.map((waypoint, index) => (
                <WaypointItem
                  key={waypoint.id}
                  waypoint={waypoint}
                  index={index}
                  onRemove={removeWaypoint}
                  onStopTypeChange={handleStopTypeChange}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
