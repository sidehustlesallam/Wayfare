export type StopType = 'must-visit' | 'overnight';

export type FuelType = 'gasoline' | 'diesel' | 'ev';

export type UnitSystem = 'metric' | 'imperial';

export type RouteProfile = 'fastest' | 'scenic';

export type BorderWarningKind =
  | 'vignette'
  | 'passport'
  | 'driving-side'
  | 'currency'
  | 'general';

export interface Waypoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  stopType: StopType;
  customDurationHours?: number;
  countryCode?: string;
  countryName?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BorderCrossing {
  fromCountry: string;
  toCountry: string;
  fromCountryCode?: string;
  toCountryCode?: string;
  coordinates: [number, number];
  warnings: string[];
  warningKinds?: BorderWarningKind[];
}

export interface RouteSegment {
  fromWaypointId: string;
  toWaypointId: string;
  distanceKm: number;
  durationMinutes: number;
  /** Decoded lat/lng pairs for map rendering */
  geometry: LatLng[];
  /** Encoded polyline string from the routing provider */
  geometryPolyline: string;
  exceedsCap: boolean;
  /** Coordinate where the driving cap is reached along this segment */
  midpointCoords?: [number, number];
  suggestedStopovers?: string[];
  borderCrossings: BorderCrossing[];
}

export interface ManeuverStep {
  index: number;
  instruction: string;
  streetName: string;
  distanceMeters: number;
  durationSeconds: number;
  type: string;
  modifier?: string;
  location: LatLng;
}

export interface TripSettings {
  drivingCapHours: number;
  /** Always stored as L/100km (or kWh/100km for EV). */
  vehicleEfficiency: number;
  /** Always stored as price per litre (or per kWh for EV). */
  fuelPricePerLitre: number;
  fuelType: FuelType;
  unitSystem: UnitSystem;
  routeProfile: RouteProfile;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedFuelCost: number;
  estimatedFuelLitres: number;
  overCapSegments: number;
}

export interface GeocodingResult {
  id: string;
  label: string;
  displayName: string;
  lat: number;
  lng: number;
  countryCode?: string;
  countryName?: string;
}

export interface RouteRequest {
  waypoints: Waypoint[];
  drivingCapHours: number;
  routeProfile: RouteProfile;
}

export interface RouteResult {
  segments: RouteSegment[];
  metrics: RouteMetrics;
  fullGeometry: LatLng[];
  steps: ManeuverStep[];
}

export interface ElevationSample {
  lat: number;
  lng: number;
  elevationMeters: number;
  /** Distance along the route from the start, in kilometres */
  distanceKm: number;
}

export interface ElevationProfile {
  samples: ElevationSample[];
  minElevationMeters: number;
  maxElevationMeters: number;
  hasHighAltitude: boolean;
  highAltitudeThresholdMeters: number;
}
