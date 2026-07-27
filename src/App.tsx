import { useRouting } from './hooks/useRouting';
import { useTripUrlHydration } from './hooks/useTripUrlHydration';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { useElevationProfile } from './hooks/useElevationProfile';
import { SidebarPanel } from './components/planner/SidebarPanel';
import { TripMap } from './components/map/TripMap';
import { ElevationProfileDrawer } from './components/map/ElevationProfileDrawer';

export default function App() {
  useTripUrlHydration();
  useDocumentMeta();
  useRouting();
  useElevationProfile();

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_left,_#e8eef4_0%,_#f7f9fc_45%,_#dfe8f0_100%)] print:h-auto print:overflow-visible lg:flex-row">
      <SidebarPanel />
      <main className="relative min-h-[45vh] flex-1 print:hidden lg:min-h-0">
        <TripMap />
        <ElevationProfileDrawer />
        <div className="pointer-events-none absolute bottom-3 left-3 z-[900] rounded bg-white/90 px-2 py-1 text-[10px] text-wayfare-slate/70 shadow-sm backdrop-blur">
          Powered by OpenStreetMap · OSRM · Photon · Nominatim · Open-Meteo · CARTO
        </div>
      </main>
    </div>
  );
}
