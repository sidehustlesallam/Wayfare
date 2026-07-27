import { memo, useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import type { RouteSegment } from '../../types';

interface CapMidpointMarkersProps {
  segments: RouteSegment[];
}

function CapMidpointMarkersComponent({ segments }: CapMidpointMarkersProps) {
  const midpoints = useMemo(
    () =>
      segments.filter(
        (segment): segment is RouteSegment & { midpointCoords: [number, number] } =>
          Boolean(segment.exceedsCap && segment.midpointCoords),
      ),
    [segments],
  );

  return (
    <>
      {midpoints.map((segment) => (
        <CircleMarker
          key={`mid-${segment.fromWaypointId}-${segment.toWaypointId}`}
          center={segment.midpointCoords}
          radius={8}
          pathOptions={{
            color: '#92400e',
            fillColor: '#d97706',
            fillOpacity: 0.9,
            weight: 2,
          }}
        >
          <Popup>
            Driving cap reached
            {segment.suggestedStopovers?.[0]
              ? ` · try ${segment.suggestedStopovers[0]}`
              : ''}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export const CapMidpointMarkers = memo(CapMidpointMarkersComponent);
