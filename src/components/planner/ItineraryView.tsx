import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import { buildDailyItinerary } from '../../utils/itinerary';
import {
  formatDistance,
  formatDuration,
  formatFuelAmount,
  formatFuelCost,
} from '../../utils/fuel';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ItineraryViewProps {
  open: boolean;
  onClose: () => void;
}

export function ItineraryView({ open, onClose }: ItineraryViewProps) {
  const waypoints = useTripStore((s) => s.waypoints);
  const segments = useTripStore((s) => s.segments);
  const settings = useTripStore((s) => s.settings);
  const metrics = useTripStore((s) => s.metrics);

  const days = useMemo(
    () =>
      buildDailyItinerary(waypoints, segments, settings.drivingCapHours),
    [waypoints, segments, settings.drivingCapHours],
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Trip itinerary"
      className="max-w-2xl"
      printId="wayfare-print-itinerary"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
          <p className="text-sm text-wayfare-slate/70">
            Day-by-day playbook from overnight stops and your{' '}
            {settings.drivingCapHours}h driving cap.
          </p>
          <Button variant="primary" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>

        <div className="hidden print:block">
          <p className="font-display text-3xl text-wayfare-ink">Wayfare</p>
          <p className="text-sm text-wayfare-slate">
            Offline route playbook · {waypoints[0]?.label ?? 'Start'} →{' '}
            {waypoints[waypoints.length - 1]?.label ?? 'End'}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 rounded-md border border-wayfare-mist bg-wayfare-mist/30 p-3 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-wayfare-slate/60">Total distance</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatDistance(metrics.totalDistanceKm, settings.unitSystem)}
            </dd>
          </div>
          <div>
            <dt className="text-wayfare-slate/60">Total drive</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatDuration(metrics.totalDurationMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-wayfare-slate/60">Fuel / energy</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatFuelAmount(
                metrics.estimatedFuelLitres,
                settings.unitSystem,
                settings.fuelType,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-wayfare-slate/60">Est. cost</dt>
            <dd className="font-semibold text-wayfare-ink">
              {formatFuelCost(metrics.estimatedFuelCost, settings.unitSystem)}
            </dd>
          </div>
        </dl>

        {days.length === 0 ? (
          <p className="text-sm text-wayfare-slate/70">
            Add waypoints and wait for a route to build your itinerary.
          </p>
        ) : (
          <ol className="space-y-4">
            {days.map((day) => (
              <li
                key={day.dayNumber}
                className="break-inside-avoid rounded-lg border border-wayfare-mist p-3"
              >
                <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-wayfare-ink">
                    {day.label}: {day.startWaypoint.label} →{' '}
                    {day.endWaypoint.label}
                  </h3>
                  <p className="text-xs text-wayfare-slate">
                    {formatDistance(day.distanceKm, settings.unitSystem)} ·{' '}
                    {formatDuration(day.durationMinutes)}
                    {day.endsWithOvernight ? ' · Overnight' : ''}
                  </p>
                </header>

                <ol className="mb-2 space-y-1 text-sm text-wayfare-slate">
                  {day.stops.map((stop, index) => (
                    <li key={`${day.dayNumber}-${stop.id}`}>
                      <span className="font-medium text-wayfare-ink">
                        {index + 1}. {stop.label}
                      </span>
                      <span className="ml-1 text-xs capitalize text-wayfare-slate/60">
                        ({stop.stopType.replace('-', ' ')})
                      </span>
                    </li>
                  ))}
                </ol>

                {day.borderCrossings.length > 0 ? (
                  <div className="rounded-md bg-red-50 px-2 py-2">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-wayfare-danger">
                      Border checklist
                    </p>
                    <ul className="space-y-2">
                      {day.borderCrossings.map((crossing) => (
                        <li
                          key={`${day.dayNumber}-${crossing.fromCountry}-${crossing.toCountry}`}
                          className="text-xs text-wayfare-slate"
                        >
                          <p className="font-medium text-wayfare-ink">
                            🛂 {crossing.fromCountry} → {crossing.toCountry}
                          </p>
                          <ul className="mt-0.5 list-disc pl-4">
                            {crossing.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Modal>
  );
}
