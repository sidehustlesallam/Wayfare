import { AlertTriangle, Clock, MapPinned } from 'lucide-react';
import { DRIVING_CAP_OPTIONS } from '../../config/defaults';
import { useTripStore } from '../../store/useTripStore';
import type { SuggestedStopover } from '../../types';
import { formatDistance, formatDuration } from '../../utils/fuel';
import { Card } from '../common/Card';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';

export function DrivingCapSelector() {
  const drivingCapHours = useTripStore((s) => s.settings.drivingCapHours);
  const setDrivingCapHours = useTripStore((s) => s.setDrivingCapHours);
  const unitSystem = useTripStore((s) => s.settings.unitSystem);
  const segments = useTripStore((s) => s.segments);
  const waypoints = useTripStore((s) => s.waypoints);
  const insertWaypoint = useTripStore((s) => s.insertWaypoint);
  const setStopoverHover = useTripStore((s) => s.setStopoverHover);
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
    stopover: SuggestedStopover,
  ) => {
    const toIndex = waypoints.findIndex((wp) => wp.id === segmentToId);
    const fromIndex = waypoints.findIndex((wp) => wp.id === segmentFromId);
    const insertAt = toIndex >= 0 ? toIndex : fromIndex + 1;

    insertWaypoint(
      {
        label: `Break: ${stopover.label}`,
        lat: stopover.coordinates[0],
        lng: stopover.coordinates[1],
        stopType: 'overnight',
      },
      insertAt,
    );
    setStopoverHover(null);
  };

  const previewStopover = (stopover: SuggestedStopover) => {
    setStopoverHover({
      label: stopover.label,
      coordinates: stopover.coordinates,
      driveMinutesFromTripStart: stopover.driveMinutesFromTripStart,
      distanceKmFromTripStart: stopover.distanceKmFromTripStart,
    });
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
                Full leg {formatDuration(segment.durationMinutes)} ·{' '}
                {formatDistance(segment.distanceKm, unitSystem)}
              </p>

              {segment.suggestedStopovers &&
              segment.suggestedStopovers.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {segment.suggestedStopovers.map((stopover) => (
                    <li
                      key={`${stopover.label}-${stopover.coordinates.join(',')}`}
                      className="rounded bg-white/70 px-2 py-1.5 transition hover:bg-amber-50"
                      onMouseEnter={() => previewStopover(stopover)}
                      onMouseLeave={() => setStopoverHover(null)}
                      onFocus={() => previewStopover(stopover)}
                      onBlur={() => setStopoverHover(null)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-wayfare-ink">
                            <MapPinned className="h-3.5 w-3.5 shrink-0 text-wayfare-amber" />
                            <span className="truncate">{stopover.label}</span>
                          </p>
                          <p className="mt-1 text-[11px] text-wayfare-slate/80">
                            ~{formatDuration(stopover.driveMinutesFromTripStart)}{' '}
                            from start ·{' '}
                            {formatDistance(
                              stopover.distanceKmFromTripStart,
                              unitSystem,
                            )}
                          </p>
                          <p className="text-[11px] text-wayfare-slate/60">
                            Cap reached after{' '}
                            {formatDuration(
                              stopover.driveMinutesFromSegmentStart,
                            )}{' '}
                            on this leg (
                            {formatDistance(
                              stopover.distanceKmFromSegmentStart,
                              unitSystem,
                            )}
                            )
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          className="!shrink-0 !px-2 !py-1 text-[11px]"
                          onClick={() =>
                            handleInsertStop(
                              segment.fromWaypointId,
                              segment.toWaypointId,
                              stopover,
                            )
                          }
                        >
                          Insert Stop
                        </Button>
                      </div>
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
