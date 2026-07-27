import type { RouteRequest, RouteResult } from '../../types';

/**
 * Abstraction for multi-stop routing providers.
 * UI components must depend on this interface, never on a concrete API.
 */
export interface RoutingAdapter {
  /**
   * Fetch a multi-stop driving route, decode geometry, and flag segments
   * that exceed the configured daily driving cap.
   */
  getRoute(request: RouteRequest, signal?: AbortSignal): Promise<RouteResult>;

  /**
   * Alias for `getRoute` — preferred call site name for live store wiring.
   */
  fetchRoute(request: RouteRequest, signal?: AbortSignal): Promise<RouteResult>;
}
