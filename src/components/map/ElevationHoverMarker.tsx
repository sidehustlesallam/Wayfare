import { memo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import type { ElevationSample } from '../../types';

interface ElevationHoverMarkerProps {
  sample: ElevationSample | null;
}

function ElevationHoverMarkerComponent({
  sample,
}: ElevationHoverMarkerProps) {
  if (!sample) return null;

  return (
    <CircleMarker
      center={[sample.lat, sample.lng]}
      radius={9}
      pathOptions={{
        color: '#92400e',
        fillColor: '#d97706',
        fillOpacity: 0.95,
        weight: 2,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -8]}>
        {Math.round(sample.elevationMeters)} m · {sample.distanceKm.toFixed(1)}{' '}
        km
      </Tooltip>
    </CircleMarker>
  );
}

export const ElevationHoverMarker = memo(ElevationHoverMarkerComponent);
