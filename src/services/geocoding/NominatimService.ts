import {
  NOMINATIM_BASE_URL,
  NOMINATIM_CONTACT_EMAIL,
  NOMINATIM_MIN_INTERVAL_MS,
} from '../../config/defaults';
import type { GeocodingResult } from '../../types';
import { RequestGate } from '../../utils/requestGate';
import type { GeocodingAdapter } from './GeocodingAdapter';
import { photonService } from './PhotonService';

interface NominatimResponseItem {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
    country_code?: string;
  };
}

function toResult(item: NominatimResponseItem): GeocodingResult {
  const localName =
    item.name ||
    item.address?.city ||
    item.address?.town ||
    item.address?.village ||
    item.address?.municipality ||
    item.display_name.split(',')[0]?.trim() ||
    'Unknown place';

  return {
    id: String(item.place_id),
    label: localName,
    displayName: item.display_name,
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    countryCode: item.address?.country_code?.toUpperCase(),
    countryName: item.address?.country,
  };
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/**
 * Zero-key Nominatim geocoding adapter.
 *
 * Browsers forbid custom `User-Agent` headers — identify via the `email`
 * query param + automatic Referer instead. All calls share a ≤1 req/sec gate.
 */
export class NominatimService implements GeocodingAdapter {
  private readonly baseUrl: string;
  private readonly contactEmail: string;
  private readonly gate: RequestGate;

  constructor(
    baseUrl: string = NOMINATIM_BASE_URL,
    contactEmail: string = NOMINATIM_CONTACT_EMAIL,
    minIntervalMs: number = NOMINATIM_MIN_INTERVAL_MS,
  ) {
    this.baseUrl = baseUrl;
    this.contactEmail = contactEmail;
    this.gate = new RequestGate(minIntervalMs);
  }

  async search(
    query: string,
    signal?: AbortSignal,
  ): Promise<GeocodingResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const params = new URLSearchParams({
      q: trimmed,
      format: 'json',
      addressdetails: '1',
      limit: '6',
      email: this.contactEmail,
    });

    return this.gate.schedule(async () => {
      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Nominatim search failed (${response.status})`);
      }

      const data = (await response.json()) as NominatimResponseItem[];
      return data.map(toResult);
    }, signal);
  }

  async reverse(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      addressdetails: '1',
      email: this.contactEmail,
    });

    return this.gate.schedule(async () => {
      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Nominatim reverse failed (${response.status})`);
      }

      const data = (await response.json()) as NominatimResponseItem & {
        error?: string;
      };

      if (data.error) return null;
      return toResult(data);
    }, signal);
  }
}

export const nominatimService = new NominatimService();

/**
 * Photon-first geocoding for browsers (CORS-friendly). Falls back to
 * rate-limited Nominatim when Photon fails.
 *
 * Nominatim often surfaces blocks as TypeError: Failed to fetch (no CORS
 * headers on 403 responses). Using Photon first keeps search responsive.
 */
export class ResilientGeocodingService implements GeocodingAdapter {
  private readonly primary: GeocodingAdapter;
  private readonly fallback: GeocodingAdapter;

  constructor(
    primary: GeocodingAdapter = photonService,
    fallback: GeocodingAdapter = nominatimService,
  ) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async search(
    query: string,
    signal?: AbortSignal,
  ): Promise<GeocodingResult[]> {
    try {
      return await this.primary.search(query, signal);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) throw err;
      return this.fallback.search(query, signal);
    }
  }

  async reverse(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<GeocodingResult | null> {
    try {
      return await this.primary.reverse(lat, lng, signal);
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) throw err;
      return this.fallback.reverse(lat, lng, signal);
    }
  }
}

/** App-wide geocoder (Photon → Nominatim). */
export const geocodingService = new ResilientGeocodingService();
