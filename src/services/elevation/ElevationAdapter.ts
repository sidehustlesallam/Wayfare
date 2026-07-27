import type { ElevationProfile, LatLng } from '../../types';

export interface ElevationAdapter {
  /**
   * Lookup elevations for a list of coordinates (order preserved).
   * Implementations should batch requests to respect public API limits.
   */
  lookup(
    points: LatLng[],
    signal?: AbortSignal,
  ): Promise<number[]>;

  /** Sample a route geometry into a full elevation profile. */
  profileRoute(
    geometry: LatLng[],
    options?: {
      maxSamples?: number;
      highAltitudeThresholdMeters?: number;
      signal?: AbortSignal;
    },
  ): Promise<ElevationProfile>;
}
