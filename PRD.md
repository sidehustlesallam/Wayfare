# Product Requirements Document (PRD) — Wayfare

## 1. Executive Summary
Wayfare is a zero-cost, modular, static-deployable web application for planning multi-stop, long-distance, and international road trips. It fills the gap left by transit-focused tools (like Rome2Rio) by prioritizing driveability, customizable daily driving caps, border logistics, fuel cost estimations, scenic vs fastest routing, elevation awareness, and zero-key public routing — all without a backend.

## 2. Target Platform & Deployment
- **Hosting Environment:** GitHub Pages (SPA via static export + GitHub Actions).
- **Backend Architecture:** Pure client-side application. External APIs are accessed from the browser through zero-key open service adapters.
- **PWA:** Installable Progressive Web App (`vite-plugin-pwa`) with offline app-shell caching and LocalStorage itinerary persistence.
- **Modularity:** Features are gated via `src/config/features.ts` so premium / experimental modules stay toggleable.

**Live demo:** https://sidehustlesallam.github.io/Wayfare/

## 3. Key User Workflows & Core Features

### 3.1. Zero-Key Interactive Multi-Stop Routing
- Add, reorder (drag-and-drop), reverse, clear, and remove waypoints.
- Geocoding via Nominatim (debounced ≥300ms); routing via OSRM public demo.
- Waypoints distinguish **Must Visit** vs **Overnight** stops.
- English-labeled basemap by default (CARTO Voyager); OSM Standard available when `customMapTiles` is enabled.

### 3.2. Scenic vs Fastest Routing
- Sidebar toggle between **Fastest Motorway** and **Scenic / Secondary Roads**.
- Scenic profile calls OSRM with `exclude=motorway` and re-fetches geometry + metrics on change.
- Gated by the `scenicRouting` feature flag.

### 3.3. Advanced Daily Driving Caps & Midpoint Suggestions
- Dropdown for max daily drive time (4h / 6h / 8h / 10h).
- Over-cap segments highlighted amber (dashed) on the map through to the destination waypoint (leg geometries split with haversine; final leg consumes remaining polyline).
- Cap midpoint computed along the polyline; nearby towns suggested with **Insert Stop**.
- Hovering a suggested stop highlights it on the map and shows drive time / distance from trip start (plus when the cap is reached on that leg).

### 3.4. International Border Awareness & Warnings
- Country transitions detected by sampling each route leg (~every 75 km) and reverse-geocoding — every mid-route change is flagged, not only first↔last stop countries.
- Map badges 🛂 at estimated border coordinates between consecutive country samples.
- Sidebar alert cards for vignette, Schengen/passport, driving-side, and currency rules (`src/utils/borderRules.ts`).

### 3.5. Fuel & Travel Cost Estimator
- Inputs: efficiency, fuel price, fuel type (gasoline / diesel / EV).
- Metric ↔ Imperial toggle (L/100km·€/L·km vs MPG·$/gal·mi); stored internally as metric.
- Live totals from `totalDistanceKm`: fuel = (km / 100) × efficiency; cost = fuel × price.

### 3.6. Elevation & Mountain Pass Profiler
- Open-Meteo elevation samples along the active route polyline.
- Interactive SVG elevation drawer on the map canvas; hover syncs a map marker.
- **Mountain Pass Alert** when any sample ≥ 1800 m (steep grades / seasonal closures).

### 3.7. Itinerary, Roadbook & Offline Export
- Day-by-day itinerary view grouped by overnight stops + driving cap.
- Print / Save PDF playbooks (itinerary + turn-by-turn roadbook).
- Downloadable TXT driving instructions from OSRM maneuver steps.
- GPX export (track + waypoints + turn route points) gated by `gpxExport`.

### 3.8. State Persistence & URL Sharing
- Zustand + LocalStorage persistence for waypoints and settings.
- LZ-String compressed `#trip=` / `?trip=` share links; URL wins over LocalStorage on load.
- Open Graph / Twitter Card meta tags for social previews; client title updates with active itinerary.

## 4. Feature Flag Registry (`src/config/features.ts`)

| Flag | Default | Purpose |
| --- | --- | --- |
| `gpxExport` | `true` | GPX roadbook download |
| `scenicRouting` | `true` | Scenic vs fastest profile toggle |
| `customMapTiles` | `false` | Swap CARTO Voyager → OSM Standard |
| `aiItinerary` | `false` | Reserved for AI itinerary generation |

## 5. Future Extensions
- AI-assisted itinerary suggestions (`aiItinerary`).
- Toll cost calculators and polygon-accurate border intersection (vs sampled reverse-geocode).
- Additional elevation providers / seasonal closure datasets.
- Deeper offline tile packs beyond the PWA app-shell cache.
