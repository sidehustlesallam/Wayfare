import { memo, useMemo } from 'react';
import { Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { RouteSegment } from '../../types';

interface RoutePolylinesProps {
  segments: RouteSegment[];
  fullGeometry: Array<{ lat: number; lng: number }>;
}

function RoutePolylinesComponent({
  segments,
  fullGeometry,
}: RoutePolylinesProps) {
  const normalPositions = useMemo((): LatLngExpression[] => {
    if (segments.length === 0) {
      return fullGeometry.map((p) => [p.lat, p.lng]);
    }
    return [];
  }, [segments, fullGeometry]);

  const segmentLines = useMemo(
    () =>
      segments.map((segment) => ({
        key: `${segment.fromWaypointId}-${segment.toWaypointId}`,
        exceedsCap: segment.exceedsCap,
        positions: segment.geometry.map(
          (p): LatLngExpression => [p.lat, p.lng],
        ),
      })),
    [segments],
  );

  if (segmentLines.length === 0 && normalPositions.length > 1) {
    return (
      <Polyline
        positions={normalPositions}
        pathOptions={{ color: '#3d7ea6', weight: 5, opacity: 0.85 }}
      />
    );
  }

  return (
    <>
      {segmentLines.map((line) => (
        <Polyline
          key={line.key}
          positions={line.positions}
          pathOptions={{
            color: line.exceedsCap ? '#d97706' : '#3d7ea6',
            weight: line.exceedsCap ? 6 : 5,
            opacity: 0.9,
            dashArray: line.exceedsCap ? '10 6' : undefined,
          }}
        />
      ))}
    </>
  );
}

export const RoutePolylines = memo(RoutePolylinesComponent);
