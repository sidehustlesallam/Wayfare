import { useMemo } from 'react';
import { useTripStore } from '../store/useTripStore';
import { collectBorderAlerts } from '../utils/borders';
import type { BorderCrossing } from '../types';

/**
 * Derives unique border alert cards from active route segments.
 * Full geometry intersection is deferred; V1 surfaces segment crossings.
 */
export function useBorderDetection(): BorderCrossing[] {
  const segments = useTripStore((s) => s.segments);

  return useMemo(() => {
    const all = segments.flatMap((segment) => segment.borderCrossings);
    return collectBorderAlerts(all);
  }, [segments]);
}
