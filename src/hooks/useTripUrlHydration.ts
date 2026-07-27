import { useEffect, useRef } from 'react';
import { useTripStore } from '../store/useTripStore';
import { readSharedTripFromUrl } from '../utils/tripShare';

/**
 * After Zustand LocalStorage rehydration, apply a shared `#trip=` / `?trip=`
 * payload when present (URL wins over persisted session).
 */
export function useTripUrlHydration(): void {
  const hydrateFromShare = useTripStore((s) => s.hydrateFromShare);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;

    const applySharedTrip = () => {
      if (appliedRef.current) return;
      const shared = readSharedTripFromUrl();
      if (!shared) return;
      appliedRef.current = true;
      hydrateFromShare(shared.waypoints, shared.settings);
    };

    const persistApi = useTripStore.persist;

    if (persistApi.hasHydrated()) {
      applySharedTrip();
      return;
    }

    return persistApi.onFinishHydration(() => {
      applySharedTrip();
    });
  }, [hydrateFromShare]);
}
