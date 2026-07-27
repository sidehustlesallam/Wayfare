/** Default trip planner settings used on first load. */
export const DEFAULT_DRIVING_CAP_HOURS = 6;
export const DEFAULT_VEHICLE_EFFICIENCY = 7.5; // L/100km
export const DEFAULT_FUEL_PRICE = 1.65; // EUR per litre
export const GEOCODING_DEBOUNCE_MS = 300;

/** Allowed daily driving cap options (hours). */
export const DRIVING_CAP_OPTIONS = [4, 6, 8, 10] as const;

export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
export const OSRM_BASE_URL = 'https://router.project-osrm.org';

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Known vignette / border logistics by ISO country code. */
export const BORDER_LOGISTICS: Record<
  string,
  { vignette?: string; passport?: string; drivingSide?: string; currency?: string }
> = {
  CH: {
    vignette: 'Swiss motorway vignette required for all motorways.',
    currency: 'Currency changes to Swiss Franc (CHF).',
  },
  AT: {
    vignette: 'Austrian Autobahn vignette (Vignette) required.',
  },
  SI: {
    vignette: 'Slovenian electronic vignette (e-vinjeta) required.',
  },
  HU: {
    vignette: 'Hungarian e-vignette (e-matrica) required on motorways.',
  },
  CZ: {
    vignette: 'Czech motorway vignette required.',
  },
  SK: {
    vignette: 'Slovak motorway e-vignette required.',
  },
  RO: {
    vignette: 'Romanian rovinieta required on national roads.',
  },
  BG: {
    vignette: 'Bulgarian vignette required on national roads.',
  },
  GB: {
    passport: 'Leaving / entering Schengen — passport control expected.',
    drivingSide: 'Driving side changes to left-hand traffic.',
    currency: 'Currency changes to Pound Sterling (GBP).',
  },
  IE: {
    drivingSide: 'Driving side is left-hand traffic.',
    currency: 'Euro (EUR) in use.',
  },
};
