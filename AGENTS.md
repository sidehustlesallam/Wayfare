# AGENTS.md — Wayfare

Context guide for Cursor (or any coding agent) continuing work on this repository.

## What this project is

Wayfare is a **client-only** React + TypeScript road-trip planner deployed to **GitHub Pages**. There is no backend. All geospatial work goes through **zero-key adapters** in `src/services/`. Product intent lives in `PRD.md`; architecture in `Tech_Stack.md`; coding rules in `Project Standards.md` and `.cursor/rules/01-project-standards.mdc`.

**Repo:** https://github.com/sidehustlesallam/Wayfare  
**Demo:** https://sidehustlesallam.github.io/Wayfare/

## Non-negotiable rules

1. **No `any`.** Strict TypeScript. Prefer types from `src/types/`.
2. **No direct API calls from React components.** Use:
   - `GeocodingAdapter` / `NominatimService`
   - `RoutingAdapter` / `OSRMService`
   - `ElevationAdapter` / `OpenMeteoElevationService`
   - `getMapTileConfig()` for basemap URLs
3. **Feature flags first** (`src/config/features.ts`) for GPX, scenic UI, custom tiles, AI.
4. **Vite `base: './'`** must stay for GitHub Pages asset resolution.
5. **Debounce Nominatim ≥300ms** (`useGeocoding`).
6. Keep heavy math in pure `src/utils/` functions; keep Leaflet layers memoized.
7. Prefer small, focused diffs; do not rewrite unrelated docs/code.

## Bootstrapping a session

Read in this order when starting a non-trivial task:

1. `AGENTS.md` (this file)
2. `PRD.md` — what the product should do
3. `Tech_Stack.md` — where code lives
4. `Project Standards.md` / `.cursor/rules/01-project-standards.mdc`
5. The specific files you will touch (store, adapters, target components)

## Directory map (mental model)

| Path | Role |
| --- | --- |
| `src/App.tsx` | Shell; wires hydration, meta, routing, elevation hooks |
| `src/store/useTripStore.ts` | Single source of truth (waypoints, settings, route, elevation) |
| `src/hooks/` | Side-effect wiring to adapters (`useRouting`, `useElevationProfile`, …) |
| `src/services/**` | Provider implementations behind interfaces |
| `src/components/planner/` | Sidebar UX (waypoints, caps, borders, roadbook, profile) |
| `src/components/map/` | Leaflet layers + elevation drawer |
| `src/components/widget/` | Fuel calculator |
| `src/config/` | Flags, defaults, tile resolver |
| `src/utils/` | Pure helpers (fuel, borders, polyline, elevation sampling, GPX/TXT, share) |
| `src/test/` | Vitest setup + Leaflet mocks |
| `.github/workflows/deploy.yml` | test → build → Pages |

## Current shipped capabilities (do not regress)

- Multi-stop OSRM routing with turn steps; over-cap detection + stopover insert
- Over-cap polylines reach the destination (`splitGeometryByLegDistances` / haversine)
- Stopover hover preview on the map with drive time & distance from trip start
- Scenic (`exclude=motorway`) vs fastest profiles
- CARTO Voyager English tiles; OSM via `customMapTiles`
- Mid-route border sampling (~75 km) + 🛂 badges for every country change (not only endpoints)
- Fuel calculator with metric/imperial (metric stored internally)
- Elevation profile drawer + mountain-pass alert (≥1800 m) + hover marker
- Itinerary modal + roadbook TXT / print + GPX (`gpxExport`)
- LZ-String trip share + LocalStorage persist + OG meta
- PWA service worker
- Vitest suite (utils, borders, OSRM, store, WaypointList)

## Feature flags (as of now)

```ts
// src/config/features.ts
gpxExport: true
scenicRouting: true
customMapTiles: false  // false = CARTO Voyager default
aiItinerary: false
```

When adding a gated feature: default flag, check `isFeatureEnabled` in UI, keep adapter usable in tests regardless of flag where practical.

## How state flows

```
User action (sidebar)
  → useTripStore setters (immutable)
  → useRouting / useElevationProfile effects
  → adapters (fetch)
  → setRouteResult / setElevationProfile
  → map + widgets re-render
```

Fuel slider changes recalculate cost **locally** (no re-route). Waypoint/cap/profile changes re-fetch OSRM.

## Commands

```bash
npm install
npm run dev          # local app
npm run test         # Vitest once — required green before finishing
npm run test:watch
npm run build        # tsc -b && vite build (includes PWA SW)
npm run preview
npm run lint
```

CI on `main` runs `npm run test` then `npm run build` then deploys Pages.

## Testing guidance

- Prefer unit tests next to utils (`*.test.ts`) and service tests under `src/services/**`.
- Mock `fetch` for OSRM / elevation / Nominatim.
- Import `src/test/mocks/leaflet.ts` (or rely on setup) so Leaflet never hits canvas in jsdom.
- Exclude tests from `tsc -b` via `tsconfig.app.json` excludes (already configured).

## Common extension recipes

### Add a new zero-key provider
1. Define/extend interface in `src/services/<domain>/`.
2. Implement service class + singleton export.
3. Wire through a hook; never from a presentational component.
4. Add Vitest with mocked `fetch`.

### Add UI to the sidebar
1. Create component under `src/components/planner/` or `widget/`.
2. Read/write only via `useTripStore` selectors/actions.
3. Mount from `SidebarPanel.tsx`.

### Add export format
1. Pure builder in `src/utils/roadbook.ts` (or sibling).
2. Trigger download from planner UI.
3. Gate with a feature flag if premium/experimental.
4. Unit-test the serializer.

### Touch the map
1. Keep layers in `src/components/map/`.
2. `React.memo` markers/polylines; derive geometry with `useMemo`.
3. Use `getMapTileConfig()` — do not hardcode tile URLs in JSX.

## Known constraints / gotchas

- **Social crawlers ignore `#trip=` hashes** and usually do not run JS — OG tags in `index.html` are the share card; client meta sync improves tab titles only.
- **Public OSRM / Nominatim / Open-Meteo** have rate limits and no SLA; handle loading + errors in UI.
- **Scenic routing** depends on OSRM `exclude=motorway` support on the public demo server.
- **`og-image.png` is excluded from SW precache** (size); do not force-precache large binaries.
- Windows SSL quirks in some environments may need `NODE_OPTIONS=--use-system-ca` for npm.

## Suggested next work (if unspecified)

Prefer product gaps called out in `PRD.md` §5: AI itinerary (`aiItinerary`), toll estimates, polygon-accurate borders (vs sampled reverse-geocode), seasonal closure data, deeper offline tile packs.

### Gotchas for borders & polylines
- Do **not** revert border detection to waypoint-endpoint-only comparisons.
- Do **not** reintroduce crude `√(dLat²+dLng²)*111` leg slicing — it truncates dashed routes before the last stop.
- Nominatim reverse for border samples is cached on a ~0.01° grid; keep sample counts bounded (`sampleGeometryForBorders`).


## Done checklist for agent PRs

- [ ] Types strict; no provider calls from components
- [ ] Flags respected where required
- [ ] `npm run test` green
- [ ] `npm run build` green
- [ ] Docs updated if behavior/flags/architecture changed (`PRD` / `Tech_Stack` / `README` / this file as needed)
