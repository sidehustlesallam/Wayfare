import { useEffect } from 'react';
import type { ElevationAdapter } from '../services/elevation/ElevationAdapter';
import { openMeteoElevationService } from '../services/elevation/OpenMeteoElevationService';
import { useTripStore } from '../store/useTripStore';

interface UseElevationOptions {
  adapter?: ElevationAdapter;
  enabled?: boolean;
}

/** Fetch an elevation profile whenever the active route geometry changes. */
export function useElevationProfile(options: UseElevationOptions = {}): void {
  const { adapter = openMeteoElevationService, enabled = true } = options;

  const fullGeometry = useTripStore((s) => s.fullGeometry);
  const setElevationProfile = useTripStore((s) => s.setElevationProfile);
  const setElevationStatus = useTripStore((s) => s.setElevationStatus);
  const setElevationHover = useTripStore((s) => s.setElevationHover);

  useEffect(() => {
    if (!enabled) return;

    if (fullGeometry.length < 2) {
      setElevationProfile(null);
      setElevationHover(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setElevationStatus(true, null);
      try {
        const profile = await adapter.profileRoute(fullGeometry, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setElevationProfile(profile);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : 'Elevation lookup failed';
        setElevationStatus(false, message);
        setElevationProfile(null);
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [
    fullGeometry,
    adapter,
    enabled,
    setElevationProfile,
    setElevationStatus,
    setElevationHover,
  ]);
}
