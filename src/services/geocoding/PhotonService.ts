import { PHOTON_BASE_URL } from '../../config/defaults';
import type { GeocodingResult } from '../../types';
import type { GeocodingAdapter } from './GeocodingAdapter';

interface PhotonFeature {
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
    countrycode?: string;
    state?: string;
    type?: string;
  };
  geometry?: {
    coordinates?: [number, number];
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

function featureToResult(feature: PhotonFeature, index: number): GeocodingResult | null {
  const coords = feature.geometry?.coordinates;
  const props = feature.properties;
  if (!coords || !props) return null;

  const [lng, lat] = coords;
  const label =
    props.name ||
    props.city ||
    props.town ||
    props.village ||
    props.municipality ||
    'Unknown place';

  const parts = [
    props.name,
    props.city || props.town || props.village,
    props.state,
    props.country,
  ].filter((part, i, arr) => part && arr.indexOf(part) === i);

  const id =
    props.osm_type && props.osm_id
      ? `${props.osm_type}:${props.osm_id}`
      : `photon-${index}-${lat.toFixed(5)}-${lng.toFixed(5)}`;

  return {
    id,
    label,
    displayName: parts.join(', ') || label,
    lat,
    lng,
    countryCode: props.countrycode?.toUpperCase(),
    countryName: props.country,
  };
}

/**
 * Komoot Photon geocoder — CORS-friendly browser fallback when Nominatim
 * is blocked, rate-limited, or unreachable.
 */
export class PhotonService implements GeocodingAdapter {
  private readonly baseUrl: string;

  constructor(baseUrl: string = PHOTON_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async search(
    query: string,
    signal?: AbortSignal,
  ): Promise<GeocodingResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const params = new URLSearchParams({
      q: trimmed,
      limit: '6',
      lang: 'en',
    });

    const response = await fetch(`${this.baseUrl}/api/?${params}`, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Photon search failed (${response.status})`);
    }

    const data = (await response.json()) as PhotonResponse;
    return (data.features ?? [])
      .map((feature, index) => featureToResult(feature, index))
      .filter((result): result is GeocodingResult => result !== null);
  }

  async reverse(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      lang: 'en',
    });

    const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Photon reverse failed (${response.status})`);
    }

    const data = (await response.json()) as PhotonResponse;
    const feature = data.features?.[0];
    if (!feature) return null;
    return featureToResult(feature, 0);
  }
}

export const photonService = new PhotonService();
