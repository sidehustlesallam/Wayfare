# Product Requirements Document (PRD) — Wayfare

## 1. Executive Summary
Wayfare is a zero-cost, modular, static-deployable web application for planning multi-stop, long-distance, and international road trips. It fills the gap left by transit-focused tools (like Rome2Rio) by prioritizing driveability, customizable daily driving caps, border logistics, fuel/toll cost estimations, and zero-key public routing.

## 2. Target Platform & Deployment
- **Hosting Environment:** GitHub Pages (Single Page Application via static export).
- **Backend Architecture:** Pure client-side heavy application. External APIs are accessed directly from the browser using zero-key open service adapters.
- **Modularity:** Core feature set built with modular plugin interfaces to support future premium features (offline exports, AI itinerary generation, toll calculators) behind feature flags.

## 3. Key User Workflows & Core Features (V1)

### 3.1. Zero-Key Interactive Multi-Stop Routing
- Users can add, reorder, and remove waypoints (start, destination, and intermediate stops).
- Geocoding and route polyline generation use zero-key open APIs (Nominatim and OSRM demo endpoints).
- Waypoints support distinction between "Must Visit" stops and "Overnight Stays".

### 3.2. Advanced Daily Driving Caps & Midpoint Suggestions
- **User Config:** Dropdown selector to set maximum daily driving limit in hours (e.g., 4h, 6h, 8h, 10h).
- **Over-Cap Detection:** Segments exceeding the cap are highlighted on the map (amber/red warning polyline) and flagged in the itinerary sidebar.
- **Smart Stopover Suggestions:** The system calculates the geographical coordinate along the route where the hour cap is reached and queries nearby popular towns/cities to suggest as break points.

### 3.3. International Border Awareness & Warnings
- Automated detection when a route segment crosses international boundaries.
- Visual map indicators (border crossing badges 🛂) placed on boundary intersections.
- Contextual warning cards providing regional logistics alerts:
  - Highway Vignette requirements (e.g., Switzerland, Austria, Slovenia).
  - Schengen vs Non-Schengen passport control alerts.
  - Driving side change notices (e.g., UK to France).
  - Currency conversion reminders.

### 3.4. Fuel & Travel Cost Estimator
- Client-side budget calculator widget taking user input for:
  - Vehicle consumption rate (L/100km or MPG).
  - Fuel type (Gasoline, Diesel, EV).
- Live calculation displaying estimated total fuel required and total estimated fuel cost.

### 3.5. State Persistence & URL Sharing
- LocalStorage state persistence so users never lose their active session on page refresh.
- URL hash/query string encoding (via LZ-string compression) enabling full itinerary sharing via direct link without a backend database.

## 4. Future Modular Extensions (V2+)
- **Feature Flag Registry:** Gated via `src/config/features.ts`.
- **GPX / GeoJSON & PDF Export:** Export offline-ready turn-by-turn route playbooks.
- **Scenic vs. Fast Routing Toggle:** Option to avoid high-speed motorways in favor of regional tertiary roads.
- **Elevation Profiler:** Identify high-altitude mountain passes and seasonal road closures.