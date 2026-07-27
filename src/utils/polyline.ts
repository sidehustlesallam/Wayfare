import type { LatLng } from '../types';

/**
 * Decode an OSRM/Google encoded polyline into lat/lng pairs.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(encoded: string, precision = 5): LatLng[] {
  const coordinates: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = 10 ** precision;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({ lat: lat / factor, lng: lng / factor });
  }

  return coordinates;
}

/** Haversine distance in kilometres between two points. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Walk a decoded geometry and return the coordinate reached after
 * travelling approximately `targetKm` along the path.
 */
export function coordinateAtDistance(
  geometry: LatLng[],
  targetKm: number,
): LatLng | undefined {
  if (geometry.length === 0) return undefined;
  if (targetKm <= 0) return geometry[0];

  let travelled = 0;

  for (let i = 1; i < geometry.length; i++) {
    const prev = geometry[i - 1];
    const curr = geometry[i];
    const segmentKm = haversineKm(prev, curr);

    if (travelled + segmentKm >= targetKm) {
      const ratio = (targetKm - travelled) / segmentKm;
      return {
        lat: prev.lat + (curr.lat - prev.lat) * ratio,
        lng: prev.lng + (curr.lng - prev.lng) * ratio,
      };
    }

    travelled += segmentKm;
  }

  return geometry[geometry.length - 1];
}

/**
 * Find the geometry vertex index at (or just past) `targetKm` from `startIndex`,
 * using haversine distances. Returns the last index when the remaining path is
 * shorter than the target (caller should clamp for final legs).
 */
export function findIndexAtDistance(
  full: LatLng[],
  startIndex: number,
  targetKm: number,
): number {
  if (full.length === 0) return 0;
  if (startIndex >= full.length - 1) return full.length - 1;
  if (targetKm <= 0) return startIndex;

  let travelled = 0;
  let index = startIndex;

  for (let i = startIndex + 1; i < full.length; i++) {
    travelled += haversineKm(full[i - 1], full[i]);
    index = i;
    if (travelled >= targetKm) break;
  }

  return index;
}

/**
 * Slice `full` into contiguous leg geometries matching each leg's OSRM distance.
 * The final leg always consumes all remaining vertices so the route reaches the end.
 */
export function splitGeometryByLegDistances(
  full: LatLng[],
  legDistancesKm: number[],
): LatLng[][] {
  if (full.length === 0 || legDistancesKm.length === 0) {
    return legDistancesKm.map(() => []);
  }

  const slices: LatLng[][] = [];
  let cursor = 0;

  for (let i = 0; i < legDistancesKm.length; i++) {
    const isLast = i === legDistancesKm.length - 1;

    if (isLast) {
      slices.push(full.slice(cursor));
      break;
    }

    const endIndex = findIndexAtDistance(full, cursor, legDistancesKm[i]);
    const slice = full.slice(cursor, endIndex + 1);
    slices.push(slice.length > 0 ? slice : [full[cursor] ?? full[0]]);
    cursor = Math.max(cursor, endIndex);
  }

  return slices;
}
