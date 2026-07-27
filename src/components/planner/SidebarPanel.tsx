import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { BorderAlerts } from './BorderAlerts';
import { DrivingCapSelector } from './DrivingCapSelector';
import { ItinerarySummary } from './ItinerarySummary';
import { ItineraryView } from './ItineraryView';
import { RoadbookExport } from './RoadbookExport';
import { RouteProfileSelector } from './RouteProfileSelector';
import { ShareTripButton } from './ShareTripButton';
import { WaypointBuilder } from './WaypointBuilder';
import { FuelCalculator } from '../widget/FuelCalculator';
import { Button } from '../common/Button';
import { ToastViewport, useToast } from '../common/Toast';
import { useTripStore } from '../../store/useTripStore';

export function SidebarPanel() {
  const { toasts, showToast, dismiss } = useToast();
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const waypointCount = useTripStore((s) => s.waypoints.length);

  return (
    <aside className="flex h-full w-full flex-col border-r border-wayfare-mist/80 bg-white/95 backdrop-blur-sm lg:w-[380px] lg:shrink-0">
      <header className="space-y-3 border-b border-wayfare-mist px-4 py-4">
        <div>
          <p className="font-display text-3xl leading-none tracking-tight text-wayfare-ink">
            Wayfare
          </p>
          <p className="mt-1 text-sm text-wayfare-slate/70">
            Plan driveable, multi-stop road trips
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ShareTripButton
            onCopied={() =>
              showToast('Trip link copied to clipboard', 'success')
            }
            onError={(message) => showToast(message, 'error')}
          />
          <Button
            variant="secondary"
            className="w-full"
            disabled={waypointCount < 2}
            onClick={() => setItineraryOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            Itinerary View
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <ItinerarySummary />
        <WaypointBuilder />
        <RouteProfileSelector />
        <DrivingCapSelector />
        <FuelCalculator />
        <RoadbookExport
          onExported={(kind) =>
            showToast(
              kind === 'gpx' ? 'GPX downloaded' : 'Roadbook downloaded',
              'success',
            )
          }
          onError={(message) => showToast(message, 'error')}
        />
        <BorderAlerts />
      </div>

      <ItineraryView
        open={itineraryOpen}
        onClose={() => setItineraryOpen(false)}
      />
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </aside>
  );
}
