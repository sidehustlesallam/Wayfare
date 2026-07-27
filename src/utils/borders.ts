import type { BorderCrossing, LatLng } from '../types';
import {
  countryDisplayName,
  getCrossingWarnings,
} from './borderRules';
import { coordinateAtDistance, haversineKm } from './polyline';

export interface CountryHint {
  code: string;
  name: string;
}

/**
 * Build a BorderCrossing when leaving one country for another.
 */
export function buildBorderCrossing(
  from: CountryHint,
  to: CountryHint,
  coordinates: [number, number],
): BorderCrossing | undefined {
  if (from.code.toUpperCase() === to.code.toUpperCase()) return undefined;

  const { warnings, warningKinds } = getCrossingWarnings(from.code, to.code);

  return {
    fromCountry: from.name || countryDisplayName(from.code),
    toCountry: to.name || countryDisplayName(to.code),
    fromCountryCode: from.code.toUpperCase(),
    toCountryCode: to.code.toUpperCase(),
    coordinates,
    warnings,
    warningKinds,
  };
}

/** Place the badge roughly halfway along the leg geometry. */
export function estimateBorderCoordinates(
  geometry: LatLng[],
  distanceKm: number,
): [number, number] {
  const mid =
    coordinateAtDistance(geometry, Math.max(distanceKm / 2, 0)) ??
    geometry[Math.floor(geometry.length / 2)] ??
    geometry[0];

  if (!mid) return [0, 0];
  return [mid.lat, mid.lng];
}

/**
 * Sample points along a polyline at roughly `intervalKm` spacing
 * (always including start + end).
 */
export function sampleGeometryForBorders(
  geometry: LatLng[],
  intervalKm = 75,
  maxSamples = 12,
): LatLng[] {
  if (geometry.length === 0) return [];
  if (geometry.length === 1) return [geometry[0]];

  let total = 0;
  for (let i = 1; i < geometry.length; i++) {
    total += haversineKm(geometry[i - 1], geometry[i]);
  }

  const count = Math.min(
    maxSamples,
    Math.max(2, Math.ceil(total / intervalKm) + 1),
  );

  const samples: LatLng[] = [];
  for (let i = 0; i < count; i++) {
    const target = (i / (count - 1)) * total;
    const point = coordinateAtDistance(geometry, target);
    if (point) samples.push(point);
  }

  return samples;
}

/**
 * Walk sampled countries and emit a crossing whenever the ISO code changes.
 */
export function crossingsFromCountrySamples(
  samples: Array<{ point: LatLng; country: CountryHint | undefined }>,
): BorderCrossing[] {
  const crossings: BorderCrossing[] = [];
  let previous: { point: LatLng; country: CountryHint } | undefined;

  for (const sample of samples) {
    if (!sample.country) continue;

    if (
      previous &&
      previous.country.code.toUpperCase() !== sample.country.code.toUpperCase()
    ) {
      const crossing = buildBorderCrossing(
        previous.country,
        sample.country,
        [
          (previous.point.lat + sample.point.lat) / 2,
          (previous.point.lng + sample.point.lng) / 2,
        ],
      );
      if (crossing) crossings.push(crossing);
    }

    previous = { point: sample.point, country: sample.country };
  }

  return crossings;
}

/** Collect unique border crossings across all route segments. */
export function collectBorderAlerts(
  crossings: BorderCrossing[],
): BorderCrossing[] {
  const seen = new Set<string>();
  const unique: BorderCrossing[] = [];

  for (const crossing of crossings) {
    const key =
      crossing.fromCountryCode && crossing.toCountryCode
        ? `${crossing.fromCountryCode}->${crossing.toCountryCode}`
        : `${crossing.fromCountry}->${crossing.toCountry}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(crossing);
  }

  return unique;
}
