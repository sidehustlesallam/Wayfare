/** Default trip planner settings used on first load. */
export const DEFAULT_DRIVING_CAP_HOURS = 6;
export const DEFAULT_VEHICLE_EFFICIENCY = 7.5; // L/100km
export const DEFAULT_FUEL_PRICE = 1.65; // EUR per litre
export const GEOCODING_DEBOUNCE_MS = 300;
export const MOUNTAIN_PASS_THRESHOLD_M = 1800;
export const ELEVATION_SAMPLE_COUNT = 80;

/** Allowed daily driving cap options (hours). */
export const DRIVING_CAP_OPTIONS = [4, 6, 8, 10] as const;

export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
export const OSRM_BASE_URL = 'https://router.project-osrm.org';
export const OPEN_METEO_ELEVATION_URL =
  'https://api.open-meteo.com/v1/elevation';

/** Default English-labeled basemap (CARTO Voyager). */
export const CARTO_VOYAGER_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Alternate local-script OSM tiles (enabled via `customMapTiles`). */
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
