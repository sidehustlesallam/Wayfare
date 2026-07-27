import { NOMINATIM_BASE_URL } from '../../config/defaults';
import type { GeocodingResult } from '../../types';
import type { GeocodingAdapter } from './GeocodingAdapter';

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

/**
 * Zero-key Nominatim geocoding adapter.
 * Callers should debounce searches (≥300ms) via `useGeocoding`.
 */
export class NominatimService implements GeocodingAdapter {
  private readonly baseUrl: string;
  private readonly userAgent: string;

  constructor(
    baseUrl: string = NOMINATIM_BASE_URL,
    userAgent = 'Wayfare/0.1 (road-trip-planner; github-pages)',
  ) {
    this.baseUrl = baseUrl;
    this.userAgent = userAgent;
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
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim search failed (${response.status})`);
    }

    const data = (await response.json()) as NominatimResponseItem[];
    return data.map(toResult);
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
    });

    const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
      signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse failed (${response.status})`);
    }

    const data = (await response.json()) as NominatimResponseItem & {
      error?: string;
    };

    if (data.error) return null;
    return toResult(data);
  }
}

export const nominatimService = new NominatimService();
