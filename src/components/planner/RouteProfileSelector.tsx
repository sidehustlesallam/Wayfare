import { Mountain, Route } from 'lucide-react';
import { isFeatureEnabled } from '../../config/features';
import { useTripStore } from '../../store/useTripStore';
import type { RouteProfile } from '../../types';
import { Button } from '../common/Button';

export function RouteProfileSelector() {
  const routeProfile = useTripStore((s) => s.settings.routeProfile);
  const setRouteProfile = useTripStore((s) => s.setRouteProfile);
  const isRouting = useTripStore((s) => s.isRouting);

  if (!isFeatureEnabled('scenicRouting')) {
    return null;
  }

  const select = (profile: RouteProfile) => {
    setRouteProfile(profile);
  };

  return (
    <section className="space-y-3">
      <header className="flex items-center gap-2">
        <Route className="h-4 w-4 text-wayfare-sky" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-wayfare-slate">
          Route profile
        </h2>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          className={`!justify-start !px-3 !py-2.5 text-left ${
            routeProfile === 'fastest'
              ? 'bg-wayfare-sky/15 text-wayfare-sky ring-1 ring-wayfare-sky/30'
              : 'bg-wayfare-mist/50'
          }`}
          disabled={isRouting}
          onClick={() => select('fastest')}
        >
          <span>
            <span className="block text-xs font-semibold">Fastest Motorway</span>
            <span className="block text-[11px] font-normal opacity-70">
              Prefer highways
            </span>
          </span>
        </Button>
        <Button
          variant="ghost"
          className={`!justify-start !px-3 !py-2.5 text-left ${
            routeProfile === 'scenic'
              ? 'bg-wayfare-forest/15 text-wayfare-forest ring-1 ring-wayfare-forest/30'
              : 'bg-wayfare-mist/50'
          }`}
          disabled={isRouting}
          onClick={() => select('scenic')}
        >
          <Mountain className="h-4 w-4 shrink-0" />
          <span>
            <span className="block text-xs font-semibold">Scenic / Secondary</span>
            <span className="block text-[11px] font-normal opacity-70">
              Avoid motorways
            </span>
          </span>
        </Button>
      </div>
    </section>
  );
}
