import type { BorderCrossing, LatLng } from '../types';
import {
  countryDisplayName,
  getCrossingWarnings,
} from './borderRules';
import { coordinateAtDistance } from './polyline';

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
