# Wayfare

Wayfare is a zero-cost, client-side road trip planner for multi-stop, long-distance, and international drives. It focuses on driveability — daily driving caps, fuel estimates, border logistics, and shareable itineraries — using open, zero-key mapping APIs. No backend required.

## Features

- **Multi-stop routing** — Add, reorder, and remove waypoints with must-visit vs overnight stop types
- **Daily driving caps** — Flag over-cap segments on the map and suggest midpoint stopovers
- **Fuel & cost estimator** — Live totals from efficiency, fuel type, and price inputs
- **Border awareness** — Vignette, passport, driving-side, and currency reminders
- **Persistence & sharing** — LocalStorage session restore plus LZ-String compressed `#trip=` share links

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 18, TypeScript (strict), Tailwind CSS, Lucide |
| State | Zustand + LocalStorage persist |
| Map | Leaflet / react-leaflet, OpenStreetMap tiles |
| Geocoding | Nominatim (debounced search) |
| Routing | OSRM public demo API |
| Build / host | Vite SPA → GitHub Pages |

External services are reached only through adapters in `src/services/` (`GeocodingAdapter`, `RoutingAdapter`). Feature flags live in `src/config/features.ts`.

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build    # typecheck + production build → dist/
npm run preview  # serve the production build locally
npm run lint
```

## Deploy (GitHub Pages)

1. In the repo: **Settings → Pages → Source → GitHub Actions**
2. Push to `main` (or run the workflow manually)

`.github/workflows/deploy.yml` builds the app and publishes `dist/`. Vite is configured with `base: './'` so assets resolve on project Pages URLs.

## Project layout

```
src/
├── components/   # common, map, planner, widget UI
├── config/       # feature flags & defaults
├── hooks/        # useRouting, useGeocoding, useBorderDetection, …
├── services/     # Nominatim & OSRM adapters
├── store/        # useTripStore (waypoints, settings, route metrics)
├── types/        # shared TypeScript models
└── utils/        # polyline, fuel, borders, trip URL encode/decode
```

Product and architecture specs: [`PRD.md`](./PRD.md), [`Tech_Stack.md`](./Tech_Stack.md), [`Project Standards.md`](./Project%20Standards.md).

## Attribution

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Routing via [OSRM](http://project-osrm.org/); geocoding via [Nominatim](https://nominatim.org/). Please respect public API usage policies when developing against them.
