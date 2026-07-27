import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_DRIVING_CAP_HOURS,
  DEFAULT_FUEL_PRICE,
  DEFAULT_VEHICLE_EFFICIENCY,
} from '../config/defaults';
import type {
  FuelType,
  LatLng,
  RouteMetrics,
  RouteSegment,
  StopType,
  TripSettings,
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
  metrics: RouteMetrics;
  isRouting: boolean;
  routingError: string | null;

  addWaypoint: (waypoint: Omit<Waypoint, 'id'> & { id?: string }) => void;
  insertWaypoint: (
    waypoint: Omit<Waypoint, 'id'> & { id?: string },
    atIndex: number,
  ) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  updateWaypoint: (id: string, patch: Partial<Omit<Waypoint, 'id'>>) => void;
  setStopType: (id: string, stopType: StopType) => void;
  hydrateFromShare: (waypoints: Waypoint[], settings: TripSettings) => void;

  setDrivingCapHours: (hours: number) => void;
  setVehicleEfficiency: (efficiency: number) => void;
  setFuelPricePerLitre: (price: number) => void;
  setFuelType: (fuelType: FuelType) => void;

  setRouteResult: (
    segments: RouteSegment[],
    fullGeometry: LatLng[],
    metrics: RouteMetrics,
  ) => void;
  setRoutingStatus: (isRouting: boolean, error?: string | null) => void;
  clearRoute: () => void;
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

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      waypoints: [],
      settings: {
        drivingCapHours: DEFAULT_DRIVING_CAP_HOURS,
        vehicleEfficiency: DEFAULT_VEHICLE_EFFICIENCY,
        fuelPricePerLitre: DEFAULT_FUEL_PRICE,
        fuelType: 'gasoline',
      },
      segments: [],
      fullGeometry: [],
      metrics: EMPTY_METRICS,
      isRouting: false,
      routingError: null,

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

      hydrateFromShare: (waypoints, settings) => {
        set({
          waypoints,
          settings,
          segments: [],
          fullGeometry: [],
          metrics: EMPTY_METRICS,
          isRouting: false,
          routingError: null,
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

      setRouteResult: (segments, fullGeometry, metrics) => {
        set({
          segments,
          fullGeometry,
          metrics,
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
          metrics: EMPTY_METRICS,
          routingError: null,
        });
      },
    }),
    {
      name: 'wayfare-trip-store',
      partialize: (state) => ({
        waypoints: state.waypoints,
        settings: state.settings,
      }),
    },
  ),
);
