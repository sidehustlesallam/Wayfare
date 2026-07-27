/**
 * Feature flag registry for premium / experimental modules.
 * Gate complex modules behind these flags before initializing them.
 */
export interface FeatureFlags {
  /** Offline GPX / GeoJSON & PDF export playbooks */
  gpxExport: boolean;
  /** AI-assisted itinerary generation */
  aiItinerary: boolean;
  /** Prefer scenic tertiary roads over motorways */
  scenicRouting: boolean;
  /** Alternate / custom map tile providers */
  customMapTiles: boolean;
}

export const features: FeatureFlags = {
  gpxExport: true,
  aiItinerary: false,
  scenicRouting: true,
  customMapTiles: false,
};

/** Returns true when the named feature is enabled. */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return features[flag];
}
