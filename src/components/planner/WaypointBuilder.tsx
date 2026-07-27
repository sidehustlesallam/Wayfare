import { useState } from 'react';
import { ArrowLeftRight, Route, Trash2 } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import type { GeocodingResult, StopType } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { WaypointList } from './WaypointList';
import { WaypointSearch } from './WaypointSearch';

export function WaypointBuilder() {
  const waypoints = useTripStore((s) => s.waypoints);
  const addWaypoint = useTripStore((s) => s.addWaypoint);
  const removeWaypoint = useTripStore((s) => s.removeWaypoint);
  const reorderWaypoints = useTripStore((s) => s.reorderWaypoints);
  const reverseWaypoints = useTripStore((s) => s.reverseWaypoints);
  const clearAllWaypoints = useTripStore((s) => s.clearAllWaypoints);
  const setStopType = useTripStore((s) => s.setStopType);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleSelect = (result: GeocodingResult) => {
    addWaypoint({
      label: result.label,
      lat: result.lat,
      lng: result.lng,
      stopType: 'must-visit',
      countryCode: result.countryCode,
      countryName: result.countryName,
    });
  };

  const handleStopTypeChange = (id: string, stopType: StopType) => {
    setStopType(id, stopType);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-wayfare-sky" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
            Waypoints
          </h2>
        </div>
        {waypoints.length > 0 ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              disabled={waypoints.length < 2}
              onClick={() => reverseWaypoints()}
              aria-label="Reverse route"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Reverse
            </Button>
            <Button
              variant="danger"
              className="!px-2 !py-1 text-xs"
              onClick={() => setConfirmClearOpen(true)}
              aria-label="Clear all waypoints"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
          </div>
        ) : null}
      </header>

      <WaypointSearch onSelect={handleSelect} />

      {waypoints.length === 0 ? (
        <p className="rounded-md border border-dashed border-wayfare-mist bg-wayfare-mist/40 px-3 py-4 text-center text-sm text-wayfare-slate/70">
          Add a start city to begin your route.
        </p>
      ) : (
        <WaypointList
          waypoints={waypoints}
          onRemove={removeWaypoint}
          onStopTypeChange={handleStopTypeChange}
          onReorder={reorderWaypoints}
        />
      )}

      <Modal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear all waypoints?"
      >
        <p className="mb-4 text-sm text-wayfare-slate">
          This removes every stop, the active route, and fuel totals from your
          current session. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setConfirmClearOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearAllWaypoints();
              setConfirmClearOpen(false);
            }}
          >
            Clear All
          </Button>
        </div>
      </Modal>
    </section>
  );
}
