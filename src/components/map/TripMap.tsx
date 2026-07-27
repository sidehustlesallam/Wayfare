import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '../../config/defaults';
import { isFeatureEnabled } from '../../config/features';
import { useBorderDetection } from '../../hooks/useBorderDetection';
import { useTripStore } from '../../store/useTripStore';
import { BorderBadges } from './BorderBadges';
import { CapMidpointMarkers } from './CapMidpointMarkers';
import { RoutePolylines } from './RoutePolylines';
import { WaypointMarkers } from './WaypointMarkers';

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522];
const DEFAULT_ZOOM = 5;

function FitBounds() {
  const map = useMap();
  const waypoints = useTripStore((s) => s.waypoints);
  const fullGeometry = useTripStore((s) => s.fullGeometry);

  useEffect(() => {
    const points =
      fullGeometry.length > 0
        ? fullGeometry.map((p) => [p.lat, p.lng] as [number, number])
        : waypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 10);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
  }, [map, waypoints, fullGeometry]);

  return null;
}

export function TripMap() {
  const waypoints = useTripStore((s) => s.waypoints);
  const segments = useTripStore((s) => s.segments);
  const fullGeometry = useTripStore((s) => s.fullGeometry);
  const crossings = useBorderDetection();

  const tileUrl = useMemo(() => {
    // customMapTiles gated for future providers
    if (isFeatureEnabled('customMapTiles')) {
      return OSM_TILE_URL;
    }
    return OSM_TILE_URL;
  }, []);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer attribution={OSM_ATTRIBUTION} url={tileUrl} />
      <FitBounds />
      <RoutePolylines segments={segments} fullGeometry={fullGeometry} />
      <CapMidpointMarkers segments={segments} />
      <WaypointMarkers waypoints={waypoints} />
      <BorderBadges crossings={crossings} />
    </MapContainer>
  );
}
