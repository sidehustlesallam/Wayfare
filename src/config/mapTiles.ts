import {
  CARTO_ATTRIBUTION,
  CARTO_VOYAGER_URL,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
} from './defaults';
import { isFeatureEnabled } from './features';

export interface MapTileConfig {
  url: string;
  attribution: string;
  provider: 'carto-voyager' | 'osm-standard';
}

/**
 * Resolve the active basemap. Defaults to English-labeled CARTO Voyager.
 * When `customMapTiles` is enabled, fall back to OSM Standard (local scripts).
 */
export function getMapTileConfig(): MapTileConfig {
  if (isFeatureEnabled('customMapTiles')) {
    return {
      url: OSM_TILE_URL,
      attribution: OSM_ATTRIBUTION,
      provider: 'osm-standard',
    };
  }

  return {
    url: CARTO_VOYAGER_URL,
    attribution: CARTO_ATTRIBUTION,
    provider: 'carto-voyager',
  };
}
