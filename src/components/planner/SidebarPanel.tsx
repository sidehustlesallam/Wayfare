import { BorderAlerts } from './BorderAlerts';
import { DrivingCapSelector } from './DrivingCapSelector';
import { ItinerarySummary } from './ItinerarySummary';
import { ShareTripButton } from './ShareTripButton';
import { WaypointBuilder } from './WaypointBuilder';
import { FuelCalculator } from '../widget/FuelCalculator';
import { ToastViewport, useToast } from '../common/Toast';

export function SidebarPanel() {
  const { toasts, showToast, dismiss } = useToast();

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
        <ShareTripButton
          onCopied={() =>
            showToast('Trip link copied to clipboard', 'success')
          }
          onError={(message) => showToast(message, 'error')}
        />
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <ItinerarySummary />
        <WaypointBuilder />
        <DrivingCapSelector />
        <FuelCalculator />
        <BorderAlerts />
      </div>

      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </aside>
  );
}
