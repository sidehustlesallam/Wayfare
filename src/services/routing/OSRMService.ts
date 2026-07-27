import { OSRM_BASE_URL } from '../../config/defaults';
import type {
  LatLng,
  RouteRequest,
  RouteResult,
  RouteSegment,
  Waypoint,
} from '../../types';
import { aggregateRouteMetrics } from '../../utils/fuel';
import { coordinateAtDistance, decodePolyline } from '../../utils/polyline';
import type { RoutingAdapter } from './RoutingAdapter';
import { nominatimService } from '../geocoding/NominatimService';

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: string;
  legs: Array<{
    distance: number;
    duration: number;
  }>;
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
  message?: string;
}

/**
 * Zero-key OSRM routing adapter.
 * Computes multi-stop routes, decodes polylines, detects over-cap segments,
 * and suggests nearby towns at the driving-cap midpoint.
 */
export class OSRMService implements RoutingAdapter {
  private readonly baseUrl: string;

  constructor(baseUrl: string = OSRM_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getRoute(
    request: RouteRequest,
    signal?: AbortSignal,
  ): Promise<RouteResult> {
    const { waypoints, drivingCapHours } = request;

    if (waypoints.length < 2) {
      return {
        segments: [],
        fullGeometry: [],
        metrics: {
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          estimatedFuelCost: 0,
          estimatedFuelLitres: 0,
          overCapSegments: 0,
        },
      };
    }

    const coords = waypoints
      .map((wp) => `${wp.lng},${wp.lat}`)
      .join(';');

    const url =
      `${this.baseUrl}/route/v1/driving/${coords}` +
      '?overview=full&geometries=polyline&steps=false';

    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`OSRM routing failed (${response.status})`);
    }

    const data = (await response.json()) as OsrmResponse;

    if (data.code !== 'Ok' || !data.routes?.[0]) {
      throw new Error(data.message ?? 'OSRM returned no route');
    }

    const route = data.routes[0];
    const fullGeometry = decodePolyline(route.geometry);
    const segments = await this.buildSegments(
      waypoints,
      route,
      fullGeometry,
      drivingCapHours,
      signal,
    );

    // Fuel inputs are applied by the store / hook after aggregation
    const metrics = aggregateRouteMetrics(segments, 0, 0, 'gasoline');

    return { segments, fullGeometry, metrics };
  }

  /** Preferred alias used by live store wiring (`useRouting`). */
  fetchRoute(
    request: RouteRequest,
    signal?: AbortSignal,
  ): Promise<RouteResult> {
    return this.getRoute(request, signal);
  }

  private async buildSegments(
    waypoints: Waypoint[],
    route: OsrmRoute,
    fullGeometry: LatLng[],
    drivingCapHours: number,
    signal?: AbortSignal,
  ): Promise<RouteSegment[]> {
    const capMinutes = drivingCapHours * 60;
    const segments: RouteSegment[] = [];
    let geometryCursor = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const leg = route.legs[i];

      if (!leg) continue;

      const distanceKm = leg.distance / 1000;
      const durationMinutes = leg.duration / 60;
      const exceedsCap = durationMinutes > capMinutes;

      // Approximate leg geometry by slicing the full path by haversine progress
      const legGeometry = sliceGeometryForLeg(
        fullGeometry,
        geometryCursor,
        distanceKm,
      );
      geometryCursor = Math.max(
        geometryCursor,
        findEndIndex(fullGeometry, geometryCursor, distanceKm),
      );

      let midpointCoords: [number, number] | undefined;
      let suggestedStopovers: string[] | undefined;

      if (exceedsCap && legGeometry.length > 0) {
        const avgSpeedKmh =
          durationMinutes > 0 ? distanceKm / (durationMinutes / 60) : 80;
        const capDistanceKm = avgSpeedKmh * drivingCapHours;
        const mid = coordinateAtDistance(legGeometry, capDistanceKm);

        if (mid) {
          midpointCoords = [mid.lat, mid.lng];
          suggestedStopovers = await this.suggestStopovers(mid, signal);
        }
      }

      segments.push({
        fromWaypointId: from.id,
        toWaypointId: to.id,
        distanceKm: Math.round(distanceKm * 100) / 100,
        durationMinutes: Math.round(durationMinutes),
        geometry: legGeometry,
        geometryPolyline: '',
        exceedsCap,
        midpointCoords,
        suggestedStopovers,
        borderCrossings: [],
      });
    }

    return segments;
  }

  private async suggestStopovers(
    point: LatLng,
    signal?: AbortSignal,
  ): Promise<string[]> {
    try {
      const reverse = await nominatimService.reverse(
        point.lat,
        point.lng,
        signal,
      );

      const suggestions = new Set<string>();
      if (reverse?.label) suggestions.add(reverse.label);

      if (reverse?.countryName) {
        // Broaden with a nearby place search using the reverse label
        const nearby = await nominatimService.search(
          reverse.label,
          signal,
        );
        for (const result of nearby.slice(0, 3)) {
          suggestions.add(result.label);
        }
      }

      if (suggestions.size === 0) {
        return [`Stop near ${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`];
      }

      return Array.from(suggestions).slice(0, 3);
    } catch {
      return [`Stop near ${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`];
    }
  }
}

function sliceGeometryForLeg(
  full: LatLng[],
  startIndex: number,
  targetKm: number,
): LatLng[] {
  const endIndex = findEndIndex(full, startIndex, targetKm);
  return full.slice(startIndex, endIndex + 1);
}

function findEndIndex(
  full: LatLng[],
  startIndex: number,
  targetKm: number,
): number {
  if (full.length === 0) return 0;

  let travelled = 0;
  let index = startIndex;

  for (let i = startIndex + 1; i < full.length; i++) {
    const prev = full[i - 1];
    const curr = full[i];
    const dLat = curr.lat - prev.lat;
    const dLng = curr.lng - prev.lng;
    // Fast approximate km (good enough for slicing)
    const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    travelled += approxKm;
    index = i;
    if (travelled >= targetKm) break;
  }

  return index;
}

export const osrmService = new OSRMService();
