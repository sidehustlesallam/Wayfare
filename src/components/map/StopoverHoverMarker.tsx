import { memo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import type { StopoverHover } from '../../types';
import { formatDistance, formatDuration } from '../../utils/fuel';

interface StopoverHoverMarkerProps {
  hover: StopoverHover | null;
  unitSystem: 'metric' | 'imperial';
}

function StopoverHoverMarkerComponent({
  hover,
  unitSystem,
}: StopoverHoverMarkerProps) {
  if (!hover) return null;

  return (
    <CircleMarker
      center={hover.coordinates}
      radius={11}
      pathOptions={{
        color: '#92400e',
        fillColor: '#f59e0b',
        fillOpacity: 0.95,
        weight: 3,
      }}
    >
      <Tooltip permanent direction="top" offset={[0, -10]}>
        <strong>{hover.label}</strong>
        <br />
        {formatDuration(hover.driveMinutesFromTripStart)} from start ·{' '}
        {formatDistance(hover.distanceKmFromTripStart, unitSystem)}
      </Tooltip>
    </CircleMarker>
  );
}

export const StopoverHoverMarker = memo(StopoverHoverMarkerComponent);
