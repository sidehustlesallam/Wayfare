import { useMemo } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { AlertTriangle, Loader2, Mountain } from 'lucide-react';
import { useTripStore } from '../../store/useTripStore';
import type { ElevationSample } from '../../types';

const WIDTH = 640;
const HEIGHT = 120;
const PAD_X = 8;
const PAD_Y = 12;

function buildPath(samples: ElevationSample[]): string {
  if (samples.length === 0) return '';

  const minElev = Math.min(...samples.map((s) => s.elevationMeters));
  const maxElev = Math.max(...samples.map((s) => s.elevationMeters));
  const maxDist = samples[samples.length - 1]?.distanceKm || 1;
  const elevSpan = Math.max(maxElev - minElev, 1);

  return samples
    .map((sample, index) => {
      const x =
        PAD_X + (sample.distanceKm / maxDist) * (WIDTH - PAD_X * 2);
      const y =
        HEIGHT -
        PAD_Y -
        ((sample.elevationMeters - minElev) / elevSpan) * (HEIGHT - PAD_Y * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function ElevationProfileDrawer() {
  const profile = useTripStore((s) => s.elevationProfile);
  const isLoading = useTripStore((s) => s.isElevationLoading);
  const error = useTripStore((s) => s.elevationError);
  const hover = useTripStore((s) => s.elevationHover);
  const setElevationHover = useTripStore((s) => s.setElevationHover);
  const hasRoute = useTripStore((s) => s.fullGeometry.length > 1);

  const path = useMemo(
    () => (profile ? buildPath(profile.samples) : ''),
    [profile],
  );

  if (!hasRoute) return null;

  const onMove = (
    event: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>,
  ) => {
    if (!profile || profile.samples.length === 0) return;

    const svg = event.currentTarget;
    const bounds = svg.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0]?.clientX
        : event.clientX;
    if (clientX === undefined) return;

    const ratio = Math.min(
      1,
      Math.max(0, (clientX - bounds.left) / bounds.width),
    );
    const index = Math.round(ratio * (profile.samples.length - 1));
    setElevationHover(profile.samples[index] ?? null);
  };

  return (
    <div className="pointer-events-auto absolute bottom-10 left-3 right-3 z-[1000] rounded-lg border border-wayfare-mist/80 bg-white/95 p-3 shadow-panel backdrop-blur sm:left-3 sm:right-auto sm:w-[min(100%-1.5rem,420px)]">
      <header className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-wayfare-slate">
          <Mountain className="h-3.5 w-3.5 text-wayfare-sky" />
          Elevation profile
        </div>
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-wayfare-sky" />
        ) : null}
      </header>

      {error ? (
        <p className="text-xs text-wayfare-danger" role="alert">
          {error}
        </p>
      ) : null}

      {profile?.hasHighAltitude ? (
        <div className="mb-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-wayfare-amber">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            ⛰️ Mountain Pass Alert: elevations above{' '}
            {profile.highAltitudeThresholdMeters}m detected — steep grades and
            seasonal closures possible.
          </span>
        </div>
      ) : null}

      {profile && profile.samples.length > 1 ? (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-24 w-full cursor-crosshair"
            role="img"
            aria-label="Route elevation chart"
            onMouseMove={onMove}
            onMouseLeave={() => setElevationHover(null)}
            onTouchStart={onMove}
            onTouchMove={onMove}
            onTouchEnd={() => setElevationHover(null)}
          >
            <path
              d={path}
              fill="none"
              stroke="#3d7ea6"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {hover ? (
              <circle
                cx={
                  PAD_X +
                  (hover.distanceKm /
                    (profile.samples[profile.samples.length - 1].distanceKm ||
                      1)) *
                    (WIDTH - PAD_X * 2)
                }
                cy={
                  HEIGHT -
                  PAD_Y -
                  ((hover.elevationMeters - profile.minElevationMeters) /
                    Math.max(
                      profile.maxElevationMeters - profile.minElevationMeters,
                      1,
                    )) *
                    (HEIGHT - PAD_Y * 2)
                }
                r="5"
                fill="#d97706"
                stroke="#fff"
                strokeWidth="2"
              />
            ) : null}
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-wayfare-slate/70">
            <span>{Math.round(profile.minElevationMeters)} m</span>
            <span>
              {hover
                ? `${Math.round(hover.elevationMeters)} m · ${hover.distanceKm.toFixed(1)} km`
                : `Peak ${Math.round(profile.maxElevationMeters)} m`}
            </span>
            <span>{Math.round(profile.maxElevationMeters)} m</span>
          </div>
        </>
      ) : !isLoading && !error ? (
        <p className="text-xs text-wayfare-slate/60">
          Elevation data will appear once the route is ready.
        </p>
      ) : null}
    </div>
  );
}
