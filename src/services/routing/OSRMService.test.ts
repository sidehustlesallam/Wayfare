import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LatLng, Waypoint } from '../../types';
import { aggregateRouteMetrics } from '../../utils/fuel';
import { coordinateAtDistance } from '../../utils/polyline';
import { buildOsrmExcludeParam, OSRMService } from './OSRMService';

function encodePolyline(coords: LatLng[], precision = 5): string {
  let lastLat = 0;
  let lastLng = 0;
  let result = '';
  const factor = 10 ** precision;

  const encodeSigned = (value: number): string => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    let out = '';
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    out += String.fromCharCode(v + 63);
    return out;
  };

  for (const point of coords) {
    const lat = Math.round(point.lat * factor);
    const lng = Math.round(point.lng * factor);
    result += encodeSigned(lat - lastLat);
    result += encodeSigned(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  }

  return result;
}

const waypoints: Waypoint[] = [
  {
    id: 'wp_a',
    label: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    stopType: 'must-visit',
    countryCode: 'FR',
  },
  {
    id: 'wp_b',
    label: 'Berlin',
    lat: 52.52,
    lng: 13.405,
    stopType: 'must-visit',
    countryCode: 'DE',
  },
];

/** Rough eastbound geometry spanning ~600km of haversine progress. */
function buildLongGeometry(): LatLng[] {
  const points: LatLng[] = [];
  for (let i = 0; i <= 60; i++) {
    points.push({
      lat: 48.8566 + i * 0.06,
      lng: 2.3522 + i * 0.18,
    });
  }
  return points;
}

describe('OSRMService route aggregation & over-cap midpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aggregates distance and duration across segments', () => {
    const metrics = aggregateRouteMetrics(
      [
        {
          fromWaypointId: 'a',
          toWaypointId: 'b',
          distanceKm: 300,
          durationMinutes: 210,
          geometry: [],
          geometryPolyline: '',
          exceedsCap: false,
          borderCrossings: [],
        },
        {
          fromWaypointId: 'b',
          toWaypointId: 'c',
          distanceKm: 250.55,
          durationMinutes: 180,
          geometry: [],
          geometryPolyline: '',
          exceedsCap: true,
          borderCrossings: [],
        },
      ],
      7.5,
      1.6,
      'gasoline',
    );

    expect(metrics.totalDistanceKm).toBe(550.55);
    expect(metrics.totalDurationMinutes).toBe(390);
    expect(metrics.overCapSegments).toBe(1);
  });

  it('computes a midpoint along geometry for over-cap distance targets', () => {
    const geometry = buildLongGeometry();
    const mid = coordinateAtDistance(geometry, 100);

    expect(mid).toBeDefined();
    expect(mid!.lat).toBeGreaterThan(geometry[0].lat);
    expect(mid!.lat).toBeLessThan(geometry[geometry.length - 1].lat);
  });

  it('marks over-cap segments and attaches midpoint coords from mocked OSRM', async () => {
    const geometry = buildLongGeometry();
    const encoded = encodePolyline(geometry);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('router.project-osrm.org')) {
        return new Response(
          JSON.stringify({
            code: 'Ok',
            routes: [
              {
                distance: 600_000,
                duration: 8 * 3600,
                geometry: encoded,
                legs: [
                  {
                    distance: 600_000,
                    duration: 8 * 3600,
                  },
                ],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      if (url.includes('photon.komoot.io')) {
        return new Response(
          JSON.stringify({
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [8.5, 50.5] },
                properties: {
                  osm_type: 'N',
                  osm_id: 1,
                  name: 'Rest Town',
                  country: 'Germany',
                  countrycode: 'de',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Nominatim reverse / search fallback
      return new Response(
        JSON.stringify({
          place_id: 1,
          display_name: 'Rest Town, Germany',
          lat: '50.5',
          lon: '8.5',
          name: 'Rest Town',
          address: {
            town: 'Rest Town',
            country: 'Germany',
            country_code: 'de',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const service = new OSRMService();
    const result = await service.fetchRoute({
      waypoints,
      drivingCapHours: 6,
      routeProfile: 'fastest',
    });

    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].exceedsCap).toBe(true);
    expect(result.segments[0].durationMinutes).toBe(480);
    expect(result.segments[0].distanceKm).toBe(600);
    expect(result.segments[0].midpointCoords).toBeDefined();
    expect(result.segments[0].suggestedStopovers?.length).toBeGreaterThan(0);
    expect(result.metrics.totalDurationMinutes).toBe(480);
  });

  it('does not flag segments within the driving cap', async () => {
    const geometry = buildLongGeometry().slice(0, 10);
    const encoded = encodePolyline(geometry);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('photon.komoot.io')) {
        return new Response(
          JSON.stringify({
            features: [
              {
                geometry: { coordinates: [2.4, 48.9] },
                properties: {
                  osm_type: 'N',
                  osm_id: 2,
                  name: 'Near Paris',
                  country: 'France',
                  countrycode: 'fr',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          code: 'Ok',
          routes: [
            {
              distance: 120_000,
              duration: 2 * 3600,
              geometry: encoded,
              legs: [{ distance: 120_000, duration: 2 * 3600 }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const service = new OSRMService();
    const result = await service.fetchRoute({
      waypoints,
      drivingCapHours: 6,
      routeProfile: 'fastest',
    });

    expect(result.segments[0].exceedsCap).toBe(false);
    expect(result.segments[0].midpointCoords).toBeUndefined();
  });

  it('requests motorway exclusion for scenic profiles', async () => {
    expect(buildOsrmExcludeParam('scenic')).toBe('motorway');
    expect(buildOsrmExcludeParam('fastest')).toBeUndefined();

    const geometry = buildLongGeometry().slice(0, 5);
    const encoded = encodePolyline(geometry);
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('photon.komoot.io')) {
        return new Response(
          JSON.stringify({
            features: [
              {
                geometry: { coordinates: [2.35, 48.85] },
                properties: {
                  osm_type: 'N',
                  osm_id: 3,
                  name: 'Paris',
                  country: 'France',
                  countrycode: 'fr',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          code: 'Ok',
          routes: [
            {
              distance: 50_000,
              duration: 3600,
              geometry: encoded,
              legs: [
                {
                  distance: 50_000,
                  duration: 3600,
                  steps: [
                    {
                      distance: 50_000,
                      duration: 3600,
                      name: 'D1',
                      maneuver: {
                        type: 'depart',
                        location: [2.35, 48.85],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const service = new OSRMService();
    const result = await service.fetchRoute({
      waypoints,
      drivingCapHours: 6,
      routeProfile: 'scenic',
    });

    const calledUrl = String(fetchSpy.mock.calls[0]?.[0]);
    expect(calledUrl).toContain('exclude=motorway');
    expect(calledUrl).toContain('steps=true');
    expect(result.steps.length).toBeGreaterThan(0);
  });
});
