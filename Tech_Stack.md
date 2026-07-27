# Technical Stack & Service Architecture — Wayfare

## 1. Core Framework & Build Infrastructure
- **Framework:** React 18+ with TypeScript (Strict Mode)
- **Build Tool:** Vite (configured for GitHub Pages static SPA deployment base paths)
- **Styling:** Tailwind CSS + Lucide React (UI icons)
- **State Management:** Zustand with `persist` middleware (LocalStorage support)

## 2. Geospatial & Mapping Services (Zero API Key)
- **Map Renderer:** Leaflet + `react-leaflet`
- **Map Tiles:** OpenStreetMap Standard (`tile.openstreetmap.org/{z}/{x}/{y}.png`)
- **Routing Engine:** Open Source Routing Machine (OSRM) Public API (`router.project-osrm.org` / `routing.openstreetmap.de`)
- **Geocoding & Location Search:** Nominatim OpenStreetMap API (`nominatim.openstreetmap.org`)

## 3. Architecture & Service Abstraction
To ensure modularity and support future premium providers (Mapbox, Google Maps, OpenRouteService), external services are accessed exclusively through interface abstractions:

```
src/
├── assets/
├── components/
│   ├── common/        # Buttons, Modals, Cards, Dropdowns
│   ├── map/           # Map container, Custom Markers, Polylines, Border Badges
│   ├── planner/       # Waypoint list, Day segments, Itinerary summary, Driving cap controls
│   └── widget/        # Fuel & cost calculator widget
├── config/            # Feature flags & environment defaults (`features.ts`)
├── hooks/             # Custom React hooks (`useRouting`, `useGeocoding`, `useBorderDetection`)
├── services/          # API Adapters (Zero-key OSRM & Nominatim adapters)
│   ├── geocoding/
│   │   ├── GeocodingAdapter.ts
│   │   └── NominatimService.ts
│   └── routing/
│       ├── RoutingAdapter.ts
│       └── OSRMService.ts
├── store/             # Zustand state stores (`useTripStore.ts`)
├── types/             # Shared TypeScript models (Waypoints, Routes, Borders, Cost)
└── utils/             # Polyline decoders, GeoJSON border math, LZ-string URL encoders
```

## 4. Key Data Models

### Waypoint Model
```typescript
export interface Waypoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  stopType: 'must-visit' | 'overnight';
  customDurationHours?: number;
}
```

### Route Segment & Border Model
```typescript
export interface RouteSegment {
  fromWaypointId: string;
  toWaypointId: string;
  distanceKm: number;
  durationMinutes: number;
  geometryPolyline: string; // Encoded polyline or LatLng array
  exceedsCap: boolean;
  midpointCoords?: [number, number];
  suggestedStopovers?: string[];
  borderCrossings: BorderCrossing[];
}

export interface BorderCrossing {
  fromCountry: string;
  toCountry: string;
  coordinates: [number, number];
  warnings: string[]; // Vignette required, Passport check, Driving side, etc.
}
```