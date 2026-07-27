import { OSRM_BASE_URL } from '../../config/defaults';
import type {
  LatLng,
  ManeuverStep,
  RouteProfile,
  RouteRequest,
  RouteResult,
  RouteSegment,
  Waypoint,
} from '../../types';
import {
  buildBorderCrossing,
  estimateBorderCoordinates,
  type CountryHint,
} from '../../utils/borders';
import { countryDisplayName } from '../../utils/borderRules';
import { aggregateRouteMetrics } from '../../utils/fuel';
import { coordinateAtDistance, decodePolyline } from '../../utils/polyline';
import type { RoutingAdapter } from './RoutingAdapter';
import { nominatimService } from '../geocoding/NominatimService';

interface OsrmManeuver {
  type: string;
  modifier?: string;
  location: [number, number];
}

interface OsrmStep {
  distance: number;
  duration: number;
  name: string;
  mode?: string;
  maneuver: OsrmManeuver;
}

interface OsrmLeg {
  distance: number;
  duration: number;
  steps?: OsrmStep[];
}

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: string;
  legs: OsrmLeg[];
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
  message?: string;
}

function buildInstruction(step: OsrmStep): string {
  const { type, modifier } = step.maneuver;
  const street = step.name?.trim();
  const mod = modifier ? ` ${modifier}` : '';

  switch (type) {
    case 'depart':
      return street ? `Depart onto ${street}` : 'Depart';
    case 'arrive':
      return street ? `Arrive at ${street}` : 'Arrive at destination';
    case 'turn':
      return street ? `Turn${mod} onto ${street}` : `Turn${mod}`;
    case 'merge':
      return street ? `Merge${mod} onto ${street}` : `Merge${mod}`;
    case 'on ramp':
    case 'off ramp':
      return street
        ? `Take the ramp${mod} toward ${street}`
        : `Take the ramp${mod}`;
    case 'fork':
      return street ? `Keep${mod} at the fork onto ${street}` : `Keep${mod} at the fork`;
    case 'roundabout':
    case 'rotary':
      return street
        ? `Enter the roundabout and continue onto ${street}`
        : 'Enter the roundabout';
    case 'continue':
      return street ? `Continue onto ${street}` : 'Continue straight';
    case 'new name':
      return street ? `Continue on ${street}` : 'Continue';
    case 'end of road':
      return street ? `At the end of the road, turn${mod} onto ${street}` : `Turn${mod} at the end of the road`;
    default:
      return street
        ? `${type.replace(/_/g, ' ')}${mod} onto ${street}`
        : `${type.replace(/_/g, ' ')}${mod}`.trim();
  }
}

/**
 * Zero-key OSRM routing adapter.
 * Supports fastest vs scenic (exclude motorway) profiles and turn steps.
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
    const { waypoints, drivingCapHours, routeProfile } = request;

    if (waypoints.length < 2) {
      return {
        segments: [],
        fullGeometry: [],
        steps: [],
        metrics: {
          totalDistanceKm: 0,
          totalDurationMinutes: 0,
          estimatedFuelCost: 0,
          estimatedFuelLitres: 0,
          overCapSegments: 0,
        },
      };
    }

    const coords = waypoints.map((wp) => `${wp.lng},${wp.lat}`).join(';');
    const params = new URLSearchParams({
      overview: 'full',
      geometries: 'polyline',
      steps: 'true',
    });

    if (routeProfile === 'scenic') {
      // Prefer secondary / trunk roads by excluding motorways
      params.set('exclude', 'motorway');
    }

    const url = `${this.baseUrl}/route/v1/driving/${coords}?${params}`;

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
    const steps = flattenSteps(route.legs);
    const segments = await this.buildSegments(
      waypoints,
      route,
      fullGeometry,
      drivingCapHours,
      signal,
    );

    const metrics = aggregateRouteMetrics(segments, 0, 0, 'gasoline');

    return { segments, fullGeometry, metrics, steps };
  }

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

    const countries = await Promise.all(
      waypoints.map((wp) => this.resolveCountry(wp, signal)),
    );

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const leg = route.legs[i];

      if (!leg) continue;

      const distanceKm = leg.distance / 1000;
      const durationMinutes = leg.duration / 60;
      const exceedsCap = durationMinutes > capMinutes;

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

      const borderCrossings = [];
      const fromCountry = countries[i];
      const toCountry = countries[i + 1];
      if (fromCountry && toCountry) {
        const crossing = buildBorderCrossing(
          fromCountry,
          toCountry,
          estimateBorderCoordinates(legGeometry, distanceKm),
        );
        if (crossing) borderCrossings.push(crossing);
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
        borderCrossings,
      });
    }

    return segments;
  }

  private async resolveCountry(
    waypoint: Waypoint,
    signal?: AbortSignal,
  ): Promise<CountryHint | undefined> {
    if (waypoint.countryCode) {
      return {
        code: waypoint.countryCode.toUpperCase(),
        name:
          waypoint.countryName ??
          countryDisplayName(waypoint.countryCode, waypoint.label),
      };
    }

    try {
      const reverse = await nominatimService.reverse(
        waypoint.lat,
        waypoint.lng,
        signal,
      );
      if (!reverse?.countryCode) return undefined;
      return {
        code: reverse.countryCode,
        name: reverse.countryName ?? countryDisplayName(reverse.countryCode),
      };
    } catch {
      return undefined;
    }
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

      if (reverse?.label) {
        const nearby = await nominatimService.search(reverse.label, signal);
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

function flattenSteps(legs: OsrmLeg[]): ManeuverStep[] {
  const steps: ManeuverStep[] = [];
  let index = 0;

  for (const leg of legs) {
    for (const step of leg.steps ?? []) {
      const [lng, lat] = step.maneuver.location;
      steps.push({
        index,
        instruction: buildInstruction(step),
        streetName: step.name ?? '',
        distanceMeters: step.distance,
        durationSeconds: step.duration,
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        location: { lat, lng },
      });
      index += 1;
    }
  }

  return steps;
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
    const approxKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
    travelled += approxKm;
    index = i;
    if (travelled >= targetKm) break;
  }

  return index;
}

export const osrmService = new OSRMService();

/** Exported for tests — scenic profiles should request motorway exclusion. */
export function buildOsrmExcludeParam(
  profile: RouteProfile,
): string | undefined {
  return profile === 'scenic' ? 'motorway' : undefined;
}
