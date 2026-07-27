import type { LatLng } from '../types';
import { haversineKm } from './polyline';

/**
 * Evenly sample points along a polyline (by vertex stride), preserving ends.
 * Returns cumulative distanceKm for each kept vertex.
 */
export function sampleRoutePoints(
  geometry: LatLng[],
  maxSamples: number,
): Array<LatLng & { distanceKm: number }> {
  if (geometry.length === 0) return [];
  if (geometry.length === 1) {
    return [{ ...geometry[0], distanceKm: 0 }];
  }

  const withDistance: Array<LatLng & { distanceKm: number }> = [];
  let travelled = 0;
  withDistance.push({ ...geometry[0], distanceKm: 0 });

  for (let i = 1; i < geometry.length; i++) {
    travelled += haversineKm(geometry[i - 1], geometry[i]);
    withDistance.push({ ...geometry[i], distanceKm: travelled });
  }

  if (withDistance.length <= maxSamples) {
    return withDistance;
  }

  const sampled: Array<LatLng & { distanceKm: number }> = [];
  const lastIndex = withDistance.length - 1;

  for (let i = 0; i < maxSamples; i++) {
    const index =
      i === maxSamples - 1
        ? lastIndex
        : Math.round((i / (maxSamples - 1)) * lastIndex);
    const point = withDistance[index];
    const prev = sampled[sampled.length - 1];
    if (prev && prev.lat === point.lat && prev.lng === point.lng) {
      continue;
    }
    sampled.push(point);
  }

  return sampled;
}

export function detectHighAltitude(
  elevations: number[],
  thresholdMeters: number,
): boolean {
  return elevations.some((elevation) => elevation >= thresholdMeters);
}
