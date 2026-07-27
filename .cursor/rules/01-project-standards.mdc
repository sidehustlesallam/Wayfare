---
description: Architecture, coding rules, and design patterns for Wayfare road trip planner
globs: src/**/*.ts, src/**/*.tsx
alwaysApply: true
---

# Project Coding Rules & Architectural Guidelines

## 1. Modular Architecture & Plugin Design
- **Feature Flags First:** Always check `src/config/features.ts` before initializing gated modules (`gpxExport`, `scenicRouting`, `customMapTiles`, `aiItinerary`).
- **Service Abstraction:** Never call OSRM, Nominatim, Open-Meteo, or tile URLs directly inside React components. Use adapters in `src/services/` (`RoutingAdapter`, `GeocodingAdapter`, `ElevationAdapter`) and `getMapTileConfig()` for basemaps.
- **Hooks as wiring:** Live fetches belong in hooks (`useRouting`, `useGeocoding`, `useElevationProfile`), not leaf UI components.

## 2. TypeScript & Type Safety Rules
- **No `any`:** Strict mode is enabled. Use explicit interfaces from `src/types/`.
- **Discriminant Unions:** Prefer unions for stop types (`'must-visit' | 'overnight'`), route profiles (`'fastest' | 'scenic'`), unit systems, fuel types, and border warning kinds.
- **Immutability:** Treat Zustand state as immutable; return new objects/arrays via spreads.

## 3. Performance & Map Optimization Rules
- **Component Memoization:** Memoize Leaflet children (Polylines, Markers, Popups) or their geometry props.
- **Debounced Geocoding:** Nominatim search inputs must use ≥300ms debounce (`useGeocoding`).
- **Client-Side Utils:** Midpoints, haversine leg splits, elevation/border sampling, border rules, GPX/TXT builders stay pure functions in `src/utils/`.
- **Elevation sampling:** Cap sample counts (see `ELEVATION_SAMPLE_COUNT`) to keep Open-Meteo batches small.

## 4. GitHub Pages & PWA Compatibility
- **Zero Backend:** Routing, geocoding, elevation, persistence, sharing, and exports are entirely client-side.
- **Relative Paths:** Keep Vite `base: './'` so assets resolve on project Pages URLs.
- **PWA:** Do not precache oversized social assets (e.g. `og-image.png`); prefer Workbox `globIgnores` / size limits.

## 5. Testing Expectations
- Add Vitest coverage for new pure utils and adapter edge cases.
- Mock Leaflet / network in component and service tests; keep CI headless-friendly.
- Run `npm run test` before relying on a change; CI runs tests before Pages deploy.
