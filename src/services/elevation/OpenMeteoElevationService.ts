import {
  ELEVATION_SAMPLE_COUNT,
  MOUNTAIN_PASS_THRESHOLD_M,
  OPEN_METEO_ELEVATION_URL,
} from '../../config/defaults';
import type { ElevationProfile, ElevationSample, LatLng } from '../../types';
import {
  detectHighAltitude,
  sampleRoutePoints,
} from '../../utils/elevation';
import type { ElevationAdapter } from './ElevationAdapter';

interface OpenMeteoElevationResponse {
  elevation?: number[];
}

const BATCH_SIZE = 100;

/**
 * Zero-key Open-Meteo elevation adapter.
 * @see https://open-meteo.com/en/docs/elevation-api
 */
export class OpenMeteoElevationService implements ElevationAdapter {
  private readonly baseUrl: string;

  constructor(baseUrl: string = OPEN_METEO_ELEVATION_URL) {
    this.baseUrl = baseUrl;
  }

  async lookup(
    points: LatLng[],
    signal?: AbortSignal,
  ): Promise<number[]> {
    if (points.length === 0) return [];

    const elevations: number[] = [];

    for (let i = 0; i < points.length; i += BATCH_SIZE) {
      const batch = points.slice(i, i + BATCH_SIZE);
      const latitudes = batch.map((p) => p.lat.toFixed(5)).join(',');
      const longitudes = batch.map((p) => p.lng.toFixed(5)).join(',');
      const url = `${this.baseUrl}?latitude=${latitudes}&longitude=${longitudes}`;

      const response = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Elevation lookup failed (${response.status})`);
      }

      const data = (await response.json()) as OpenMeteoElevationResponse;
      if (!data.elevation || data.elevation.length !== batch.length) {
        throw new Error('Elevation API returned incomplete data');
      }

      elevations.push(...data.elevation);
    }

    return elevations;
  }

  async profileRoute(
    geometry: LatLng[],
    options: {
      maxSamples?: number;
      highAltitudeThresholdMeters?: number;
      signal?: AbortSignal;
    } = {},
  ): Promise<ElevationProfile> {
    const maxSamples = options.maxSamples ?? ELEVATION_SAMPLE_COUNT;
    const threshold =
      options.highAltitudeThresholdMeters ?? MOUNTAIN_PASS_THRESHOLD_M;

    const sampled = sampleRoutePoints(geometry, maxSamples);
    const elevations = await this.lookup(sampled, options.signal);

    const samples: ElevationSample[] = sampled.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      distanceKm: point.distanceKm,
      elevationMeters: elevations[index] ?? 0,
    }));

    const values = samples.map((s) => s.elevationMeters);

    return {
      samples,
      minElevationMeters: values.length > 0 ? Math.min(...values) : 0,
      maxElevationMeters: values.length > 0 ? Math.max(...values) : 0,
      hasHighAltitude: detectHighAltitude(values, threshold),
      highAltitudeThresholdMeters: threshold,
    };
  }
}

export const openMeteoElevationService = new OpenMeteoElevationService();
