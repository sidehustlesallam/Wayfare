import type { GeocodingResult } from '../../types';

/**
 * Abstraction for address / place lookup providers.
 * UI components must depend on this interface, never on a concrete API.
 */
export interface GeocodingAdapter {
  /** Search places by free-text query. Implementations should be cancel-safe. */
  search(query: string, signal?: AbortSignal): Promise<GeocodingResult[]>;

  /** Reverse-geocode a coordinate into a human-readable label. */
  reverse(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<GeocodingResult | null>;
}
