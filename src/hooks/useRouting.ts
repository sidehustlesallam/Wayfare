import { useEffect, useRef } from 'react';
import type { RoutingAdapter } from '../services/routing/RoutingAdapter';
import { osrmService } from '../services/routing/OSRMService';
import { useTripStore } from '../store/useTripStore';
import { aggregateRouteMetrics } from '../utils/fuel';

interface UseRoutingOptions {
  adapter?: RoutingAdapter;
  enabled?: boolean;
}

/**
 * Watches waypoints + driving cap and refreshes the route via RoutingAdapter.
 * Fuel slider changes recalculate cost in the store without re-fetching.
 */
export function useRouting(options: UseRoutingOptions = {}): void {
  const { adapter = osrmService, enabled = true } = options;

  const waypoints = useTripStore((s) => s.waypoints);
  const drivingCapHours = useTripStore((s) => s.settings.drivingCapHours);
  const settings = useTripStore((s) => s.settings);
  const setRouteResult = useTripStore((s) => s.setRouteResult);
  const setRoutingStatus = useTripStore((s) => s.setRoutingStatus);
  const clearRoute = useTripStore((s) => s.clearRoute);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (!enabled) return;

    if (waypoints.length < 2) {
      clearRoute();
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setRoutingStatus(true, null);
      try {
        const result = await adapter.fetchRoute(
          { waypoints, drivingCapHours },
          controller.signal,
        );

        if (controller.signal.aborted) return;

        const current = settingsRef.current;
        const metrics = aggregateRouteMetrics(
          result.segments,
          current.vehicleEfficiency,
          current.fuelPricePerLitre,
          current.fuelType,
        );

        setRouteResult(result.segments, result.fullGeometry, metrics);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Routing request failed';
        setRoutingStatus(false, message);
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [
    waypoints,
    drivingCapHours,
    adapter,
    enabled,
    setRouteResult,
    setRoutingStatus,
    clearRoute,
  ]);
}
