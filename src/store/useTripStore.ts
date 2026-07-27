import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_DRIVING_CAP_HOURS,
  DEFAULT_FUEL_PRICE,
  DEFAULT_VEHICLE_EFFICIENCY,
} from '../config/defaults';
import type {
  ElevationProfile,
  ElevationSample,
  FuelType,
  LatLng,
  ManeuverStep,
  RouteMetrics,
  RouteProfile,
  RouteSegment,
  StopoverHover,
  StopType,
  TripSettings,
  UnitSystem,
  Waypoint,
} from '../types';
import { calculateFuelCost } from '../utils/fuel';

const EMPTY_METRICS: RouteMetrics = {
  totalDistanceKm: 0,
  totalDurationMinutes: 0,
  estimatedFuelCost: 0,
  estimatedFuelLitres: 0,
  overCapSegments: 0,
};

interface TripState {
  waypoints: Waypoint[];
  settings: TripSettings;
  segments: RouteSegment[];
  fullGeometry: LatLng[];
  steps: ManeuverStep[];
  metrics: RouteMetrics;
  isRouting: boolean;
  routingError: string | null;

  elevationProfile: ElevationProfile | null;
  isElevationLoading: boolean;
  elevationError: string | null;
  elevationHover: ElevationSample | null;
  stopoverHover: StopoverHover | null;

  addWaypoint: (waypoint: Omit<Waypoint, 'id'> & { id?: string }) => void;
  insertWaypoint: (
    waypoint: Omit<Waypoint, 'id'> & { id?: string },
    atIndex: number,
  ) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  reverseWaypoints: () => void;
  clearAllWaypoints: () => void;
  updateWaypoint: (id: string, patch: Partial<Omit<Waypoint, 'id'>>) => void;
  setStopType: (id: string, stopType: StopType) => void;
  hydrateFromShare: (waypoints: Waypoint[], settings: TripSettings) => void;

  setDrivingCapHours: (hours: number) => void;
  setVehicleEfficiency: (efficiency: number) => void;
  setFuelPricePerLitre: (price: number) => void;
  setFuelType: (fuelType: FuelType) => void;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  setRouteProfile: (routeProfile: RouteProfile) => void;

  setRouteResult: (
    segments: RouteSegment[],
    fullGeometry: LatLng[],
    metrics: RouteMetrics,
    steps?: ManeuverStep[],
  ) => void;
  setRoutingStatus: (isRouting: boolean, error?: string | null) => void;
  clearRoute: () => void;

  setElevationProfile: (profile: ElevationProfile | null) => void;
  setElevationStatus: (isLoading: boolean, error?: string | null) => void;
  setElevationHover: (sample: ElevationSample | null) => void;
  setStopoverHover: (hover: StopoverHover | null) => void;
}

function toWaypoint(
  waypoint: Omit<Waypoint, 'id'> & { id?: string },
): Waypoint {
  return {
    id: waypoint.id ?? createId(),
    label: waypoint.label,
    lat: waypoint.lat,
    lng: waypoint.lng,
    stopType: waypoint.stopType,
    customDurationHours: waypoint.customDurationHours,
    countryCode: waypoint.countryCode,
    countryName: waypoint.countryName,
  };
}

function createId(): string {
  return `wp_${crypto.randomUUID()}`;
}

function recalculateFuel(
  metrics: RouteMetrics,
  settings: TripSettings,
): RouteMetrics {
  const fuel = calculateFuelCost(
    metrics.totalDistanceKm,
    settings.vehicleEfficiency,
    settings.fuelPricePerLitre,
    settings.fuelType,
  );
  return { ...metrics, ...fuel };
}

function mergeSettings(partial?: Partial<TripSettings>): TripSettings {
  return {
    drivingCapHours: DEFAULT_DRIVING_CAP_HOURS,
    vehicleEfficiency: DEFAULT_VEHICLE_EFFICIENCY,
    fuelPricePerLitre: DEFAULT_FUEL_PRICE,
    fuelType: 'gasoline',
    unitSystem: 'metric',
    routeProfile: 'fastest',
    ...partial,
  };
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      waypoints: [],
      settings: mergeSettings(),
      segments: [],
      fullGeometry: [],
      steps: [],
      metrics: EMPTY_METRICS,
      isRouting: false,
      routingError: null,
      elevationProfile: null,
      isElevationLoading: false,
      elevationError: null,
      elevationHover: null,
      stopoverHover: null,

      addWaypoint: (waypoint) => {
        const next = toWaypoint(waypoint);
        set((state) => ({ waypoints: [...state.waypoints, next] }));
      },

      insertWaypoint: (waypoint, atIndex) => {
        const next = toWaypoint(waypoint);
        set((state) => {
          const clamped = Math.max(
            0,
            Math.min(atIndex, state.waypoints.length),
          );
          const waypoints = [...state.waypoints];
          waypoints.splice(clamped, 0, next);
          return { waypoints };
        });
      },

      removeWaypoint: (id) => {
        set((state) => ({
          waypoints: state.waypoints.filter((wp) => wp.id !== id),
        }));
      },

      reverseWaypoints: () => {
        set((state) => ({
          waypoints: [...state.waypoints].reverse(),
        }));
      },

      clearAllWaypoints: () => {
        set({
          waypoints: [],
          segments: [],
          fullGeometry: [],
          steps: [],
          metrics: EMPTY_METRICS,
          isRouting: false,
          routingError: null,
          elevationProfile: null,
          elevationError: null,
          elevationHover: null,
          stopoverHover: null,
          isElevationLoading: false,
        });
      },

      hydrateFromShare: (waypoints, settings) => {
        set({
          waypoints,
          settings: mergeSettings(settings),
          segments: [],
          fullGeometry: [],
          steps: [],
          metrics: EMPTY_METRICS,
          isRouting: false,
          routingError: null,
          elevationProfile: null,
          elevationError: null,
          elevationHover: null,
          stopoverHover: null,
        });
      },

      reorderWaypoints: (fromIndex, toIndex) => {
        set((state) => {
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= state.waypoints.length ||
            toIndex >= state.waypoints.length
          ) {
            return state;
          }
          const next = [...state.waypoints];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { waypoints: next };
        });
      },

      updateWaypoint: (id, patch) => {
        set((state) => ({
          waypoints: state.waypoints.map((wp) =>
            wp.id === id ? { ...wp, ...patch } : wp,
          ),
        }));
      },

      setStopType: (id, stopType) => {
        get().updateWaypoint(id, { stopType });
      },

      setDrivingCapHours: (hours) => {
        set((state) => ({
          settings: { ...state.settings, drivingCapHours: hours },
        }));
      },

      setVehicleEfficiency: (efficiency) => {
        set((state) => {
          const settings = {
            ...state.settings,
            vehicleEfficiency: efficiency,
          };
          return {
            settings,
            metrics: recalculateFuel(state.metrics, settings),
          };
        });
      },

      setFuelPricePerLitre: (price) => {
        set((state) => {
          const settings = {
            ...state.settings,
            fuelPricePerLitre: price,
          };
          return {
            settings,
            metrics: recalculateFuel(state.metrics, settings),
          };
        });
      },

      setFuelType: (fuelType) => {
        set((state) => {
          const settings = { ...state.settings, fuelType };
          return {
            settings,
            metrics: recalculateFuel(state.metrics, settings),
          };
        });
      },

      setUnitSystem: (unitSystem) => {
        set((state) => ({
          settings: { ...state.settings, unitSystem },
        }));
      },

      setRouteProfile: (routeProfile) => {
        set((state) => ({
          settings: { ...state.settings, routeProfile },
        }));
      },

      setRouteResult: (segments, fullGeometry, metrics, steps = []) => {
        set({
          segments,
          fullGeometry,
          metrics,
          steps,
          isRouting: false,
          routingError: null,
        });
      },

      setRoutingStatus: (isRouting, error = null) => {
        set({ isRouting, routingError: error });
      },

      clearRoute: () => {
        set({
          segments: [],
          fullGeometry: [],
          steps: [],
          metrics: EMPTY_METRICS,
          routingError: null,
          elevationProfile: null,
          elevationError: null,
          elevationHover: null,
          stopoverHover: null,
          isElevationLoading: false,
        });
      },

      setElevationProfile: (profile) => {
        set({
          elevationProfile: profile,
          isElevationLoading: false,
          elevationError: null,
        });
      },

      setElevationStatus: (isLoading, error = null) => {
        set({ isElevationLoading: isLoading, elevationError: error });
      },

      setElevationHover: (sample) => {
        set({ elevationHover: sample });
      },

      setStopoverHover: (hover) => {
        set({ stopoverHover: hover });
      },
    }),
    {
      name: 'wayfare-trip-store',
      partialize: (state) => ({
        waypoints: state.waypoints,
        settings: state.settings,
      }),
      merge: (persisted, current) => {
        const partial = persisted as Partial<TripState> | undefined;
        return {
          ...current,
          ...partial,
          settings: mergeSettings(partial?.settings),
          waypoints: partial?.waypoints ?? current.waypoints,
        };
      },
    },
  ),
);
