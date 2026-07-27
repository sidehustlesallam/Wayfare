import { beforeEach, describe, expect, it } from 'vitest';
import { useTripStore } from './useTripStore';
import {
  decodeTrip,
  encodeTrip,
  type ShareableTrip,
} from '../utils/tripShare';

function resetStore() {
  useTripStore.setState({
    waypoints: [],
    settings: {
      drivingCapHours: 6,
      vehicleEfficiency: 7.5,
      fuelPricePerLitre: 1.65,
      fuelType: 'gasoline',
      unitSystem: 'metric',
      routeProfile: 'fastest',
    },
    segments: [],
    fullGeometry: [],
    steps: [],
    metrics: {
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      estimatedFuelCost: 0,
      estimatedFuelLitres: 0,
      overCapSegments: 0,
    },
    isRouting: false,
    routingError: null,
    elevationProfile: null,
    isElevationLoading: false,
    elevationError: null,
    elevationHover: null,
  });
}

describe('useTripStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('adds, deletes, and reorders waypoints', () => {
    const { addWaypoint, removeWaypoint, reorderWaypoints } =
      useTripStore.getState();

    addWaypoint({
      label: 'Paris',
      lat: 48.85,
      lng: 2.35,
      stopType: 'must-visit',
      countryCode: 'FR',
    });
    addWaypoint({
      label: 'Lyon',
      lat: 45.75,
      lng: 4.85,
      stopType: 'overnight',
      countryCode: 'FR',
    });
    addWaypoint({
      label: 'Nice',
      lat: 43.7,
      lng: 7.25,
      stopType: 'must-visit',
      countryCode: 'FR',
    });

    expect(useTripStore.getState().waypoints).toHaveLength(3);
    expect(useTripStore.getState().waypoints.map((w) => w.label)).toEqual([
      'Paris',
      'Lyon',
      'Nice',
    ]);

    reorderWaypoints(0, 2);
    expect(useTripStore.getState().waypoints.map((w) => w.label)).toEqual([
      'Lyon',
      'Nice',
      'Paris',
    ]);

    const lyonId = useTripStore.getState().waypoints[0].id;
    removeWaypoint(lyonId);
    expect(useTripStore.getState().waypoints.map((w) => w.label)).toEqual([
      'Nice',
      'Paris',
    ]);
  });

  it('reverses and clears the route', () => {
    const { addWaypoint, reverseWaypoints, clearAllWaypoints } =
      useTripStore.getState();

    addWaypoint({
      label: 'A',
      lat: 1,
      lng: 1,
      stopType: 'must-visit',
    });
    addWaypoint({
      label: 'B',
      lat: 2,
      lng: 2,
      stopType: 'must-visit',
    });

    reverseWaypoints();
    expect(useTripStore.getState().waypoints.map((w) => w.label)).toEqual([
      'B',
      'A',
    ]);

    clearAllWaypoints();
    expect(useTripStore.getState().waypoints).toHaveLength(0);
  });

  it('round-trips trip state through LZ-String encode/decode hydration', () => {
    const { addWaypoint, setDrivingCapHours, hydrateFromShare } =
      useTripStore.getState();

    addWaypoint({
      id: 'wp_share_1',
      label: 'Vienna',
      lat: 48.2,
      lng: 16.37,
      stopType: 'must-visit',
      countryCode: 'AT',
    });
    addWaypoint({
      id: 'wp_share_2',
      label: 'Budapest',
      lat: 47.5,
      lng: 19.04,
      stopType: 'overnight',
      countryCode: 'HU',
    });
    setDrivingCapHours(8);

    const snapshot = useTripStore.getState();
    const payload: ShareableTrip = {
      v: 1,
      waypoints: snapshot.waypoints,
      settings: snapshot.settings,
    };

    const encoded = encodeTrip(payload);
    expect(encoded.length).toBeGreaterThan(10);

    const decoded = decodeTrip(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.waypoints).toHaveLength(2);
    expect(decoded?.settings.drivingCapHours).toBe(8);

    resetStore();
    expect(useTripStore.getState().waypoints).toHaveLength(0);

    hydrateFromShare(decoded!.waypoints, decoded!.settings);
    const hydrated = useTripStore.getState();
    expect(hydrated.waypoints.map((w) => w.label)).toEqual([
      'Vienna',
      'Budapest',
    ]);
    expect(hydrated.settings.drivingCapHours).toBe(8);
  });
});
