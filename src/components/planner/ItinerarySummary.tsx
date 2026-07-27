import { useTripStore } from '../../store/useTripStore';
import { formatDistance, formatDuration } from '../../utils/fuel';

export function ItinerarySummary() {
  const metrics = useTripStore((s) => s.metrics);
  const unitSystem = useTripStore((s) => s.settings.unitSystem);
  const isRouting = useTripStore((s) => s.isRouting);
  const routingError = useTripStore((s) => s.routingError);
  const waypointCount = useTripStore((s) => s.waypoints.length);

  if (waypointCount < 2) return null;

  return (
    <div className="rounded-lg border border-wayfare-sky/20 bg-wayfare-sky/5 px-3 py-2.5">
      {isRouting ? (
        <p className="text-xs text-wayfare-sky">Calculating route…</p>
      ) : routingError ? (
        <p className="text-xs text-wayfare-danger" role="alert">
          Route unavailable — {routingError}. Check your waypoints and try
          again.
        </p>
      ) : (
        <dl className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <dt className="text-wayfare-slate/60">Total</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatDistance(metrics.totalDistanceKm, unitSystem)}
            </dd>
          </div>
          <div>
            <dt className="text-wayfare-slate/60">Time</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatDuration(metrics.totalDurationMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-wayfare-slate/60">Over cap</dt>
            <dd
              className={`font-semibold ${
                metrics.overCapSegments > 0
                  ? 'text-wayfare-amber'
                  : 'text-wayfare-ink'
              }`}
            >
              {metrics.overCapSegments}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
