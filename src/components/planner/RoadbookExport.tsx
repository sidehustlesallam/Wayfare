import { useMemo, useState } from 'react';
import { Download, FileText, MapPinned, Printer } from 'lucide-react';
import { isFeatureEnabled } from '../../config/features';
import { useTripStore } from '../../store/useTripStore';
import {
  buildGpxDocument,
  buildRoadbookText,
  downloadTextFile,
} from '../../utils/roadbook';
import { formatDistance, formatDuration } from '../../utils/fuel';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface RoadbookExportProps {
  onExported?: (kind: 'txt' | 'gpx') => void;
  onError?: (message: string) => void;
}

export function RoadbookExport({ onExported, onError }: RoadbookExportProps) {
  const waypoints = useTripStore((s) => s.waypoints);
  const steps = useTripStore((s) => s.steps);
  const fullGeometry = useTripStore((s) => s.fullGeometry);
  const metrics = useTripStore((s) => s.metrics);
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    if (waypoints.length < 2) return 'Wayfare Roadbook';
    return `Wayfare · ${waypoints[0].label} → ${waypoints[waypoints.length - 1].label}`;
  }, [waypoints]);

  const canExport = waypoints.length >= 2 && fullGeometry.length > 0;

  const handleTxt = () => {
    try {
      const text = buildRoadbookText({
        title,
        waypoints,
        steps,
        totalDistanceKm: metrics.totalDistanceKm,
        totalDurationMinutes: metrics.totalDurationMinutes,
      });
      downloadTextFile('wayfare-roadbook.txt', text);
      onExported?.('txt');
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Text export failed');
    }
  };

  const handleGpx = () => {
    if (!isFeatureEnabled('gpxExport')) {
      onError?.('GPX export is disabled by feature flag.');
      return;
    }

    try {
      const gpx = buildGpxDocument({
        name: title,
        waypoints,
        track: fullGeometry,
        steps,
      });
      downloadTextFile('wayfare-route.gpx', gpx, 'application/gpx+xml');
      onExported?.('gpx');
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'GPX export failed');
    }
  };

  const handlePrint = () => {
    setOpen(true);
    window.setTimeout(() => window.print(), 200);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Roadbook
        </h2>
      </header>

      <p className="text-xs text-wayfare-slate/70">
        Download turn-by-turn instructions for offline navigation.
      </p>

      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="secondary"
          className="w-full justify-start"
          disabled={!canExport}
          onClick={handleTxt}
        >
          <Download className="h-4 w-4" />
          Download TXT instructions
        </Button>
        <Button
          variant="secondary"
          className="w-full justify-start"
          disabled={!canExport}
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
        {isFeatureEnabled('gpxExport') ? (
          <Button
            variant="secondary"
            className="w-full justify-start"
            disabled={!canExport}
            onClick={handleGpx}
          >
            <MapPinned className="h-4 w-4" />
            Export GPX
          </Button>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Driving instructions"
        className="max-w-2xl"
        printId="wayfare-print-roadbook"
      >
        <div className="space-y-4 text-sm">
          <p className="text-wayfare-slate">
            {formatDistance(metrics.totalDistanceKm)} ·{' '}
            {formatDuration(metrics.totalDurationMinutes)} · {steps.length}{' '}
            maneuvers
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            {steps.map((step) => (
              <li key={`${step.index}-${step.instruction}`} className="break-inside-avoid">
                <span className="font-medium text-wayfare-ink">
                  {step.instruction}
                </span>
                <span className="ml-2 text-xs text-wayfare-slate/70">
                  {step.distanceMeters >= 1000
                    ? `${(step.distanceMeters / 1000).toFixed(1)} km`
                    : `${Math.round(step.distanceMeters)} m`}
                </span>
              </li>
            ))}
          </ol>
          {steps.length === 0 ? (
            <p className="text-wayfare-slate/70">
              No turn-by-turn steps yet — calculate a route first.
            </p>
          ) : null}
        </div>
      </Modal>
    </section>
  );
}
