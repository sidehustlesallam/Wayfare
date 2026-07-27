import { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Waypoint } from '../../types';

interface WaypointMarkersProps {
  waypoints: Waypoint[];
}

function createNumberedIcon(index: number, stopType: Waypoint['stopType']): L.DivIcon {
  const isOvernight = stopType === 'overnight';
  const bg = isOvernight ? '#1e4d3a' : '#3d7ea6';

  return L.divIcon({
    className: 'wayfare-marker',
    html: `<div style="
      background:${bg};
      color:#fff;
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(26,35,50,.35);
      font:700 11px/1 'Source Sans 3',sans-serif;
    "><span style="transform:rotate(45deg)">${index + 1}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function WaypointMarkersComponent({ waypoints }: WaypointMarkersProps) {
  const icons = useMemo(
    () =>
      waypoints.map((wp, index) => createNumberedIcon(index, wp.stopType)),
    [waypoints],
  );

  return (
    <>
      {waypoints.map((waypoint, index) => (
        <Marker
          key={waypoint.id}
          position={[waypoint.lat, waypoint.lng]}
          icon={icons[index]}
        >
          <Popup>
            <strong>{waypoint.label}</strong>
            <br />
            <span className="capitalize">{waypoint.stopType.replace('-', ' ')}</span>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export const WaypointMarkers = memo(WaypointMarkersComponent);
