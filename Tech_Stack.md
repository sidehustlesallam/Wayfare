# Technical Stack & Service Architecture — Wayfare

## 1. Core Framework & Build Infrastructure
- **Framework:** React 18+ with TypeScript (strict mode, no `any`)
- **Build Tool:** Vite 6 (`base: './'` for GitHub Pages)
- **Styling:** Tailwind CSS + Lucide React
- **State:** Zustand with `persist` (LocalStorage)
- **Testing:** Vitest + React Testing Library + jsdom
- **PWA:** `vite-plugin-pwa` (auto-update SW, Workbox runtime caching)
- **CI/CD:** `.github/workflows/deploy.yml` — `npm test` → `npm run build` → GitHub Pages

## 2. Geospatial & Mapping Services (Zero API Key)
- **Map Renderer:** Leaflet + `react-leaflet`
- **Default Tiles:** CARTO Voyager (English labels)  
  `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
- **Alternate Tiles:** OpenStreetMap Standard (when `customMapTiles` is enabled)
- **Routing:** OSRM Public API (`router.project-osrm.org`) — `steps=true`, scenic uses `exclude=motorway`
- **Geocoding:** Photon (Komoot) primary + Nominatim fallback — debounced ≥300ms; Nominatim gated ≤1 req/sec
- **Elevation:** Open-Meteo Elevation API (`api.open-meteo.com/v1/elevation`)

Resolved via `src/config/mapTiles.ts` → `getMapTileConfig()`.

## 3. Architecture & Service Abstraction

UI components never call provider APIs directly. They depend on adapters + hooks:

```
src/
├── assets/
├── components/
│   ├── common/        # Button, Card, Dropdown, Modal, Toast
│   ├── map/           # TripMap, polylines, markers, elevation drawer, border badges
│   ├── planner/       # Waypoints, caps, borders, roadbook, route profile, itinerary
│   └── widget/        # Fuel calculator
├── config/            # features.ts, defaults.ts, mapTiles.ts
├── hooks/             # useRouting, useGeocoding, useElevationProfile, useBorderDetection, …
├── services/
│   ├── geocoding/     # GeocodingAdapter, NominatimService
│   ├── routing/       # RoutingAdapter, OSRMService
│   └── elevation/     # ElevationAdapter, OpenMeteoElevationService
├── store/             # useTripStore.ts
├── test/              # Vitest setup + Leaflet mocks
├── types/             # Shared TypeScript models
└── utils/             # polyline, fuel, borders, borderRules, elevation, roadbook, tripShare, …
```

## 4. Key Data Models

### Waypoint
```typescript
export interface Waypoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  stopType: 'must-visit' | 'overnight';
  customDurationHours?: number;
  countryCode?: string;
  countryName?: string;
}
```

### Trip settings
```typescript
export type RouteProfile = 'fastest' | 'scenic';

export interface TripSettings {
  drivingCapHours: number;
  vehicleEfficiency: number;   // L/100km (or kWh/100km for EV)
  fuelPricePerLitre: number;   // per litre / kWh
  fuelType: 'gasoline' | 'diesel' | 'ev';
  unitSystem: 'metric' | 'imperial';
  routeProfile: RouteProfile;
}
```

### Route segment, stopovers, elevation
```typescript
export interface SuggestedStopover {
  label: string;
  coordinates: [number, number];
  driveMinutesFromSegmentStart: number;
  distanceKmFromSegmentStart: number;
  driveMinutesFromTripStart: number;
  distanceKmFromTripStart: number;
}

export interface RouteSegment {
  fromWaypointId: string;
  toWaypointId: string;
  distanceKm: number;
  durationMinutes: number;
  geometry: LatLng[];          // haversine-split; last leg keeps remainder
  geometryPolyline: string;
  exceedsCap: boolean;
  midpointCoords?: [number, number];
  suggestedStopovers?: SuggestedStopover[];
  borderCrossings: BorderCrossing[]; // mid-route samples, not just endpoints
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

export interface ElevationSample {
  lat: number;
  lng: number;
  elevationMeters: number;
  distanceKm: number;
}
```

## 5. State & Sharing
- **Store:** `useTripStore` holds waypoints, settings, segments, geometry, steps, metrics, elevation profile/hover, and `stopoverHover` for map preview.
- **Persist:** waypoints + settings only.
- **Share:** `src/utils/tripShare.ts` LZ-String encode/decode (`#trip=` / `?trip=`).
- **Hydration:** `useTripUrlHydration` applies shared trips after LocalStorage rehydrate (URL wins).
- **Borders:** `OSRMService` samples each leg (`sampleGeometryForBorders`) → Nominatim reverse (cached) → `crossingsFromCountrySamples`.
- **Polylines:** `splitGeometryByLegDistances` in `src/utils/polyline.ts` keeps over-cap dashes continuous to the last stop.

## 6. Testing Layout
| Suite | Focus |
| --- | --- |
| `borderRules.test.ts` | Crossing warnings (vignette, Schengen, driving side) |
| `borders.test.ts` | Mid-route sample crossings + leg geometry split |
| `costCalculator.test.ts` | Fuel math + unit conversions |
| `elevation.test.ts` | Route sampling + high-altitude detection |
| `roadbook.test.ts` | GPX + TXT roadbook generation |
| `OSRMService.test.ts` | Aggregation, over-cap midpoints, scenic exclude |
| `useTripStore.test.ts` | CRUD / reorder / share hydrate |
| `WaypointList.test.tsx` | Stop-type toggles + DnD reorder wiring |

Leaflet / react-leaflet are mocked in `src/test/mocks/leaflet.ts` for headless CI.
