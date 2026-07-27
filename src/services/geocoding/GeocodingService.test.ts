import { describe, expect, it, vi } from 'vitest';
import { PhotonService } from './PhotonService';
import { ResilientGeocodingService } from './NominatimService';

describe('PhotonService', () => {
  it('maps search features to GeocodingResult', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            {
              geometry: { coordinates: [2.35, 48.85] },
              properties: {
                osm_type: 'N',
                osm_id: 42,
                name: 'Paris',
                country: 'France',
                countrycode: 'fr',
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const service = new PhotonService();
    const results = await service.search('Paris');

    expect(results).toHaveLength(1);
    expect(results[0].label).toBe('Paris');
    expect(results[0].countryCode).toBe('FR');
    expect(results[0].lat).toBeCloseTo(48.85);
  });
});

describe('ResilientGeocodingService', () => {
  it('falls back when the primary search fails', async () => {
    const primary = {
      search: vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
      reverse: vi.fn(),
    };
    const fallback = {
      search: vi.fn().mockResolvedValue([
        {
          id: '1',
          label: 'Lyon',
          displayName: 'Lyon, France',
          lat: 45.75,
          lng: 4.85,
          countryCode: 'FR',
        },
      ]),
      reverse: vi.fn(),
    };

    const service = new ResilientGeocodingService(primary, fallback);
    const results = await service.search('Lyon');

    expect(primary.search).toHaveBeenCalled();
    expect(fallback.search).toHaveBeenCalled();
    expect(results[0].label).toBe('Lyon');
  });
});
