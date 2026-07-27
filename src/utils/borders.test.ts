import { describe, expect, it } from 'vitest';
import {
  crossingsFromCountrySamples,
  sampleGeometryForBorders,
} from './borders';
import { splitGeometryByLegDistances } from './polyline';

describe('splitGeometryByLegDistances', () => {
  it('gives the final leg all remaining vertices so the route reaches the end', () => {
    const full = Array.from({ length: 11 }, (_, i) => ({
      lat: 48 + i * 0.1,
      lng: 2 + i * 0.1,
    }));

    // Intentionally mismatched first-leg distance so the bug would truncate
    const slices = splitGeometryByLegDistances(full, [5, 5, 50]);

    expect(slices).toHaveLength(3);
    expect(slices[2][slices[2].length - 1]).toEqual(full[full.length - 1]);
    expect(slices[0][0]).toEqual(full[0]);
  });
});

describe('sampleGeometryForBorders + crossingsFromCountrySamples', () => {
  it('samples start and end points', () => {
    const geometry = [
      { lat: 48.85, lng: 2.35 },
      { lat: 49.0, lng: 3.0 },
      { lat: 50.0, lng: 5.0 },
      { lat: 52.5, lng: 13.4 },
    ];
    const samples = sampleGeometryForBorders(geometry, 100, 6);
    expect(samples[0]).toEqual(geometry[0]);
    expect(samples[samples.length - 1]).toEqual(geometry[geometry.length - 1]);
    expect(samples.length).toBeGreaterThanOrEqual(2);
  });

  it('emits a crossing for every country change along samples', () => {
    const crossings = crossingsFromCountrySamples([
      {
        point: { lat: 48.8, lng: 2.3 },
        country: { code: 'FR', name: 'France' },
      },
      {
        point: { lat: 50.8, lng: 4.3 },
        country: { code: 'BE', name: 'Belgium' },
      },
      {
        point: { lat: 50.9, lng: 6.0 },
        country: { code: 'DE', name: 'Germany' },
      },
    ]);

    expect(crossings).toHaveLength(2);
    expect(crossings[0].fromCountryCode).toBe('FR');
    expect(crossings[0].toCountryCode).toBe('BE');
    expect(crossings[1].fromCountryCode).toBe('BE');
    expect(crossings[1].toCountryCode).toBe('DE');
  });
});
