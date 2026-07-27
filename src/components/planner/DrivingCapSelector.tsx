import { AlertTriangle, Clock, MapPinned } from 'lucide-react';
import { DRIVING_CAP_OPTIONS } from '../../config/defaults';
import { useTripStore } from '../../store/useTripStore';
import { formatDuration } from '../../utils/fuel';
import { Card } from '../common/Card';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';

export function DrivingCapSelector() {
  const drivingCapHours = useTripStore((s) => s.settings.drivingCapHours);
  const setDrivingCapHours = useTripStore((s) => s.setDrivingCapHours);
  const segments = useTripStore((s) => s.segments);
  const waypoints = useTripStore((s) => s.waypoints);
  const insertWaypoint = useTripStore((s) => s.insertWaypoint);
  const isRouting = useTripStore((s) => s.isRouting);

  const overCapSegments = segments.filter((segment) => segment.exceedsCap);

  const options = DRIVING_CAP_OPTIONS.map((hours) => ({
    value: String(hours),
    label: `${hours} hours / day`,
  }));

  const resolveLabel = (fromId: string, toId: string): string => {
    const from = waypoints.find((wp) => wp.id === fromId)?.label ?? 'Start';
    const to = waypoints.find((wp) => wp.id === toId)?.label ?? 'End';
    return `${from} → ${to}`;
  };

  const handleInsertStop = (
    segmentFromId: string,
    segmentToId: string,
    coords: [number, number],
    label: string,
  ) => {
    const toIndex = waypoints.findIndex((wp) => wp.id === segmentToId);
    const fromIndex = waypoints.findIndex((wp) => wp.id === segmentFromId);
    const insertAt = toIndex >= 0 ? toIndex : fromIndex + 1;

    insertWaypoint(
      {
        label: `Break: ${label}`,
        lat: coords[0],
        lng: coords[1],
        stopType: 'overnight',
      },
      insertAt,
    );
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Daily driving cap
        </h2>
      </header>

      <Dropdown
        label="Maximum drive time"
        options={[...options]}
        value={String(drivingCapHours)}
        onChange={(event) =>
          setDrivingCapHours(Number.parseInt(event.target.value, 10))
        }
      />

      {overCapSegments.length > 0 ? (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-wayfare-amber">
            <AlertTriangle className="h-3.5 w-3.5" />
            {overCapSegments.length} segment
            {overCapSegments.length > 1 ? 's' : ''} exceed the{' '}
            {drivingCapHours}h cap
          </p>

          {overCapSegments.map((segment) => (
            <Card
              key={`${segment.fromWaypointId}-${segment.toWaypointId}`}
              tone="warning"
              title={`Suggested stopover · ${resolveLabel(segment.fromWaypointId, segment.toWaypointId)}`}
            >
              <p className="text-xs text-wayfare-slate">
                Drive time {formatDuration(segment.durationMinutes)} ·{' '}
                {segment.distanceKm.toFixed(0)} km
              </p>

              {segment.suggestedStopovers &&
              segment.suggestedStopovers.length > 0 &&
              segment.midpointCoords ? (
                <ul className="mt-2 space-y-1.5">
                  {segment.suggestedStopovers.map((town) => (
                    <li
                      key={town}
                      className="flex items-center justify-between gap-2 rounded bg-white/70 px-2 py-1.5"
                    >
                      <span className="flex items-center gap-1.5 text-xs text-wayfare-ink">
                        <MapPinned className="h-3.5 w-3.5 text-wayfare-amber" />
                        {town}
                      </span>
                      <Button
                        variant="secondary"
                        className="!px-2 !py-1 text-[11px]"
                        onClick={() =>
                          handleInsertStop(
                            segment.fromWaypointId,
                            segment.toWaypointId,
                            segment.midpointCoords!,
                            town,
                          )
                        }
                      >
                        Insert Stop
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-wayfare-slate/70">
                  {isRouting
                    ? 'Recalculating route…'
                    : 'Cap midpoint detected — searching nearby towns…'}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-xs text-wayfare-slate/60">
          Segments over the cap will surface stopover suggestions here.
        </p>
      )}
    </section>
  );
}
