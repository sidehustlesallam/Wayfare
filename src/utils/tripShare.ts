import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { TripSettings, Waypoint } from '../types';

/** Compact trip payload embedded in shareable URLs. */
export interface ShareableTrip {
  v: 1;
  waypoints: Waypoint[];
  settings: TripSettings;
}

const TRIP_PARAM = 'trip';

function isWaypoint(value: unknown): value is Waypoint {
  if (typeof value !== 'object' || value === null) return false;
  const wp = value as Record<string, unknown>;
  return (
    typeof wp.id === 'string' &&
    typeof wp.label === 'string' &&
    typeof wp.lat === 'number' &&
    typeof wp.lng === 'number' &&
    (wp.stopType === 'must-visit' || wp.stopType === 'overnight')
  );
}

function isTripSettings(value: unknown): value is TripSettings {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  const unitOk =
    s.unitSystem === undefined ||
    s.unitSystem === 'metric' ||
    s.unitSystem === 'imperial';
  const profileOk =
    s.routeProfile === undefined ||
    s.routeProfile === 'fastest' ||
    s.routeProfile === 'scenic';
  return (
    typeof s.drivingCapHours === 'number' &&
    typeof s.vehicleEfficiency === 'number' &&
    typeof s.fuelPricePerLitre === 'number' &&
    (s.fuelType === 'gasoline' ||
      s.fuelType === 'diesel' ||
      s.fuelType === 'ev') &&
    unitOk &&
    profileOk
  );
}

export function isShareableTrip(value: unknown): value is ShareableTrip {
  if (typeof value !== 'object' || value === null) return false;
  const trip = value as Record<string, unknown>;
  return (
    trip.v === 1 &&
    Array.isArray(trip.waypoints) &&
    trip.waypoints.every(isWaypoint) &&
    isTripSettings(trip.settings)
  );
}

/** Compress waypoints + settings into a URL-safe LZ-String payload. */
export function encodeTrip(trip: ShareableTrip): string {
  return compressToEncodedURIComponent(JSON.stringify(trip));
}

/** Decode a compressed trip payload. Returns null when invalid/corrupt. */
export function decodeTrip(encoded: string): ShareableTrip | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    return isShareableTrip(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Read `#trip=` or `?trip=` from the current location. */
export function readSharedTripFromUrl(
  location: Location = window.location,
): ShareableTrip | null {
  const hash = location.hash.startsWith('#')
    ? location.hash.slice(1)
    : location.hash;

  if (hash.startsWith(`${TRIP_PARAM}=`)) {
    return decodeTrip(hash.slice(TRIP_PARAM.length + 1));
  }

  const hashParams = new URLSearchParams(hash);
  const fromHash = hashParams.get(TRIP_PARAM);
  if (fromHash) return decodeTrip(fromHash);

  const queryParams = new URLSearchParams(location.search);
  const fromQuery = queryParams.get(TRIP_PARAM);
  if (fromQuery) return decodeTrip(fromQuery);

  return null;
}

/** Build a shareable absolute URL with `#trip=...`. */
export function buildShareUrl(
  trip: ShareableTrip,
  location: Location = window.location,
): string {
  const encoded = encodeTrip(trip);
  const base = `${location.origin}${location.pathname}${location.search}`;
  return `${base}#${TRIP_PARAM}=${encoded}`;
}
