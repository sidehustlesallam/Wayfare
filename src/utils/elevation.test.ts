import { describe, expect, it } from 'vitest';
import { detectHighAltitude, sampleRoutePoints } from './elevation';

describe('sampleRoutePoints', () => {
  it('preserves endpoints and attaches cumulative distance', () => {
    const geometry = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.1 },
      { lat: 0, lng: 0.2 },
      { lat: 0, lng: 0.3 },
      { lat: 0, lng: 0.4 },
    ];

    const sampled = sampleRoutePoints(geometry, 3);

    expect(sampled[0]).toMatchObject({ lat: 0, lng: 0, distanceKm: 0 });
    expect(sampled[sampled.length - 1].lng).toBe(0.4);
    expect(sampled[sampled.length - 1].distanceKm).toBeGreaterThan(0);
    expect(sampled.length).toBeLessThanOrEqual(3);
  });

  it('returns all points when under the sample budget', () => {
    const geometry = [
      { lat: 1, lng: 1 },
      { lat: 1.1, lng: 1.1 },
    ];
    expect(sampleRoutePoints(geometry, 80)).toHaveLength(2);
  });

  it('returns empty for empty geometry', () => {
    expect(sampleRoutePoints([], 10)).toEqual([]);
  });
});

describe('detectHighAltitude', () => {
  it('flags elevations at or above the mountain-pass threshold', () => {
    expect(detectHighAltitude([400, 1200, 1850], 1800)).toBe(true);
    expect(detectHighAltitude([400, 1200, 1799], 1800)).toBe(false);
  });
});
