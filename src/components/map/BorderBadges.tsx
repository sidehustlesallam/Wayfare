import { memo, useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { BorderCrossing } from '../../types';

interface BorderBadgesProps {
  crossings: BorderCrossing[];
}

const borderIcon = L.divIcon({
  className: 'wayfare-border-badge',
  html: `<div style="
    font-size:18px;
    line-height:1;
    filter:drop-shadow(0 1px 2px rgba(26,35,50,.4));
  ">🛂</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function BorderBadgesComponent({ crossings }: BorderBadgesProps) {
  const markers = useMemo(() => crossings, [crossings]);

  return (
    <>
      {markers.map((crossing) => (
        <Marker
          key={`${crossing.fromCountry}-${crossing.toCountry}-${crossing.coordinates[0]}`}
          position={crossing.coordinates}
          icon={borderIcon}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            🛂 {crossing.fromCountry} → {crossing.toCountry}
          </Tooltip>
          <Popup>
            <strong>
              {crossing.fromCountry} → {crossing.toCountry}
            </strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
              {crossing.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export const BorderBadges = memo(BorderBadgesComponent);
