export type StopType = 'must-visit' | 'overnight';

export type FuelType = 'gasoline' | 'diesel' | 'ev';

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
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BorderCrossing {
  fromCountry: string;
  toCountry: string;
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

export interface TripSettings {
  drivingCapHours: number;
  vehicleEfficiency: number;
  fuelPricePerLitre: number;
  fuelType: FuelType;
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
}

export interface RouteResult {
  segments: RouteSegment[];
  metrics: RouteMetrics;
  fullGeometry: LatLng[];
}
