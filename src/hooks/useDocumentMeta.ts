import { useEffect } from 'react';
import { useTripStore } from '../store/useTripStore';
import { syncDocumentMeta } from '../utils/documentMeta';

/** Keep the document title / social meta in sync with the active itinerary. */
export function useDocumentMeta(): void {
  const waypoints = useTripStore((s) => s.waypoints);

  useEffect(() => {
    syncDocumentMeta(waypoints.map((wp) => wp.label));
  }, [waypoints]);
}
